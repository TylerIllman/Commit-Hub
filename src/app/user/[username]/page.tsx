import { currentUser } from "@clerk/nextjs/server";

import CommitCalendar from "~/app/_components/CommitCalendar";
// import "react-calendar-heatmap/dist/styles.css";
// import "~/styles/calStyles.css";
import { db } from "~/server/db";

interface UserPageProps {
  params: {
    username: string;
  };
}

const Page = async ({ params }: UserPageProps) => {
  const { username } = params;
  const activeUser = await currentUser();
  const user = await db.user.findFirst({
    where: {
      userName: username,
    },
  });

  if (!user) {
    return <div>No user</div>;
  }
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
    <div className="flex w-full max-w-[1600px] flex-col gap-4">
      <div className="flex w-full justify-start gap-2">
        {/* TODO: replace smile with the user's emoji */}
        <div className="flex items-center justify-center rounded-full bg-background-800 p-4">
          <span className="text-6xl">😊</span>
        </div>
        <div />
        <div className="gap-4">
          {/* TODO: add full name to local db */}
          <h1 className="text-8xl font-bold">{user.userName}</h1>
          <p className="text-2xl text-primary-500">@{user.userName}</p>
          {/* this is my page {user.fullName} */}
        </div>
      </div>
      <div className="w-full rounded-lg bg-background-800 p-6">
        <CommitCalendar />
      </div>
    </div>
  );
};

export default Page;
