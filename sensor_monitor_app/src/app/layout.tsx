import type { Metadata } from "next";
import "./globals.css";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: "Create Next App",
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
        {children}
      </body>
    </html>
  );
}
