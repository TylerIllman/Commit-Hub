"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { user } = useUser();

  if (user?.username) {
    redirect(`/${user.username}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center text-5xl font-bold md:text-6xl lg:text-8xl">
      <h1>Turn Plans Into</h1>
      <div className="sm:p-0.5 lg:p-2"></div>
      <h1 className="rounded-md bg-primary px-4 py-1">Commitments</h1>
      <div className="p-4"></div>
    </main>
  );
}
