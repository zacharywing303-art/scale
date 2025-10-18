"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import CreateTaskModal from "./CreateTaskModal";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

type Task = {
  id: string;
  name: string;
  assignedDate: string | Date | null;
  isDone: boolean;
};

export default function TaskModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const user = await getLoggedInUser();
        if (!user) return;

        const res = await fetch(`/api/tasks/user/${user.id}`);
        const data = await res.json();
        setTasks(data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const toggleDone = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t))
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-xl rounded shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">Task List</h2>

        {/* While loading */}
        {loading && (
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        )}

        {/* No tasks */}
        {!loading && tasks.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-6">
            There are no tasks currently assigned to you.
          </p>
        )}

        {/* Tasks list */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 border rounded bg-muted hover:bg-muted/60"
              >
                <div>
                  <h3
                    className={`font-medium ${
                      task.isDone ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assigned:{" "}
                    {task.assignedDate
                      ? format(new Date(task.assignedDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleDone(task.id)}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${
                        task.isDone ? "text-green-500" : ""
                      }`}
                    />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task */}
        <div className="mt-6">
          <Button className="w-full" onClick={() => setShowCreate(true)}>
            Create New Task
          </Button>
        </div>

        {showCreate && (
          <CreateTaskModal
            onClose={() => setShowCreate(false)}
            onBack={() => setShowCreate(false)}
          />
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { X, CheckCircle, Trash2, ArrowRight } from "lucide-react";
// import { Button } from "@/components/ui/button"; // if using ShadCN
// import { format } from "date-fns";
// import CreateTaskModal from "./CreateTaskModal";

// type Task = {
//   id: number;
//   title: string;
//   assignedDate: Date;
//   isDone: boolean;
// };

// const initialTasks: Task[] = [
//   {
//     id: 1,
//     title: "Call client to verify visit",
//     assignedDate: new Date(),
//     isDone: false,
//   },
//   {
//     id: 2,
//     title: "Review employee documents",
//     assignedDate: new Date(),
//     isDone: false,
//   },
// ];

// export default function TaskModal({
//   isOpen,
//   onClose,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
// }) {
//   const [tasks, setTasks] = useState<Task[]>(initialTasks);
//   const [showCreate, setShowCreate] = useState(false);

//   const toggleDone = (id: number) =>
//     setTasks(tasks.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t)));

//   const deleteTask = (id: number) => setTasks(tasks.filter((t) => t.id !== id));

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="bg-white w-full max-w-xl rounded shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
//         >
//           <X />
//         </button>

//         <h2 className="text-xl font-semibold mb-4">Task List</h2>

//         <div className="space-y-4">
//           {tasks.map((task) => (
//             <div
//               key={task.id}
//               className="flex items-start justify-between p-3 border rounded bg-muted hover:bg-muted/60"
//             >
//               <div>
//                 <h3
//                   className={`font-medium ${
//                     task.isDone ? "line-through text-gray-400" : ""
//                   }`}
//                 >
//                   {task.title}
//                 </h3>
//                 <p className="text-xs text-muted-foreground">
//                   Assigned: {format(task.assignedDate, "PPP")}
//                 </p>
//               </div>
//               <div className="flex gap-2 items-center">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => toggleDone(task.id)}
//                 >
//                   <CheckCircle
//                     className={`w-4 h-4 ${task.isDone ? "text-green-500" : ""}`}
//                   />
//                 </Button>
//                 <Button variant="ghost" size="icon">
//                   <ArrowRight className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => deleteTask(task.id)}
//                 >
//                   <Trash2 className="w-4 h-4 text-red-500" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Create Task */}
//         <div className="mt-6">
//           <Button className="w-full" onClick={() => setShowCreate(true)}>
//             Create New Task
//           </Button>
//         </div>
//         {showCreate && (
//           <CreateTaskModal
//             onClose={() => setShowCreate(false)}
//             onBack={() => {
//               setShowCreate(false);
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
