import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HeatMapCalendar from "~/components/CommitCalendar";
import TestCal from "~/components/test";

// import CalendarHeatmap from "react-calendar-heatmap";
// import "react-calendar-heatmap/dist/styles.css";
// import "~/styles/calStyles.css";
// import CommitCalendar from "~/components/CommitCalendar";
// import { db } from "~/server/db";

interface UserPageProps {
  params: {
    username: string;
  };
}

const Page = async ({ params }: UserPageProps) => {
  const { username } = params;
  const user = await currentUser();

  // may need to change this auth callback
  if (!user?.id) redirect(`/auth-callback?origin=/${username}`);

  if (user.username === username) {
    return (
      <>
        <div>this is my page {user.fullName}</div>
        <HeatMapCalendar />
        <div className="max-w-xl">
          <TestCal />
        </div>
        {/* <CommitCalendar /> */}
      </>
    );
  }

  return (
    <>
      <div>this is someone elses page {username}</div>
      <HeatMapCalendar />
    </>
  );
};

export default Page;
