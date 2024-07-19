"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { user } = useUser();

  if (user?.username) {
    redirect(`/${user.username}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-center text-8xl font-bold">Turn Plans Into</h1>
      <div className="p-2"></div>
      <h1 className="text-center text-8xl font-bold">
        <span className="rounded-md bg-primary px-4 py-1">Commitments</span>
      </h1>
      <div className="p-4"></div>
    </main>
  );
}
