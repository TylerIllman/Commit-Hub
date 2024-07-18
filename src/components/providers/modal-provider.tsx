"use client";

import { useEffect, useState } from "react";
import { CreateStreakModal } from "../modals/create-streak";
import { EditStreakModal } from "../modals/edit-streak";
export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateStreakModal />
      <EditStreakModal />
    </>
  );
};
