import type { Metadata } from "next";
import "./globals.css";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Navigation from "./components/Navigation";
import { ThemeProvider } from "@/components/theme-provider";
import Topbar from "./components/Topbar";


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
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="bg-background p-3 flex h-screen">
              <Navigation/>
              <div className="w-full">
                <Topbar/>
                {children}
              </div>
            </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
