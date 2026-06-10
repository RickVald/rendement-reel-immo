'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createSessionToken, setSessionCookie } from '@/lib/auth/session'

export interface LoginState {
  error?: string
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const redirectTo = String(formData.get('redirectTo') || '/admin/crm')

  if (!email || !password) {
    return { error: 'Email et mot de passe requis.' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: 'Identifiants invalides.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { error: 'Identifiants invalides.' }
  }

  const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role })
  await setSessionCookie(token)

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  redirect(redirectTo.startsWith('/admin') ? redirectTo : '/admin/crm')
}
