"use client";

import { useEffect, useState } from "react";
import { CreateStreakModal } from "../modals/create-streak";
export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateStreakModal />
    </>
  );
};
