"use client";

import { useUser } from "@clerk/clerk-react";

import CommitCalendar from "~/components/CommitCalendar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useModal } from "~/hooks/use-modal-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import type { streakWithCompletion } from "~/server/api/routers/user";
import { useEffect, useState } from "react";
import { StreakCompletion } from "@prisma/client";
import type { CalendarValue } from "~/server/api/routers/user";

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

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

  const userQuery = api.user.getUser.useQuery({ userName: username });
  const userId = userQuery.data?.user?.id;

  const [userStreaks, setUserStreaks] = useState<streakWithCompletion[]>([]);
  const [masterStreak, setMasterStreak] = useState<CalendarValue[]>([]);
  const [hasStreaks, setHasStreaks] = useState<boolean>(false);
  const [currStreak, setCurrStreak] = useState<number>(0);
  const [streaksCompletedToday, setStreakScompletdToday] = useState<number>(0);

  const streakCompletionMutation =
    api.streaks.addStreakCompletion.useMutation();

  const userOwnsPage = activeUser.user?.id == userQuery.data?.user?.id;

  const dateStart = new Date();
  dateStart.setHours(0, 0, 0, 0); // Start of today
  dateStart.setDate(dateStart.getDate() - 365);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // End of today

  const { data: streaksData, isSuccess } = api.user.getUserStreaks.useQuery(
    {
      //HACK: default val "" to remove linting error. This may cause problems. Shouldn't tho due enabled
      userId: userId ?? "",
      startDate: dateStart,
      endDate: todayEnd,
    },
    { enabled: !!userId },
  );

  useEffect(() => {
    if (isSuccess && streaksData) {
      //TODO: Fix incorrect call error (may need better typing in the tRPC route)
      setUserStreaks(streaksData.streaks);
      setMasterStreak(streaksData.masterStreak);
      setHasStreaks(streaksData.hasStreaks);
    }
  }, [streaksData, isSuccess]);

  if (!userQuery.isFetched || !activeUser.isLoaded) return <div>fetching</div>;

  if (!userQuery.data?.isUser || !userQuery.data.user) {
    return <div>No user</div>;
  }

  const handleStreakCompletion = (streakId: number) => {
    if (!userStreaks) {
      console.log("no streak");
      return;
    }
    streakCompletionMutation.mutate({
      streakId,
    });
    const updatedStreaks = userStreaks.map((streak) => {
      if (streak.id === streakId) {
        return { ...streak };
      }
      return streak;
    });
    setUserStreaks(updatedStreaks);
  };

  //HACK: Hard coding streakWithCompletion[] type may cause errors
  // const streaksArray = userStreaks ?? [];

  // const onStreakClick = (streakId: number) => {
  //   streakCompletionMutation.mutate({
  //     streakId,
  //   });
  // };

  return (
    <div className="flex w-full max-w-[1600px] flex-col">
      <div className="flex w-full justify-start gap-2">
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-4">
            <h1 className="whitespace-nowrap text-8xl font-bold">
              {userQuery.data.user.firstName} {userQuery.data.user.lastName}
            </h1>
          </div>

          <div className="p-1"></div>

          <div className="flex flex-row items-end gap-4">
            <span className="flex-nowrap whitespace-nowrap text-xl text-blue-600">
              @{userQuery.data.user.userName}
            </span>
            <span className="flex whitespace-nowrap text-xl text-muted-foreground">
              Joined: May 2024
            </span>
            <span className="whitespace-nowrap text-xl text-muted-foreground">
              Longest Streak: 42
            </span>
          </div>

          <div className="p-2"></div>
        </div>

        <div className="flex w-full justify-end">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center">
            <span className="text-text-400 text-xl">Current Streak</span>
            <span className="flex text-6xl font-bold">🔥 {currStreak}</span>
          </div>
        </div>
        <div className=" flex w-full justify-center">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg  p-6 text-center">
            <span className="text-text-400 text-xl">Completed Today</span>

            <span className="flex text-6xl font-bold">
              ✅ {streaksCompletedToday}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2"></div>

      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          {userOwnsPage ? (
            isSuccess && hasStreaks ? (
              userStreaks.map((streak) => {
                const today = new Date();
                return (
                  <Button
                    key={`streakbutton-${streak.id}`}
                    size="toggleIcon"
                    //TODO: Add ability to toggle active or inactive button using global state so doesnt require another DB call
                    variant={
                      // streak.completions.length > 0 &&
                      streak.completions[0]?.date &&
                      isSameDay(streak.completions[0].date, today)
                        ? "toggleIconActive"
                        : "toggleIconInactive"
                    }
                    onClick={() => handleStreakCompletion(streak.id)}
                  >
                    {streak.emoji}
                  </Button>
                );
              })
            ) : (
              <div>No streaks found</div>
            )
          ) : isSuccess && hasStreaks ? (
            userStreaks.map((streak) => {
              const today = new Date();
              return (
                <div
                  key={`streakbutton-${streak.id}`}
                  className={cn(
                    "flex h-24 w-24 items-center justify-center rounded-full border bg-card text-6xl",
                    {
                      "bg-primary":
                        // streak.completions.length > 0 &&
                        streak.completions[0]?.date &&
                        isSameDay(streak.completions[0].date, today),
                    },
                  )}
                >
                  {streak.emoji}
                </div>
              );
            })
          ) : (
            <div>Loading Streaks</div>
          )}
        </div>
      </div>
      <div className="p-4"></div>

      {isSuccess && hasStreaks ? (
        //TODO: Add link and description rendering
        <Card>
          <div className="p-6">
            {/* HACK: Add default [] to fix linting error. May cause problems */}
            <CommitCalendar values={masterStreak ?? []} />
          </div>
        </Card>
      ) : (
        <div>loading</div>
      )}

      <div className="p-4"></div>
      {isSuccess && hasStreaks ? (
        userStreaks.map((streak) => (
          <div key={`commitCal-${streak.id}`}>
            <Card>
              <div className="p-6">
                <h2 className="pb-4 text-5xl font-bold md:text-4xl">
                  {streak.emoji} {streak.name}
                </h2>
                <CommitCalendar values={streak.completions} />
              </div>
            </Card>
            <div className="p-4"></div>
          </div>
        ))
      ) : (
        <div>No streaks found</div>
      )}

      {userOwnsPage && (
        <div className="flex w-full items-center justify-center">
          <Button
            onClick={() => {
              onOpen("createStreak");
            }}
            // className="bg-primary-400 max-w-[400px] rounded-lg px-4 py-3 text-center"
          >
            Add New Streak
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
