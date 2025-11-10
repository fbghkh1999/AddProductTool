import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "افزودن محصول با دستیار هوشمند",
  description: "دستیار هوش مصنوعی با بررسی نام یا عکس محصولی که وارد کردی بهت کمک میکنه محصولت رو سریع تر بسازی و به باسلام اد کنی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
