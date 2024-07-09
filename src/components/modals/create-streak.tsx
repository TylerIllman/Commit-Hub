"use client";
import { Dialog, DialogContent, DialogHeader } from "~/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useOrigin } from "~/hooks/use-origin";
import { useState } from "react";
import { useModal } from "~/hooks/use-modal-store";
import { Label } from "~/components/ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const CreateStreakModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "createStreak";

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("in create streak modal");

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden bg-white p-0 text-black">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">
            Invite Friends
          </DialogTitle>
          <div className="p-6">
            <Label className="dark:text-secondary/70 text-xs font-bold uppercase text-zinc-500">
              Sever Invite Link
            </Label>
            <div className="mt-2 flex items-center gap-x-2">
              <Input
                readOnly
                className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button
                disabled={isLoading}
                size="icon"
                onClick={() => {
                  console.log("click");
                }}
              >
                {/* {copied ? ( */}
                {/*   <Check className="h-5 w-5" /> */}
                {/* ) : ( */}
                {/*   <Copy className="h-5 w-5" /> */}
                {/* )} */}
              </Button>
            </div>
            <Button
              onClick={() => {
                console.log("click");
              }}
              disabled={isLoading}
              variant="link"
              size="sm"
              className="mt-4 text-xs text-zinc-500"
            >
              Generate a new link
              {/* <RefreshCw className="ml-2 h-4 w-4" /> */}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
