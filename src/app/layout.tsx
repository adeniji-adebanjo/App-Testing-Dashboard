import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Testing Management Portal",
  description:
    "Multi-project testing management portal for managing test cases, defects, and metrics across multiple projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
