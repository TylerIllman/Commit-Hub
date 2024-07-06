import { currentUser } from "@clerk/nextjs/server";

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
  // if (!user?.id) redirect(`/auth-callback?origin=/${username}`);
  if (!user) {
    return (
      <div className="max-w-[1600] bg-accent-950">
        <div className="bg-primary-100">
          this is someone elses page {username}
        </div>
      </div>
    );
  }

  if (user.username === username) {
    return (
      <div className="w-full max-w-[1600px]">
        <div className="flex w-full justify-start gap-4">
          {/* TODO: replace smile with the user's emoji */}
          <div className="flex items-center justify-center rounded-full bg-background-800 p-4">
            <span className="text-6xl">😊</span>
          </div>
          <div />
          <h1 className="text-8xl font-bold">{user.fullName}</h1>
          this is my page {user.fullName}
        </div>
      </div>
    );
  }
};

export default Page;
