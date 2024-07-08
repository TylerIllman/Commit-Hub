"use client";

import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

import CommitCalendar from "~/app/_components/CommitCalendar";
// import "react-calendar-heatmap/dist/styles.css";
// import "~/styles/calStyles.css";
import { db } from "~/server/db";
import { api } from "~/trpc/react";

interface UserPageProps {
  params: {
    username: string;
  };
}

interface UserType {
  userName: string;
  id: string;
}

const Page = ({ params }: UserPageProps) => {
  const { username } = params;
  const { isSignedIn, activeUser, isLoaded } = useUser();
  const [user, setUser] = useState<null | UserType>(null);

  const res = api.user.getUser.useQuery({ userName: "ty" });
  console.log(res.data);
  // useEffect(() => {
  //   async function fetchUserData() {
  //     // try {
  //     // const res = await db.user.findFirst({
  //     //   where: {
  //     //     userName: username,
  //     //   },
  //     // });
  //     // setUser(res);
  //     // } catch (error) {
  //     //   console.log(error);
  //     // }
  //     const res = api.user.getUser.useQuery({ userName: "ty" });
  //     console.log(res);
  //   }
  //
  //   fetchUserData().catch(console.error);
  // });

  // if (!user) {
  //   return <div>No user</div>;
  // }
  // may need to change this auth callback
  // if (!user?.id) redirect(`/auth-callback?origin=/${username}`);
  // if (!user) {
  //   return (
  //     <div className="max-w-[1600] bg-accent-950">
  //       <div className="bg-primary-100">
  //         this is someone elses page {username}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex w-full max-w-[1600px] flex-col">
      <div className="flex w-full justify-start gap-2">
        {/* TODO: replace smile with the user's emoji */}

        <div className="flex flex-col">
          {/* TODO: add full name to local db */}
          <div className="flex flex-row items-center gap-4">
            {/* TODO: figure out how to give width preference to this di */}
            <h1 className="whitespace-nowrap text-8xl font-bold">
              Tyler Illman
            </h1>
          </div>

          <div className="p-1"></div>

          <div className="flex flex-row items-end gap-4">
            <span className="flex-nowrap whitespace-nowrap text-xl text-primary-500">
              {/* @{user.userName} */}
              @tylerillman
            </span>
            <span className="flex whitespace-nowrap text-xl text-text-400">
              Joined: 05 March 2024
            </span>
            <span className="whitespace-nowrap text-xl text-text-400">
              Longest Streak: 42
            </span>
            {/* this is my page {user.fullName} */}
          </div>

          <div className="p-2"></div>
        </div>

        <div className="flex w-full justify-end">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center">
            <span className="text-xl text-text-400">Current Streak</span>
            <span className="flex text-6xl font-bold">🔥42</span>
          </div>
        </div>
        <div className=" flex w-full justify-center">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg  p-6 text-center">
            <span className="text-xl text-text-400">Completed Today</span>

            <span className="flex text-6xl font-bold">✅ 4</span>
          </div>
        </div>
      </div>

      <div className="p-2"></div>

      <div className="flex flex-row gap-4">
        <div
          className=" flex h-24 w-24 items-center justify-center rounded-full bg-accent-500 text-6xl"
          onClick={() => {
            console.log("clicked");
          }}
        >
          🐻
        </div>
        <div className=" flex h-24 w-24 items-center justify-center rounded-full bg-accent-500 text-6xl">
          🤬
        </div>
        <div className=" flex h-24 w-24 items-center justify-center rounded-full bg-accent-500 text-6xl">
          🎲
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background-800 text-6xl">
          🦓
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background-800 text-6xl">
          🐯
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background-800 text-6xl">
          🍖
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background-800 text-6xl">
          🥓
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background-800 text-6xl">
          🐽
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full text-6xl">
          ➕
        </div>
      </div>

      <div className="p-4"></div>

      <div className="w-full rounded-lg bg-background-800 px-6 py-5">
        <CommitCalendar />
      </div>

      <h2 className="pb-4 pt-10 text-5xl font-bold">🐻 LeetCode</h2>
      <div className="w-full rounded-lg bg-background-800 px-6 py-5">
        <CommitCalendar />
      </div>

      <h2 className="pb-4 pt-10 text-5xl font-bold">🤬 Github Commits</h2>
      <div className="w-full rounded-lg bg-background-800 px-6 py-5">
        <CommitCalendar />
      </div>

      <div className="p-6"></div>

      <div className="flex w-full items-center justify-center">
        <button className="max-w-[400px] rounded-lg bg-primary-400 px-4 py-3 text-center">
          Add New Streak
        </button>
      </div>
    </div>
  );
};

export default Page;
