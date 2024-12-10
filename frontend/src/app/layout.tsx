import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/Toaster";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Website Monitor",
  description: "Monitor your websites in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WebSocketProvider>
            <div className="flex h-screen overflow-hidden">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6">{children}</div>
              </main>
            </div>
          </WebSocketProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
