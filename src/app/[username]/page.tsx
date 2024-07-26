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
import { ExternalLink, Loader2, Settings, Share } from "lucide-react";
import { formatDate } from "~/lib/utils";

interface UserPageProps {
  params: {
    username: string;
  };
}

type StreaksCompletedTodayType = Record<number, boolean>;
type StreaksLoadingType = Record<number, boolean>;

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
      //HACK: Force type as string to fix linting error
      setError(err as string);
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
  // const [currStreak, setCurrStreak] = useState<number>(0);
  const [completedTodayCount, setCompletedTodayCount] = useState(0); // State to store the count
  const [longestSteak, setLongestStreak] = useState(0);
  const [currentActiveStreak, setCurrentActiveStreak] = useState(0);
  const [streaksCompletedToday, setStreaksCompletedToday] =
    useState<StreaksCompletedTodayType>({});

  const [streakCompletionLoading, setStreakCompletionLoading] =
    useState<StreaksLoadingType>({});
  const [totalNumCompletions, setTotalNumCompletions] = useState(0);

  const streakCompletionMutation =
    api.streaks.addStreakCompletion.useMutation();

  const userOwnsPage = activeUser.user?.id == userQuery.data?.user?.id;
  // const userOwnsPage = true;

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
      setMasterStreak(streaksData.masterStreak);
      setHasStreaks(streaksData.hasStreaks);
      setLongestStreak(streaksData.longestStreak);
      setCurrentActiveStreak(streaksData.currentActiveStreak);

      if (streaksData.totalNumCompletions) {
        setTotalNumCompletions(streaksData.totalNumCompletions);
      }

      //TODO: Fix these calls should be more type safe
      if (streaksData.streaks) {
        setUserStreaks(streaksData.streaks);

        const today = new Date();
        const tempStreaksCompletedToday: StreaksCompletedTodayType = {};
        let countCompleted = 0;
        const tempStreaksLoading: StreaksLoadingType = {};

        streaksData.streaks.forEach((streak: streakWithCompletion) => {
          tempStreaksLoading[streak.id] = false;

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

        setStreakCompletionLoading(tempStreaksLoading);

        setCompletedTodayCount(countCompleted);
        setStreaksCompletedToday(tempStreaksCompletedToday);
      }
    }
  }, [streaksData, isSuccess]);

  if (!userQuery.isFetched || !activeUser.isLoaded)
    return (
      <div className="m-5 flex items-center justify-center">
        <Loader2 className="h-20 w-20 animate-spin text-primary" />
      </div>
    );

  if (!userQuery.data?.isUser || !userQuery.data.user) {
    return <div>No user</div>;
  }

  const handleStreakCompletion = (streakId: number) => {
    if (!userStreaks) {
      console.log("no streak");
      return;
    }
    //TODO: Convert this to have an indvividual is loading state per button
    setStreakCompletionLoading((prev) => ({
      ...prev,
      [streakId]: true,
    }));

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
          setStreakCompletionLoading((prev) => ({
            ...prev,
            [streakId]: false,
          }));
        },
        onError: () => {
          setStreakCompletionLoading((prev) => ({
            ...prev,
            [streakId]: false,
          }));
          console.log("error updating streak");
        },
      },
    );
  };

  return (
    <div className="flex w-full max-w-[1400px] flex-col">
      <div className="flex w-full justify-start gap-2 md:mb-4">
        <div className="flex flex-col">
          <div className="mb-2 flex flex-row items-center gap-4">
            <h1 className="mb-1 whitespace-nowrap text-6xl font-bold md:text-7xl lg:text-8xl">
              {userQuery.data.user.firstName} {userQuery.data.user.lastName}
            </h1>
            <Share
              onClick={() => {
                //TODO: Change base url to dynamic base url
                copy(`commit-hub.com/${username}`)
                  .then(() => console.log("text copied"))
                  .catch((err) => console.log(err));
              }}
              className="text-l flex cursor-pointer flex-row flex-nowrap whitespace-nowrap text-blue-600 hover:text-blue-400 md:hidden lg:text-xl"
            />
          </div>

          <div className="flex flex-row items-end gap-4">
            <div
              className="text-l hidden cursor-pointer flex-row flex-nowrap items-center justify-center whitespace-nowrap text-blue-600 hover:text-blue-400 md:flex lg:text-xl"
              onClick={() => {
                //TODO: Change base url to dynamic base url
                if (navigator.share) {
                  navigator
                    .share({
                      title: "Check this out!",
                      text: "I found this interesting: ",
                      url: `commit-hub.com/${username}`,
                    })
                    .then(() => {
                      console.log("Modal Openend");
                    })
                    .catch((error) => {
                      console.log("Error sharing:", error);
                    });
                } else {
                  copy(`commit-hub.com/${username}`)
                    .then(() => console.log("text copied"))
                    .catch((err) => console.log(err));
                }
              }}
            >
              <span>@{userQuery.data.user.userName}</span>
              <Share className="ml-1 h-5 w-5 md:ml-2" />
            </div>
            {userQuery.data.user.createdAt && (
              <span className="md:text-l hidden whitespace-nowrap text-sm text-muted-foreground md:flex lg:text-xl">
                {/* HACK: Force casting the type of this to a Date (Should be ok due database structure) */}
                Joined: {formatDate(userQuery.data.user.createdAt)}
              </span>
            )}
            {/* <span className="hidden whitespace-nowrap text-muted-foreground md:flex lg:text-xl"> */}
            {/*   Longest Streak: {longestSteak} */}
            {/* </span> */}
          </div>
        </div>

        <div className="hidden w-full justify-end md:flex">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center">
            <span className="text-text-400 md:text-xl">Streak Completions</span>
            <span className="flex font-bold md:text-6xl">
              🔥 {totalNumCompletions}
            </span>
          </div>
        </div>
        <div className="hidden w-full justify-center md:flex">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg text-center md:p-6">
            <span className="text-text-400 md:text-xl">Completed Today</span>

            <span className="flex font-bold md:text-6xl">
              ✅ {completedTodayCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-row justify-around md:hidden">
        <div className="flex flex-col items-center text-center">
          <span className="text-md mb-1 text-muted-foreground">
            Streak Completions
          </span>
          <span className="flex text-4xl font-bold">
            🔥 {totalNumCompletions}
          </span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-md mb-1 text-muted-foreground">
            Completed Today
          </span>
          <span className="flex text-4xl font-bold">
            ✅ {completedTodayCount}
          </span>
        </div>
      </div>
      {/* TODO: Check this styling for when a user has no streaks */}
      {/* <div className="p-2"></div> */}
      {/* <div className="flex flex-row items-center gap-4"> */}
      <div className="mb-2 flex flex-row items-center gap-4 md:mb-4">
        {isSuccess && hasStreaks ? (
          userStreaks.map((streak) => {
            const completedToday = streaksCompletedToday[streak.id];

            return userOwnsPage ? (
              <Button
                className="h-20 w-20 text-5xl md:h-24 md:w-24 md:text-6xl"
                key={`streakbutton-${streak.id}`}
                // size="toggleIcon"
                variant={
                  completedToday ? "toggleIconActive" : "toggleIconInactive"
                }
                onClick={() => handleStreakCompletion(streak.id)}
                disabled={streakCompletionLoading[streak.id]}
              >
                {streak.emoji}
              </Button>
            ) : (
              <div
                key={`streakview-${streak.id}`}
                className={cn(
                  "mb-2 flex h-20 w-20 cursor-default select-none items-center justify-center rounded-full border bg-card text-5xl sm:h-24 sm:w-24 md:text-6xl lg:text-6xl",
                  { "bg-primary": completedToday },
                )}
              >
                {streak.emoji}
              </div>
            );
          })
        ) : (
          //TODO: Have this check if the data has been loaded efore rendering nothing
          <></>
        )}
      </div>
      {/* </div> */}
      {/* <div className="p-4"></div> */}
      {isSuccess && hasStreaks ? (
        //TODO: Add link and description rendering
        <>
          <Card className="p-3 lg:p-6">
            <div>
              {/* HACK: Add default [] to fix linting error. May cause problems */}
              <CommitCalendar values={masterStreak ?? []} />
            </div>
          </Card>

          <div className="my-3 h-px w-full bg-gray-300 md:my-5" />
        </>
      ) : (
        //TODO: Have this check if the data has been loaded efore rendering nothing
        <></>
      )}

      {/* <div className="p-4"></div> */}
      {isSuccess && hasStreaks ? (
        //TODO: Add the ability to edit and delete streaks
        userStreaks.map((streak) => (
          <div key={`commitCal-${streak.id}`}>
            <Card className="mb-3 md:mb-6">
              <div className="p-3 md:p-6">
                <div className="flex flex-row items-center justify-between pb-2">
                  <div className="flex flex-row items-center">
                    <h2 className="mr-2 text-xl font-bold md:mr-4 md:text-4xl lg:text-5xl">
                      {streak.emoji} {streak.name}
                    </h2>
                    {/* <div className="p-2"></div> */}
                    {/* TODO: Convert this compoent into Shadcn button link variant */}
                    {streak.url && (
                      <ExternalLink
                        className="h-5 w-5 text-blue-600 hover:cursor-pointer hover:text-blue-400 md:h-8 md:w-8"
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
                    <Settings
                      className="h-5 w-5 text-muted-foreground hover:cursor-pointer hover:text-blue-400 md:h-8 md:w-8"
                      onClick={() => {
                        console.log("settings clicked: ", streak.id);
                        onOpen("editStreakSettings", {
                          streakId: streak.id,
                          streakName: streak.name,
                          streakEmoji: streak.emoji,
                          //HACK: Default string values for url and description may break
                          streakUrl: streak.url ?? "",
                          streakDescription: streak.description ?? "",
                          userStreaks,
                          setUserStreaks,
                        });
                      }}
                    />
                  )}
                </div>
                <p className="text-muted-foreground">{streak.description}</p>
                {/* <div className="p-2"></div> */}
                <CommitCalendar values={streak.completions} />
              </div>
            </Card>
            {/* <div className="p-4"></div> */}
          </div>
        ))
      ) : (
        <div className="flex justify-center align-middle">
          <Loader2 className="m-6 h-20 w-20 animate-spin text-primary" />
        </div>
        //TODO: Have this check if the data has been loaded efore rendering nothing
      )}
      {userOwnsPage && (
        <div className="flex w-full items-center justify-center">
          <Button
            onClick={() => {
              onOpen("createStreak", { userStreaks, setUserStreaks });
            }}
            // className="bg-primary-400 max-w-[400px] rounded-lg px-4 py-3 text-center"
          >
            {/* TODO: Stop this button from rendering while loading */}
            Add New Streak
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
