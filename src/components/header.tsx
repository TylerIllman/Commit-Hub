import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import MaxWidthWrapper from "./maxWidthWrapper";
import MobileNav from "./mobileNav";
import { buttonVariants } from "./ui/button";
import { UserButton } from "@clerk/nextjs";

const Navbar = async () => {
  const user = await currentUser();

  return (
    <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="z-40 flex font-semibold">
            CommitHub
          </Link>

          <MobileNav isAuth={!!user} />

          <div className="hidden items-center space-x-4 sm:flex">
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
                  My Streaks
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
