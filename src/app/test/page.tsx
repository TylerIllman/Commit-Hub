"use client";

import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

import CommitCalendar from "~/components/CommitCalendar";
import { useModal } from "~/hooks/use-modal-store";
import { api } from "~/trpc/react";

const Page = () => {
  return (
    <div className="flex w-full max-w-[1600px] flex-col">
      <div className="flex w-full justify-start gap-2">
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-4">
            <h1 className="whitespace-nowrap text-8xl font-bold">
              Tyler Illman
            </h1>
          </div>

          <div className="p-1"></div>

          <div className="flex flex-row items-end gap-4">
            <span className="text-primary-500 flex-nowrap whitespace-nowrap text-xl">
              {/* @{user.userName} */}
              @tylerillman
            </span>
            <span className="text-text-400 flex whitespace-nowrap text-xl">
              Joined: 05 March 2024
            </span>
            <span className="text-text-400 whitespace-nowrap text-xl">
              Longest Streak: 42
            </span>
            {/* this is my page {user.fullName} */}
          </div>

          <div className="p-2"></div>
        </div>

        <div className="flex w-full justify-end">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center">
            <span className="text-text-400 text-xl">Current Streak</span>
            <span className="flex text-6xl font-bold">🔥42</span>
          </div>
        </div>
        <div className=" flex w-full justify-center">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg  p-6 text-center">
            <span className="text-text-400 text-xl">Completed Today</span>

            <span className="flex text-6xl font-bold">✅ 4</span>
          </div>
        </div>
      </div>

      <div className="p-2"></div>

      <div className="flex flex-row gap-4">
        <div
          className=" bg-accent-500 flex h-24 w-24 items-center justify-center rounded-full text-6xl"
          onClick={() => {
            console.log("clicked");
          }}
        >
          🐻
        </div>
        <div className=" bg-accent-500 flex h-24 w-24 items-center justify-center rounded-full text-6xl">
          🤬
        </div>
      </div>

      <div className="p-4"></div>

      <div className="bg-background-800 w-full rounded-lg px-6 py-5">
        <CommitCalendar />
      </div>

      <h2 className="pb-4 pt-10 text-5xl font-bold">🐻 LeetCode</h2>
      <div className="bg-background-800 w-full rounded-lg px-6 py-5">
        <CommitCalendar />
      </div>

      <h2 className="pb-4 pt-10 text-5xl font-bold">🤬 Github Commits</h2>
      <div className="bg-background-800 w-full rounded-lg px-6 py-5">
        <CommitCalendar />
      </div>

      <div className="p-6"></div>
    </div>
  );
};

export default Page;
