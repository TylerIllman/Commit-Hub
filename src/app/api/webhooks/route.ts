import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "~/trpc/react";
import { db } from "~/server/db";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("event type: ", evt.type);
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console

  if (evt.type != "user.created") {
    return new Response("Error occured -- incorrect event type");
  }

  const { id } = evt.data;
  const username = evt.data.username;
  // console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  // console.log("Webhook body:", body);

  console.log("THIS IS THE EVENT: ", evt);

  const dbUser = await db.user.findFirst({
    where: {
      id: id,
    },
  });

  if (!dbUser) {
    await db.user.create({
      data: {
        id: id,
        userName: username,
      },
    });
  }

  return new Response("", { status: 200 });
}