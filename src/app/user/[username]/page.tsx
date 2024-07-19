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
import type { CalendarValue } from "~/server/api/routers/user";
import { isSameDay } from "~/lib/utils";
import { ExternalLink, FileCog, Share } from "lucide-react";

interface UserPageProps {
  params: {
    username: string;
  };
}

type StreaksCompletedTodayType = Record<number, boolean>;

const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setError(null);
      // Optionally reset the copied status after a delay
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError(err);
      setIsCopied(false);
      console.error("Failed to copy:", err);
    }
  };

  return { copy, isCopied, error };
};

const Page = ({ params }: UserPageProps) => {
  // TODO: Need to add an auth callback for when user doesnt exist, or is missing details
  const { onOpen } = useModal();
  const { username } = params;
  const activeUser = useUser();

  const userQuery = api.user.getUser.useQuery({ userName: username });
  const userId = userQuery.data?.user?.id;
  const { copy, isCopied, error } = useClipboard();

  const [userStreaks, setUserStreaks] = useState<streakWithCompletion[]>([]);
  const [masterStreak, setMasterStreak] = useState<CalendarValue[]>([]);
  const [hasStreaks, setHasStreaks] = useState<boolean>(false);
  const [currStreak, setCurrStreak] = useState<number>(0);
  const [completedTodayCount, setCompletedTodayCount] = useState(0); // State to store the count
  const [longestSteak, setLongestStreak] = useState(0);
  const [currentActiveStreak, setCurrentActiveStreak] = useState(0);
  const [streaksCompletedToday, setStreaksCompletedToday] =
    useState<StreaksCompletedTodayType>({});
  const [streakCompletionLoading, setStreakCompletionLoading] = useState(false);
  const [totalNumCompletions, setTotalNumCompletions] = useState(0);

  const streakCompletionMutation =
    api.streaks.addStreakCompletion.useMutation();

  //WARNING: Due to deleting prev tylerillman user from db, when adding it back it required new unique
  //(NOT) the one from clerk causing mismatch in userOwnsPage
  const userOwnsPage = activeUser.user?.username == username;
  // const userOwnsPage = activeUser.user?.id == userQuery.data?.user?.id;

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
      setLongestStreak(streaksData.longestStreak);
      setCurrentActiveStreak(streaksData.currentActiveStreak);
      setTotalNumCompletions(streaksData.totalNumCompletions);

      const today = new Date();
      const tempStreaksCompletedToday: StreaksCompletedTodayType = {};
      let countCompleted = 0;

      streaksData.streaks.forEach((streak: streakWithCompletion) => {
        if (
          streak.completions[0] &&
          isSameDay(streak.completions[0].date, today)
        ) {
          tempStreaksCompletedToday[streak.id] = true;
          countCompleted++;
        } else {
          tempStreaksCompletedToday[streak.id] = false;
        }
      });

      setCompletedTodayCount(countCompleted);
      setStreaksCompletedToday(tempStreaksCompletedToday);
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
    //TODO: Convert this to have an indvividual is loading state per button
    setStreakCompletionLoading(true);

    const tempStreaksCompletedToday = streaksCompletedToday;

    if (tempStreaksCompletedToday[streakId]) {
      setCompletedTodayCount(completedTodayCount - 1);
      setTotalNumCompletions(totalNumCompletions - 1);

      const tempUserStreaks = userStreaks.map((streak) => {
        if (streak.id == streakId) {
          return {
            ...streak,
            completions: streak.completions.slice(1),
          };
        }

        return streak;
      });

      const tempMasterStreak = masterStreak;
      if (
        tempMasterStreak[0] &&
        isSameDay(tempMasterStreak[0].date, todayEnd)
      ) {
        tempMasterStreak[0].count -= 1;
      }

      setMasterStreak(tempMasterStreak);
      setUserStreaks(tempUserStreaks);
    } else {
      setCompletedTodayCount(completedTodayCount + 1);
      setTotalNumCompletions(totalNumCompletions + 1);

      const tempUserStreaks = userStreaks.map((streak) => {
        if (streak.id == streakId) {
          return {
            ...streak,
            completions: [
              { date: new Date(), count: 1 },
              ...streak.completions,
            ],
          };
        }

        return streak;
      });

      let tempMasterStreak = masterStreak;
      if (
        tempMasterStreak[0] &&
        isSameDay(tempMasterStreak[0].date, todayEnd)
      ) {
        tempMasterStreak[0].count += 1;
      } else {
        tempMasterStreak = [
          { date: new Date(), count: 1 },
          ...tempMasterStreak,
        ];
      }

      setMasterStreak(tempMasterStreak);
      setUserStreaks(tempUserStreaks);
    }

    tempStreaksCompletedToday[streakId] = !tempStreaksCompletedToday[streakId];
    setStreaksCompletedToday(tempStreaksCompletedToday);

    streakCompletionMutation.mutate(
      {
        streakId,
      },
      {
        onSuccess: () => {
          setStreakCompletionLoading(false);
        },
        onError: () => {
          setStreakCompletionLoading(false);
          console.log("error updating streak");
        },
      },
    );
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
            <div
              className="flex cursor-pointer flex-row flex-nowrap whitespace-nowrap text-xl text-blue-600 hover:text-blue-400"
              onClick={() => {
                //TODO: Change base url to dynamic base url
                copy(`commit-hub.com/${username}`)
                  .then(() => console.log("text copied"))
                  .catch((err) => console.log(err));
              }}
            >
              <span>@{userQuery.data.user.userName}</span>
              <div className="p-1"></div>
              <Share />
            </div>
            <span className="flex whitespace-nowrap text-xl text-muted-foreground">
              Joined: May 2024
            </span>
            <span className="whitespace-nowrap text-xl text-muted-foreground">
              Longest Streak: {longestSteak}
            </span>
          </div>

          {/* <div className="p-2"></div> */}
        </div>

        <div className="flex w-full justify-end">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center">
            <span className="text-text-400 text-xl">Streak Completions</span>
            <span className="flex text-6xl font-bold">
              🔥 {totalNumCompletions}
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
      {/* TODO: Check this styling for when a user has no streaks */}
      <div className="p-2"></div>
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          {isSuccess && hasStreaks ? (
            userStreaks.map((streak) => {
              const completedToday = streaksCompletedToday[streak.id];

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
                  disabled={streakCompletionLoading}
                >
                  {streak.emoji}
                </Button>
              ) : (
                <div
                  key={`streakview-${streak.id}`}
                  className={cn(
                    "flex h-24 w-24 cursor-default select-none items-center justify-center rounded-full border bg-card text-6xl",
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
        //TODO: Add the ability to edit and delete streaks
        userStreaks.map((streak) => (
          <div key={`commitCal-${streak.id}`}>
            <Card>
              <div className="p-6">
                <div className="flex flex-row items-center justify-between pb-2">
                  <div className="flex flex-row items-center">
                    <h2 className=" text-5xl font-bold md:text-4xl">
                      {streak.emoji} {streak.name}
                    </h2>
                    <div className="p-2"></div>
                    {/* TODO: Convert this compoent into Shadcn button link variant */}
                    {streak.url && (
                      <ExternalLink
                        className="text-blue-600 hover:cursor-pointer hover:text-blue-400"
                        onClick={() => {
                          //HACK: Need to have proper error handling for:
                          if (!streak.url) {
                            console.log("error: no streak url");
                            return;
                          }
                          window.open(streak.url, "_blank")?.focus();
                        }}
                      />
                    )}
                  </div>
                  {userOwnsPage && (
                    <FileCog
                      className="text-muted-foreground hover:cursor-pointer hover:text-blue-400"
                      onClick={() => {
                        console.log("settings clicked: ", streak.id);
                        onOpen("editStreakSettings", {
                          streakId: streak.id,
                          streakName: streak.name,
                          streakEmoji: streak.emoji,
                          //HACK: Default string values for url and description may break
                          streakUrl: streak.url ?? "",
                          streakDescription: streak.description ?? "",
                        });
                      }}
                    />
                  )}
                </div>
                <p className="text-muted-foreground">{streak.description}</p>
                <div className="p-2"></div>
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
