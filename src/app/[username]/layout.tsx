import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen justify-center overflow-scroll px-8 py-8">
      {children}
    </div>
  );
}
