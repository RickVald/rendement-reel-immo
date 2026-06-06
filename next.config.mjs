/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer', 'pdfkit', 'fontkit', 'linebreak'],
}

export default nextConfig
