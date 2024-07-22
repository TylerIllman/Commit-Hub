"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useOrigin } from "~/hooks/use-origin";
import { useState } from "react";
import { useModal } from "~/hooks/use-modal-store";
import { Label } from "~/components/ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { api } from "~/trpc/react";
import { streakWithCompletion } from "~/server/api/routers/user";

export const createStreakFormSchema = z.object({
  name: z.string().min(1, { message: "A streak name is required" }),
  url: z
    .string()
    .optional()
    .refine((data) => !data || z.string().url().safeParse(data).success, {
      message: "The URL must be in a valid format or left blank",
    }),
  description: z
    .string()
    .max(500, {
      message: "The description must be shorter than 500 characters",
    })
    .optional(),
  emoji: z.string().emoji({ message: "This must contain a single emoji" }),
});

export const CreateStreakModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "createStreak";
  const [copied, setCopied] = useState(false);
  const createStreakMutation = api.streaks.createNewStreak.useMutation();

  // const test = api.user.testMutation.useMutation();
  // const res = test.mutate();

  const form = useForm({
    resolver: zodResolver(createStreakFormSchema),
    defaultValues: {
      name: "",
      emoji: "",
      url: "",
      description: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof createStreakFormSchema>) => {
    console.log("Values: ", values);
    const cleanVals = {
      ...values,
      url: values.url != "" ? values.url : undefined,
      description: values.description != "" ? values.description : undefined,
    };
    console.log(cleanVals);
    createStreakMutation.mutate(cleanVals, {
      onSuccess: (res) => {
        console.log("res: ", res);
        console.log("init userStreak: ", data.userStreaks);
        if (res.success) {
          //TODO: Fix below linting
          if (data.setUserStreaks) {
            data.setUserStreaks((prevStreaks) => [...prevStreaks, res.data]);
          }
        }
      },
      //TODO: On failure push toaster notifications
    });
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden bg-white p-0 text-black">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">
            Create A New Streak
          </DialogTitle>
          {/* <DialogDescription>* icons denote required fields</DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70">
                      Streak name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter the streak name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70">
                      Emoji *
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Add an Emoji to represent this streak"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70">
                      Url
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter a URL"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter a short description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading}>Create New Streak</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
