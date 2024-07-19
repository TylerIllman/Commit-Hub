import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";

import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "~/components/providers/modal-provider";
import Navbar from "~/components/Navbar";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "Commithub",
  description: "Commitgraph for your daily habits",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <ThemeProvider>
            <TRPCReactProvider>
              <ModalProvider />
              <Navbar />
              {children}
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
