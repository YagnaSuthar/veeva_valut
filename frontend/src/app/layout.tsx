import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "@/css/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veeva Vault Hub",
  description: "Your Veeva interview prep resource",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <QueryProvider>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            {children}
          </main>
          
          <footer className="site-footer">
            <div className="container footer-container">
              <Link href="/" className="footer-logo">
                <img src="/logo.svg" alt="Veeva Vault Hub Logo" style={{ width: '32px', height: '32px' }} />
                <span>Veeva Vault Hub</span>
              </Link>
              <p className="footer-text">
                Your trusted, community-driven resource for Veeva interview questions, release notes, and articles.
              </p>
              <div className="footer-copy">
                &copy; {new Date().getFullYear()} Veeva Vault Hub. All rights reserved.
              </div>
            </div>
          </footer>

          <ToastContainer position="top-center" autoClose={3000} />
        </QueryProvider>
      </body>
    </html>
  );
}
