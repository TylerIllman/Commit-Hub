"use client";

import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

type CalendarValue = {
  date: Date;
  count: number;
};

const today: Date = new Date();

const CommitCalendar: React.FC = () => {
  const randomValues: CalendarValue[] = getRange(200).map((index) => {
    return {
      date: shiftDate(today, -index),
      count: getRandomInt(1, 3),
    };
  });
  // Example data
  return (
    <>
      <CalendarHeatmap
        startDate={shiftDate(today, -365)}
        endDate={today}
        values={randomValues}
        classForValue={(value) => {
          if (!value) {
            return "color-empty";
          }
          return `color-github-${value.count}`;
        }}
        tooltipDataAttrs={(value: CalendarValue | null) => {
          if (!value) {
            return {};
          }
          return {
            "data-tooltip-id": "daily-tooltip",
            "data-tooltip-content": `${value.count} submissions on ${value.date.toISOString().slice(0, 10)}`,
          };
        }}
      />
      <Tooltip id="daily-tooltip" />
    </>
  );
};

function shiftDate(date: Date, numDays: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
}

function getRange(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default CommitCalendar;
