"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import TaskModal from "@/app/dashboard/home/tasks/TaskModal";

export default function TaskList() {
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState<
    { id: string; name: string; dueDate?: string | Date; isDone: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const user = getLoggedInUser();
        if (!user) return;

        let url = "";
        if (user.role === "AGENCY_ADMIN") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/agency/${user.agency?.id}`;
        } else {
          url = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/user/${user.id}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        // Sort by closest due date
        const sorted = (data || []).sort((a: any, b: any) => {
          const da = new Date(a.dueDate).getTime();
          const db = new Date(b.dueDate).getTime();
          return da - db;
        });

        setTasks(sorted.slice(0, 4)); // first 4
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Task List</h3>
        <button
          onClick={() => setShowTasks(true)}
          className="text-sm text-secondary hover:underline"
        >
          View All
        </button>
      </div>

      <TaskModal isOpen={showTasks} onClose={() => setShowTasks(false)} />

      {loading ? (
        <p className="text-sm text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks available.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start leading-tight">
              •{" "}
              {`${task.name} ${
                task.dueDate
                  ? `Due ${format(new Date(task.dueDate), "MMM d")}`
                  : ""
              }`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import TaskModal from "@/app/dashboard/home/tasks/TaskModal";

// const tasks = [
//   "Review Exceptions",
//   "Complete Weekly Audit",
//   "Submit Hours & Mileage to Payroll",
//   "Schedule Quarterly Review",
//   "Billing Report Verification",
// ];

// export default function TaskList() {
//   const router = useRouter();
//   const [showTasks, setShowTasks] = useState(false);

//   const handleViewAll = () => {
//     setShowTasks(true); // or your actual route
//   };

//   return (
//     <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-semibold text-primary">Task List</h3>
//         <button
//           onClick={handleViewAll}
//           className="text-sm text-secondary hover:underline"
//         >
//           View All
//         </button>
//       </div>
//       <TaskModal isOpen={showTasks} onClose={() => setShowTasks(false)} />

//       <ul className="space-y-2 text-sm">
//         {tasks.slice(0, 4).map((task, i) => (
//           <li key={i} className="flex items-start leading-tight">
//             • {task}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
