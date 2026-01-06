import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow ngrok and other dev tunnels
  allowedDevOrigins: [
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.ngrok.app",
  ],
};

export default withNextIntl(nextConfig);
