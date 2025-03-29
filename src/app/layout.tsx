import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CategoryList } from "@/components/CategoryList"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Todo App",
  description: "A modern todo app built with Next.js and shadcn/ui",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen pb-14">
          <Header />
          <main className="bg-background">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row relative">
                {/* Sidebar with sticky positioning */}
                <aside className="w-full md:w-80 bg-muted/40 border-b md:border-b-0 md:border-r border-border">
                  <div className="p-4 md:p-6 md:sticky md:top-14"> {/* Adjusted top to account for header */}
                    <CategoryList />
                  </div>
                </aside>
                {/* Main content */}
                <div className="flex-1 p-4 md:p-6">
                  {children}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
