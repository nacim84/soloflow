// Root layout that redirects to locale-specific layout
// This is required by next-intl to handle the [locale] routing

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
