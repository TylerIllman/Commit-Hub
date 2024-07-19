import { SignInButton, SignOutButton } from "@clerk/nextjs";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <SignInButton />
      <SignOutButton />
    </main>
  );
}
