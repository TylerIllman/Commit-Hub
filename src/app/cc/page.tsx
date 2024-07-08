"use client";

import { useEffect, useState } from "react";

import { db } from "~/server/db";

interface UserType {
  userName: string;
  id: string;
}

const Page = () => {
  const [user, setUser] = useState<null | UserType>(null);

  useEffect(() => {
    async function fetchUserData() {
      // try {
      // const res = await db.user.findFirst({
      //   where: {
      //     userName: "tylerillman",
      //   },
      // });
      const res = { userName: "ty", id: "1" };
      setUser(res);
      // } catch (error) {
      //   console.log(error);
      // }
    }

    fetchUserData().catch(console.error);
  });

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

  return <div>test</div>;
};

export default Page;
