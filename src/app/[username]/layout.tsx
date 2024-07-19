import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" bg-primary-950 text-text-50 flex min-h-screen justify-center overflow-scroll px-8 py-8">
      {children}
    </div>
  );
}
