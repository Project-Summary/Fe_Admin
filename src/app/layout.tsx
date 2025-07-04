import { beVietnamPro, inter } from '@/lib/font';
import Provider from '@/providers/Provider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <title> Admin KWAI</title>
      <body className={`${inter.variable} ${beVietnamPro.variable} antialiased`}>
        <Provider>{children}</Provider>
        {/* Toast notifications */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
