import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className={inter.className}>
        <QueryProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <ToastContainer position="top-center" autoClose={3000} />
        </QueryProvider>
      </body>
    </html>
  );
}
