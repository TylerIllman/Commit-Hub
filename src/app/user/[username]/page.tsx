"use client";

import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

import CommitCalendar from "~/components/CommitCalendar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useModal } from "~/hooks/use-modal-store";
import { api } from "~/trpc/react";

interface UserPageProps {
  params: {
    username: string;
  };
}

const Page = ({ params }: UserPageProps) => {
  // TODO: Need to add an auth callback for when user doesnt exist, or is missing details
  const { onOpen } = useModal();
  const { username } = params;
  const activeUser = useUser();

  const user = api.user.getUser.useQuery({ userName: username });
  const userId = user.data?.user?.id;

  const streakCompletionMutation =
    api.streaks.addStreakCompletion.useMutation();

  const dateStart = new Date();
  dateStart.setHours(0, 0, 0, 0); // Start of today
  dateStart.setDate(dateStart.getDate() - 365);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // End of today

  const streakCompletionsRes = api.user.getStreakCompletions.useQuery(
    {
      startDate: dateStart,
      endDate: todayEnd,
    },
    { enabled: !!userId },
  );

  const userStreaks = api.user.getUserStreaks.useQuery(
    {
      id: userId,
    },
    { enabled: !!userId },
  );

  // if (userStreaks?.data?.hasStreaks) {
  //   console.log("streaks: ", userStreaks.data.streaks);
  // }

  if (!user.isFetched || !activeUser.isLoaded) return <div>fetching</div>;

  if (!user.data?.isUser || !user.data.user) {
    return <div>No user</div>;
  }

  const userOwnsPage = activeUser.user?.id == user.data?.user?.id;

  // NOTE: could error exist where date of PC running server is different to client?
  const onStreakClick = (streakId: number) => {
    streakCompletionMutation.mutate({
      streakId,
    });
  };

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
            <span className="flex-nowrap whitespace-nowrap text-xl text-blue-600">
              {/* @{user.userName} */}
              @tylerillman
            </span>
            <span className="flex whitespace-nowrap text-xl text-muted-foreground">
              Joined: 05 March 2024
            </span>
            <span className="whitespace-nowrap text-xl text-muted-foreground">
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

      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          {userStreaks.data?.streaks!.length > 0 ? (
            userStreaks.data?.streaks!.map((streak, index) => (
              <Button
                key={`streakbutton-${streak.id}`}
                size={"toggleIcon"}
                variant={"toggleIconInactive"}
                onClick={() => {
                  onStreakClick(streak.id);
                }}
              >
                {streak.emoji}
              </Button>
            ))
          ) : (
            <div>No streaks found</div>
          )}
        </div>
      </div>

      <div className="p-4"></div>

      {streakCompletionsRes.isFetched ? (
        <Card>
          <div className="p-6">
            <CommitCalendar
              values={streakCompletionsRes.data?.totalCompletionsByDate}
            />
          </div>
        </Card>
      ) : (
        <div>loading</div>
      )}

      <div className="p-4"></div>
      {userStreaks.data?.streaks!.length > 0 &&
      streakCompletionsRes.isFetched ? (
        userStreaks.data?.streaks!.map((streak, index) => (
          <>
            <Card key={`commitCal-${streak.id}`}>
              <div className="p-6">
                <h2 className="pb-4 text-5xl font-bold md:text-4xl">
                  {streak.emoji} {streak.name}
                </h2>
                <CommitCalendar
                  values={
                    streakCompletionsRes.data?.streakCompletions[streak.id]
                  }
                />
              </div>
            </Card>
            <div className="p-4"></div>
          </>
        ))
      ) : (
        <div>No streaks found</div>
      )}

      {/* <Card> */}
      {/*   <div className="p-6"> */}
      {/*     <CommitCalendar /> */}
      {/*   </div> */}
      {/* </Card> */}
      {/**/}
      {/* <div className="p-4"></div> */}
      {/**/}
      {/* <Card> */}
      {/*   <div className="p-6"> */}
      {/*     <h2 className="pb-4 text-5xl font-bold md:text-4xl">🐻 LeetCode</h2> */}
      {/*     <CommitCalendar /> */}
      {/*   </div> */}
      {/* </Card> */}
      {/**/}
      {/**/}
      {/* <Card> */}
      {/*   <div className="p-6"> */}
      {/*     <h2 className="pb-4 text-5xl font-bold md:text-4xl">🐻 LeetCode</h2> */}
      {/*     <CommitCalendar /> */}
      {/*   </div> */}
      {/* </Card> */}
      {/**/}
      <div className="p-6"></div>

      {userOwnsPage && (
        <div className="flex w-full items-center justify-center">
          <button
            onClick={() => {
              onOpen("createStreak");
            }}
            className="bg-primary-400 max-w-[400px] rounded-lg px-4 py-3 text-center"
          >
            Add New Streak
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
