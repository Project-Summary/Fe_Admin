import { beVietnamPro, inter } from '@/lib/font';
import Provider from '@/providers/Provider';

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
      </body>
    </html>
  );
}
