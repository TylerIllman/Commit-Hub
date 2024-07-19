import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Checks if `d2` is the day directly after `d1`.
 * @param {Date} d1 - The first date.
 * @param {Date} d2 - The second date to compare against.
 * @returns {boolean} True if `d2` is the day after `d1`, false otherwise.
 */
export function isNextDay(d1: Date, d2: Date) {
  const nextDay = new Date(d1);
  nextDay.setDate(d1.getDate() + 1);

  return isSameDay(nextDay, d2);
}

export const formatDate = (initDate: Date) => {
  try {
    const date = new Date(initDate);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Failed to format date:", error);
    return "Recently"; // Return a default or error-specific string
  }
};
