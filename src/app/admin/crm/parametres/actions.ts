'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

export interface ActionState {
  error?: string
  success?: string
}

const MIN_PASSWORD_LENGTH = 10

/** L'utilisateur connecté change son propre mot de passe (nécessite l'ancien). */
export async function changePasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: 'Non connecté.' }

  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Les deux mots de passe ne correspondent pas.' }
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return { error: 'Utilisateur introuvable.' }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) return { error: 'Mot de passe actuel incorrect.' }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  return { success: 'Mot de passe mis à jour.' }
}

/** Un admin crée un compte pour un membre de l'équipe. */
export async function createUserAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Accès réservé aux administrateurs.' }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const roleInput = String(formData.get('role') ?? 'VIEWER')
  const role = roleInput === 'ADMIN' ? 'ADMIN' : 'VIEWER'
  const password = String(formData.get('password') ?? '')

  if (!email || !email.includes('@')) return { error: 'Adresse email invalide.' }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Le mot de passe temporaire doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'Un compte existe déjà avec cet email.' }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { email, name: name || null, role, passwordHash } })

  revalidatePath('/admin/crm/parametres')
  return { success: `Compte créé pour ${email}.` }
}

/** Un admin réinitialise le mot de passe d'un membre de l'équipe (mot de passe oublié). */
export async function resetUserPasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Accès réservé aux administrateurs.' }

  const userId = String(formData.get('userId') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

  revalidatePath('/admin/crm/parametres')
  return { success: 'Mot de passe réinitialisé.' }
}

/** Un admin supprime un compte (sauf le sien). */
export async function deleteUserAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Accès réservé aux administrateurs.' }

  const userId = String(formData.get('userId') ?? '')
  if (userId === session.userId) return { error: 'Impossible de supprimer votre propre compte.' }

  await prisma.user.delete({ where: { id: userId } })

  revalidatePath('/admin/crm/parametres')
  return { success: 'Compte supprimé.' }
}
