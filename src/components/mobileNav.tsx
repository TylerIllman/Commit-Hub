"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, House, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// import {use}

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  const { user } = useUser();

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />

      {isOpen ? (
        <div className="fixed inset-0 z-0 w-full animate-in fade-in-20 slide-in-from-top-5">
          <ul className="absolute grid w-full gap-3 border-b border-zinc-200 bg-white px-10 pb-8 pt-20 shadow-xl">
            {!isAuth ? (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-up")}
                    className="flex w-full items-center font-semibold text-green-600"
                    href="/sign-up"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-in")}
                    className="flex w-full items-center font-semibold"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/user-profile")}
                    className="flex w-full items-center font-semibold"
                    href={`/${user?.username}`}
                  >
                    <House className="mr-2 h-7 w-7" /> My Streaks
                  </Link>
                </li>
                {/* <li className="my-3 h-px w-full bg-gray-300" /> */}
                {/* <li> */}
                {/*   <div className="flex w-full items-center font-semibold"> */}
                {/*     <UserButton /> */}
                {/*     <span className="ml-2">My Account</span> */}
                {/*   </div> */}
                {/* </li> */}
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
