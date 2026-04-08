import type { Metadata } from "next";
import "../styles/index.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "ResourceHub - Planning System",
  description: "AI-driven resource planning and management project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
