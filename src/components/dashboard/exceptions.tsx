"use client";

import React from "react";

const exceptions = {
  "Unknown Client": 3,
  "Unknown Employee": 2,
  "Missing Service": 4,
  "Missing Call In": 5,
  "Missing Call Out": 4,
  "No Call At All": 1,
  "No Show": 2,
  "Unknown ID/Phone": 3,
};

const totalExceptions = Object.values(exceptions).reduce((a, b) => a + b, 0);

export default function ExceptionsSummary() {
  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md flex flex-col items-center">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Visit Exceptions
      </h3>

      <div className="relative w-40 h-40 rounded-full border-[10px] border-primary/20 flex items-center justify-center mb-6">
        <span className="text-center font-bold text-xl text-primary">
          {totalExceptions}
          <br />
          <span className="text-sm font-medium text-muted-foreground">
            Total
          </span>
        </span>
      </div>

      <ul className="text-sm space-y-1 w-full">
        {Object.entries(exceptions).map(([type, count]) => (
          <li key={type} className="flex justify-between">
            <span>{type}</span>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
