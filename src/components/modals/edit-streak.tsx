"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useOrigin } from "~/hooks/use-origin";
import { useEffect, useState } from "react";
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
import { UpdateStreakDetailsSchema } from "~/server/api/routers/streaks";

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

export const EditStreakModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "editStreakSettings";
  const [copied, setCopied] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const updateStreakMutation = api.streaks.updateStreakDetails.useMutation();
  const deleteStreakMutation = api.streaks.deleteStreak.useMutation();

  const form = useForm({
    resolver: zodResolver(createStreakFormSchema),
    defaultValues: {
      name: "",
      emoji: "",
      url: "",
      description: "",
    },
  });

  useEffect(() => {
    if (data.streakName) form.setValue("name", data.streakName);
    if (data.streakEmoji) form.setValue("emoji", data.streakEmoji);
    if (data.streakUrl) form.setValue("url", data.streakUrl);
    if (data.streakDescription)
      form.setValue("description", data.streakDescription);
  }, [data, form]); //WARNING: I don't think this is the correct dependencies

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof createStreakFormSchema>) => {
    //HACK: this needs to be converted to error handling, currently just hack to remove data.streakId?
    if (!data.streakId) {
      console.log("no streak id");
      return;
    }

    console.log("values: ", values);
    console.log("desc: ", values.description);
    console.log(
      "test: ",
      values.description != "" ? values.description : undefined,
    );

    const cleanVals = {
      ...values,
      streakId: data.streakId,
      url: values.url != "" ? values.url : undefined,
      description: values.description != "" ? values.description : undefined,
    };

    console.log("clean Vals: ", cleanVals);

    updateStreakMutation.mutate(cleanVals);
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (!data.streakId) {
      console.log("ERROR: No streak Id");
      return;
    }

    deleteStreakMutation.mutate(
      { streakId: data.streakId },
      {
        onSuccess: () => {
          //TODO: Make this actually safe for checks
          if (data.setUserStreaks) {
            data.setUserStreaks((prevStreaks) =>
              prevStreaks.filter((streak) => streak.id !== data.streakId),
            );
          }
        },
      },
    );
    onClose();
    setShowConfirmation(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden p-0">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">
            Edit Streak
          </DialogTitle>
          {/* <DialogDescription>Create a new daily streak</DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase">
                      Streak name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="text-xs font-bold uppercase">
                      Emoji
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="text-xs font-bold uppercase">
                      Url
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="text-xs font-bold uppercase">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter a short description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4">
              <Button
                onClick={handleDeleteClick}
                disabled={isLoading}
                variant="destructive"
              >
                Delete Streak
              </Button>
              <Button className="mb-2 sm:mb-0" disabled={isLoading}>
                Update Streak Details
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogTitle>
              Are you sure you want to delete this streak?
            </DialogTitle>
            <DialogFooter>
              <Button onClick={handleConfirmDelete} variant="destructive">
                Confirm Delete
              </Button>
              <Button
                className="mb-2 sm:mb-0"
                onClick={() => {
                  setShowConfirmation(false);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};
