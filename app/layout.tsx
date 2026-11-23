import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Food Delivery App",
  description: "Zomato & Swiggy inspired full-stack food delivery application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#FAF9F6] text-[#1C1C1C] antialiased`}>
        {children}
      </body>
    </html>
  );
}
