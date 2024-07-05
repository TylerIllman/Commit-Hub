import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

interface FileChatPageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: FileChatPageProps) => {
  const { fileid } = params;
  const user = await currentUser();

  if (!user?.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  return <div>{user.fullName}</div>;
};

export default Page;
