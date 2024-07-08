"use client";

import React, { useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const TestCal: React.FC = () => {
  return (
    <CalendarHeatmap
      startDate={new Date("2016-01-01")}
      endDate={new Date("2016-04-01")}
      values={[
        { date: "2016-01-01", count: 1 },
        { date: "2016-01-22", count: 2 },
        { date: "2016-01-30", count: 3 },
      ]}
    />
  );
};

export default TestCal;
