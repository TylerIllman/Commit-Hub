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
import { isSameDay } from "~/lib/utils";

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
  const [completedTodayCount, setCompletedTodayCount] = useState(0); // State to store the count
  const [longestSteak, setLongestStreak] = useState(0);
  const [currentActiveStreak, setCurrentActiveStreak] = useState(0);

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
      let countCompleted = 0;
      const today = new Date();
      streaksData.streaks.forEach((streak: streakWithCompletion) => {
        if (
          streak.completions[0] &&
          isSameDay(streak.completions[0].date, today)
        )
          countCompleted += 1;
      });

      //TODO: Fix incorrect call error (may need better typing in the tRPC route)
      setUserStreaks(streaksData.streaks);
      setMasterStreak(streaksData.masterStreak);
      setHasStreaks(streaksData.hasStreaks);
      setCompletedTodayCount(countCompleted);
      setLongestStreak(streaksData.longestStreak);
      setCurrentActiveStreak(streaksData.currentActiveStreak);
    }
  }, [streaksData, isSuccess]);

  if (!userQuery.isFetched || !activeUser.isLoaded) return <div>fetching</div>;

  if (!userQuery.data?.isUser || !userQuery.data.user) {
    return <div>No user</div>;
  }

  const handleStreakCompletion = (
    streakId: number,
    completions: CalendarValue[],
  ) => {
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
              Longest Streak: {longestSteak}
            </span>
          </div>

          <div className="p-2"></div>
        </div>

        <div className="flex w-full justify-end">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center">
            <span className="text-text-400 text-xl">Current Streak</span>
            <span className="flex text-6xl font-bold">
              🔥 {currentActiveStreak}
            </span>
          </div>
        </div>
        <div className=" flex w-full justify-center">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg  p-6 text-center">
            <span className="text-text-400 text-xl">Completed Today</span>

            <span className="flex text-6xl font-bold">
              ✅ {completedTodayCount}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2"></div>

      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          {isSuccess && hasStreaks ? (
            userStreaks.map((streak) => {
              const today = new Date();
              const completedToday =
                streak.completions[0]?.date &&
                isSameDay(streak.completions[0].date, today);

              return userOwnsPage ? (
                <Button
                  key={`streakbutton-${streak.id}`}
                  size="toggleIcon"
                  variant={
                    completedToday ? "toggleIconActive" : "toggleIconInactive"
                  }
                  onClick={() =>
                    handleStreakCompletion(streak.id, streak.completions)
                  }
                >
                  {streak.emoji}
                </Button>
              ) : (
                <div
                  key={`streakview-${streak.id}`}
                  className={cn(
                    "flex h-24 w-24 items-center justify-center rounded-full border bg-card text-6xl",
                    { "bg-primary": completedToday },
                  )}
                >
                  {streak.emoji}
                </div>
              );
            })
          ) : (
            <div>No streaks found</div>
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
