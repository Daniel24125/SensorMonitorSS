import type { Metadata } from "next";
import "./globals.css";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Navigation from "./components/template/Navigation";
import { ThemeProvider } from "@/components/theme-provider";
import Topbar from "./components/template/topbar/Topbar";
import { SocketProvider } from "@/contexts/socket";
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: "Real-time Sensor Monitoring",
  description: "This application serves as a GUI for sensor monitoring",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession()

  if(!session) redirect("/auth/login")

  
    
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main className="bg-background p-3 flex h-screen">
                <Navigation/>
                <div className="w-full flex flex-col">
                  <Topbar/>
                  <section id="content" className="flex flex-col items-start justify-start h-full w-full px-3 flex-grow flex-shrink basis-auto" >
                    {children}
                  </section>
                </div>
                <Toaster/>
              </main>
          </ThemeProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
