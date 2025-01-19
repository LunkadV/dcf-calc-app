// app/layout.tsx
import "./globals.css"; // Changed from "@/app/globals.css"
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-white text-xl font-bold">
                  DCF Calculator
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Home
                </Link>
                <Link
                  href="/calculator"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Calculator
                </Link>
                <Link
                  href="/about"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
