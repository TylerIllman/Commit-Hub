import { ThemeProvider } from "next-themes";
import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen justify-center overflow-scroll p-4 md:p-8">
      {children}
    </div>
  );
}
