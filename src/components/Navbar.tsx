"use client";

import Link from "next/link";
import { ArrowRight, House } from "lucide-react";
import MaxWidthWrapper from "./maxWidthWrapper";
import MobileNav from "./mobileNav";
import { Button, buttonVariants } from "./ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

const Navbar = () => {
  const { user } = useUser();
  const { setTheme } = useTheme();

  return (
    <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex font-bold">
            <span className="px-0.5 py-0.5">Commit</span>
            <span className="rounded-sm bg-primary px-1.5 py-0.5">Hub</span>
          </Link>

          {/* <MobileNav isAuth={!!user} /> */}

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className={buttonVariants({
                    size: "sm",
                  })}
                  href="/sign-up"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href={`/${user.username}`}
                >
                  <House className="mr-2 h-5 w-5" /> My Streaks
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
