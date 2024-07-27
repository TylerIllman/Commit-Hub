"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "~/components/ui/button";

export default function Home() {
  const { user } = useUser();

  // if (user?.username) {
  //   redirect(`/${user.username}`);
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center text-5xl font-bold dark:bg-red-700 md:text-6xl lg:text-8xl">
      <h1>Turn Plans Into</h1>
      <div className="sm:p-0.5 lg:p-2"></div>
      <h1 className="rounded-md bg-primary px-4 py-1">Commitments</h1>
      <div className="p-4"></div>
      <Link
        className={buttonVariants({
          size: "sm",
        })}
        href="/sign-up"
      >
        Get Started <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
      {/* HACK: Janky work around to centre on screen */}
      <div className="pb-[80px]"></div>
    </main>
  );
}
