"use client";

import React, { useState } from "react";
// import './HeatMapCalendar.css';

type CalendarValue = {
  date: string; // ISO date string
  count: number; // Number of events or items for that date
};

const HeatMapCalendar: React.FC = () => {
  // Example data
  const [values, setValues] = useState<CalendarValue[]>([
    { date: "2023-07-01", count: 1 },
    { date: "2023-07-02", count: 3 },
    { date: "2023-07-03", count: 2 },
    { date: "2023-07-04", count: 5 },
    { date: "2023-07-05", count: 0 },
    // Add more dates as needed
  ]);

  // Function to determine the color based on count
  const getColor = (count: number): string => {
    if (count === 0) return "lightgray";
    if (count <= 2) return "lightgreen";
    if (count <= 4) return "green";
    return "darkgreen";
  };

  return (
    <div className="calendar">
      {values.map(({ date, count }) => (
        <div
          key={date}
          className="day"
          style={{ backgroundColor: getColor(count) }}
        >
          <span>{date}</span>
          <span>{count}</span>
        </div>
      ))}
    </div>
  );
};

export default HeatMapCalendar;
