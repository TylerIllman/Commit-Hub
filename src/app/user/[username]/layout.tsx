import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen justify-center bg-primary-950 px-8 pt-8 text-text-50">
      {children}
    </div>
  );
}
