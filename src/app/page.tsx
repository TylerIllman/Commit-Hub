"use client";

import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { useTheme } from "next-themes";

export default function Home() {
  const { setTheme, theme } = useTheme();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <SignInButton />
      <SignOutButton />
      <Button
        onClick={() => {
          setTheme("dark");
        }}
      >
        Dark
      </Button>
      <Button
        onClick={() => {
          setTheme("light");
        }}
      >
        light
      </Button>
      <div>{theme}</div>
    </main>
  );
}
