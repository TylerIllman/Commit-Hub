"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { NextResponse } from "next/server";
import { api } from "~/trpc/react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin");

  const resp = api.auth.authCallback.useQuery();

  if (resp.data?.success) {
    router.push(origin ?? "/dashboard");
  }

  if (resp.data && !resp.data.success) {
    router.push("/sign-in");
  }

  console.log(resp);

  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="text-xl font-semibold">Setting up your account...</h3>
        <p>You will be redirected automatically. </p>
      </div>
    </div>
  );
};

export default Page;
