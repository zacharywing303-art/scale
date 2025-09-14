"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getChatSocket, disconnectChatSocket } from "@/lib/socket/chat";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ThreadListItem = {
  id: string;
  title: string;
  lastMessage: string;
  lastTime: string;
};

type Message = {
  id: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
};

type ThreadDetail = {
  id: string;
  participants: any[];
  messages: Message[];
};

const AGENCY_CODE = "UNITY124";
const user = getLoggedInUser();

const mapRole = (
  role: string | undefined
): "SYSTEM_ADMIN" | "AGENCY_ADMIN" | "AGENCY_USER" => {
  if (
    role === "SYSTEM_ADMIN" ||
    role === "AGENCY_ADMIN" ||
    role === "AGENCY_USER"
  ) {
    return role;
  }
  return "AGENCY_USER";
};

const ME = {
  id: user?.id ?? "",
  name: user?.name ?? "",
  participantType: "USER" as const,
  agencyCode: user?.agency?.code ?? AGENCY_CODE,
  role: mapRole(user?.role),
};

export default function InboxPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<ReturnType<typeof getChatSocket> | null>(null);

  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingChat, setPendingChat] = useState<any | null>(null);

  // Normalize thread data safely
  const normalizeThread = (t: any): ThreadListItem => {
    const others = Array.isArray(t.participants)
      ? t.participants.filter((p: any) => p.participantId !== ME.id)
      : [];
    return {
      id: t.id,
      title: others.map((p: any) => p.displayName).join(", ") || "Unknown",
      lastMessage: t.messages?.[t.messages.length - 1]?.content ?? "",
      lastTime:
        t.messages?.[t.messages.length - 1]?.createdAt ??
        t.startedAt ??
        new Date().toISOString(),
    };
  };

  // Load threads
  const loadThreads = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/chat/threads?agencyCode=${encodeURIComponent(
          ME.agencyCode
        )}&me=${encodeURIComponent(ME.id)}&meType=${encodeURIComponent(
          ME.participantType
        )}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setThreads(data.map(normalizeThread));
    } catch (err) {
      console.error("Load threads error:", err);
      setThreads([]);
    }
  };

  const loadThreadDetail = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/threads/${id}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelectedThread(data);
    } catch (err) {
      console.error("Load thread detail error:", err);
      setSelectedThread(null);
    }
  };

  // Load participants
  const loadParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/chat/participants?agencyCode=${encodeURIComponent(
          ME.agencyCode
        )}&excludeId=${encodeURIComponent(
          ME.id
        )}&participantType=MOBILE_EMPLOYEE`
      );
      if (!res.ok) throw new Error(await res.text());
      setParticipants(await res.json());
    } catch (err) {
      console.error("loadParticipants error:", err);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Init socket
  useEffect(() => {
    const socket = getChatSocket({
      userId: ME.id,
      displayName: ME.name,
      participantType: ME.participantType,
      agencyCode: ME.agencyCode,
      role: ME.role,
    });
    socketRef.current = socket;

    socket.removeAllListeners("newMessage");
    socket.on(
      "newMessage",
      ({ threadId, message }: { threadId: string; message: Message }) => {
        setSelectedThread((prev) =>
          prev && prev.id === threadId
            ? { ...prev, messages: [...prev.messages, message] }
            : prev
        );
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessage: message.content,
                  lastTime: message.createdAt,
                }
              : t
          )
        );
      }
    );

    socket.removeAllListeners("chatStarted");
    socket.on("chatStarted", (thread: ThreadDetail) => {
      setSelectedThread(thread);
      setThreads((prev) => {
        const exists = prev.some((t) => t.id === thread.id);
        return exists
          ? prev.map((t) => (t.id === thread.id ? normalizeThread(thread) : t))
          : [normalizeThread(thread), ...prev];
      });
      setPendingChat(null);
    });

    socket.on("connect_error", (err: any) => {
      console.error("Socket connect error:", err.message);
    });

    return () => disconnectChatSocket();
  }, []);

  useEffect(() => {
    if (selectedThread?.id && socketRef.current) {
      socketRef.current.emit("joinThread", { threadId: selectedThread.id });
    }
  }, [selectedThread?.id]);

  useEffect(() => {
    loadThreads();
  }, []);

  // Send message
  const handleSend = () => {
    if (!newMessage.trim() || !selectedThread || !socketRef.current) return;
    socketRef.current.emit("sendMessage", {
      threadId: selectedThread.id,
      content: newMessage.trim(),
      senderType: ME.participantType,
      senderId: ME.id,
    });
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Thread List */}
      <div className="w-80 border-r overflow-y-auto bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>

          <Dialog onOpenChange={(open) => open && loadParticipants()}>
            <DialogTrigger asChild>
              <Button size="sm">New Chat</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Start a new chat</DialogTitle>
              </DialogHeader>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name"
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loadingParticipants ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  participants
                    .filter((p) =>
                      p.displayName.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((p) => (
                      <div
                        key={p.participantId || p.id}
                        className="p-2 border rounded cursor-pointer hover:bg-muted"
                        onClick={() => setPendingChat(p)}
                      >
                        {p.displayName}{" "}
                        <span className="text-xs opacity-60">
                          ({p.participantType})
                        </span>
                      </div>
                    ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {threads.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No conversations yet. Click <strong>New Chat</strong> to start one.
          </div>
        ) : (
          threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "px-4 py-3 cursor-pointer border-b hover:bg-muted",
                selectedThread?.id === t.id && "bg-muted font-medium"
              )}
              onClick={() => loadThreadDetail(t.id)}
            >
              <div className="flex justify-between">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs opacity-60">
                  {new Date(t.lastTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm truncate">{t.lastMessage}</div>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-6 py-4 font-semibold">
          {selectedThread
            ? selectedThread.participants
                ?.filter((p) => p.participantId !== ME.id)
                .map((p) => p.displayName)
                .join(", ")
            : "Select a thread"}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {selectedThread?.messages.map((msg) => {
            const mine = msg.senderId === ME.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "max-w-sm px-4 py-2 rounded-lg",
                  mine
                    ? "ml-auto bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {msg.content}
                <div className="text-xs mt-1 opacity-50">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>

        {selectedThread && (
          <div className="border-t p-4 flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 resize-none"
              placeholder="Type a message..."
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        )}
      </div>

      {/* Confirmation dialog for starting chat */}
      <Dialog open={!!pendingChat} onOpenChange={() => setPendingChat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Start chat with {pendingChat?.displayName}?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingChat(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (socketRef.current && pendingChat) {
                  socketRef.current.emit("startChat", {
                    me: ME,
                    other: pendingChat,
                  });
                }
              }}
            >
              Start Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { getChatSocket, disconnectChatSocket } from "@/lib/socket/chat";
// import { getLoggedInUser } from "@/lib/auth/authHelpers";
// import { cn } from "@/lib/utils";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";

// type ThreadListItem = {
//   id: string;
//   title: string;
//   lastMessage: string;
//   lastTime: string;
// };

// type Message = {
//   id: string;
//   senderId: string;
//   senderType: string;
//   content: string;
//   createdAt: string;
// };
// type ThreadDetail = { id: string; participants: any[]; messages: Message[] };

// const AGENCY_CODE = "UNITY124";
// const user = getLoggedInUser();

// const mapRole = (
//   role: string | undefined
// ): "SYSTEM_ADMIN" | "AGENCY_ADMIN" | "AGENCY_USER" => {
//   if (
//     role === "SYSTEM_ADMIN" ||
//     role === "AGENCY_ADMIN" ||
//     role === "AGENCY_USER"
//   ) {
//     return role;
//   }
//   return "AGENCY_USER";
// };

// const ME = {
//   id: user?.id ?? "",
//   name: user?.name ?? "",
//   participantType: "USER" as const,
//   agencyCode: user?.agency?.code ?? AGENCY_CODE,
//   role: mapRole(user?.role),
// };

// export default function InboxPage() {
//   const router = useRouter();
//   const [threads, setThreads] = useState<ThreadListItem[]>([]);
//   const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(
//     null
//   );
//   const [newMessage, setNewMessage] = useState("");
//   const socketRef = useRef<ReturnType<typeof getChatSocket> | null>(null);

//   const [participants, setParticipants] = useState<any[]>([]);
//   const [loadingParticipants, setLoadingParticipants] = useState(false);
//   const [search, setSearch] = useState("");
//   const [pendingChat, setPendingChat] = useState<any | null>(null);

//   // Load threads
//   const loadThreads = async () => {
//     try {
//       const res = await fetch(
//         `${
//           process.env.NEXT_PUBLIC_API_URL
//         }/api/chat/threads?agencyCode=${encodeURIComponent(
//           ME.agencyCode
//         )}&me=${encodeURIComponent(ME.id)}&meType=${encodeURIComponent(
//           ME.participantType
//         )}`
//       );
//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();
//       setThreads(
//         data.map((t: any) => ({
//           id: t.id,
//           title: t.participants
//             .filter((p: any) => p.participantId !== ME.id)
//             .map((p: any) => p.displayName)
//             .join(", "),
//           lastMessage: t.messages?.[t.messages.length - 1]?.content ?? "",
//           lastTime:
//             t.messages?.[t.messages.length - 1]?.createdAt ??
//             t.startedAt ??
//             new Date().toISOString(),
//         }))
//       );
//     } catch (err) {
//       console.error("Load threads error:", err);
//       setThreads([]);
//     }
//   };

//   const loadThreadDetail = async (id: string) => {
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/chat/threads/${id}`
//       );
//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();
//       setSelectedThread(data);
//     } catch (err) {
//       console.error("Load thread detail error:", err);
//       setSelectedThread(null);
//     }
//   };

//   // Load participants
//   const loadParticipants = async () => {
//     setLoadingParticipants(true);
//     try {
//       const res = await fetch(
//         `${
//           process.env.NEXT_PUBLIC_API_URL
//         }/api/chat/participants?agencyCode=${encodeURIComponent(
//           ME.agencyCode
//         )}&excludeId=${encodeURIComponent(
//           ME.id
//         )}&participantType=MOBILE_EMPLOYEE`
//       );
//       if (!res.ok) throw new Error(await res.text());
//       setParticipants(await res.json());
//     } catch (err) {
//       console.error("loadParticipants error:", err);
//       setParticipants([]);
//     } finally {
//       setLoadingParticipants(false);
//     }
//   };

//   // Init socket
//   useEffect(() => {
//     const socket = getChatSocket({
//       userId: ME.id,
//       displayName: ME.name,
//       participantType: ME.participantType,
//       agencyCode: ME.agencyCode,
//       role: ME.role,
//     });
//     socketRef.current = socket;

//     // socket.on(
//     //   "newMessage",
//     //   ({ threadId, message }: { threadId: string; message: Message }) => {
//     //     setSelectedThread((prev) =>
//     //       prev && prev.id === threadId
//     //         ? { ...prev, messages: [...prev.messages, message] }
//     //         : prev
//     //     );
//     //     loadThreads();
//     //   }
//     // );
//     socket.off("newMessage"); // clear old listener before adding
//     socket.on(
//       "newMessage",
//       ({ threadId, message }: { threadId: string; message: Message }) => {
//         setSelectedThread((prev) =>
//           prev && prev.id === threadId
//             ? { ...prev, messages: [...prev.messages, message] }
//             : prev
//         );
//         setThreads((prev) =>
//           prev.map((t) =>
//             t.id === threadId
//               ? {
//                   ...t,
//                   lastPreview: message.content,
//                   startedAt: message.createdAt,
//                 }
//               : t
//           )
//         );
//       }
//     );

//     socket.on("chatStarted", (thread: ThreadDetail) => {
//       setSelectedThread(thread);
//       loadThreads();
//       setPendingChat(null);
//     });

//     socket.on("connect_error", (err: any) => {
//       console.error("Socket connect error:", err.message);
//     });

//     return () => disconnectChatSocket();
//   }, []);

//   useEffect(() => {
//     if (selectedThread?.id && socketRef.current) {
//       socketRef.current.emit("joinThread", { threadId: selectedThread.id });
//     }
//   }, [selectedThread?.id]);

//   useEffect(() => {
//     loadThreads();
//   }, []);

//   // Send message
//   const handleSend = () => {
//     if (!newMessage.trim() || !selectedThread || !socketRef.current) return;
//     socketRef.current.emit("sendMessage", {
//       threadId: selectedThread.id,
//       content: newMessage.trim(),
//       senderType: ME.participantType,
//       senderId: ME.id,
//     });
//     setNewMessage("");
//   };

//   return (
//     <div className="flex h-[calc(100vh-4rem)]">
//       {/* Thread List */}
//       <div className="w-80 border-r overflow-y-auto bg-white">
//         <div className="flex items-center justify-between p-4 border-b">
//           <button
//             onClick={() => router.back()}
//             className="flex items-center text-sm"
//           >
//             <ArrowLeft className="w-4 h-4 mr-1" /> Back
//           </button>

//           <Dialog onOpenChange={(open) => open && loadParticipants()}>
//             <DialogTrigger asChild>
//               <Button size="sm">New Chat</Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>Start a new chat</DialogTitle>
//               </DialogHeader>
//               <Input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by name"
//                 className="mb-2"
//               />
//               <div className="max-h-60 overflow-y-auto space-y-2">
//                 {loadingParticipants ? (
//                   <div className="text-sm text-muted-foreground">
//                     Loading...
//                   </div>
//                 ) : (
//                   participants
//                     .filter((p) =>
//                       p.displayName.toLowerCase().includes(search.toLowerCase())
//                     )
//                     .map((p) => (
//                       <div
//                         key={p.id}
//                         className="p-2 border rounded cursor-pointer hover:bg-muted"
//                         onClick={() => setPendingChat(p)}
//                       >
//                         {p.displayName}{" "}
//                         <span className="text-xs opacity-60">
//                           ({p.participantType})
//                         </span>
//                       </div>
//                     ))
//                 )}
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {threads.length === 0 ? (
//           <div className="p-4 text-sm text-muted-foreground">
//             No conversations yet. Click <strong>New Chat</strong> to start one.
//           </div>
//         ) : (
//           threads.map((t) => (
//             <div
//               key={t.id}
//               className={cn(
//                 "px-4 py-3 cursor-pointer border-b hover:bg-muted",
//                 selectedThread?.id === t.id && "bg-muted font-medium"
//               )}
//               onClick={() => loadThreadDetail(t.id)}
//             >
//               <div className="flex justify-between">
//                 <span className="font-medium">{t.title}</span>
//                 <span className="text-xs opacity-60">
//                   {new Date(t.lastTime).toLocaleTimeString()}
//                 </span>
//               </div>
//               <div className="text-sm truncate">{t.lastMessage}</div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Chat Window */}
//       <div className="flex-1 flex flex-col">
//         <div className="border-b px-6 py-4 font-semibold">
//           {selectedThread
//             ? selectedThread.participants
//                 .filter((p) => p.participantId !== ME.id)
//                 .map((p) => p.displayName)
//                 .join(", ")
//             : "Select a thread"}
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//           {selectedThread?.messages.map((msg) => {
//             const mine = msg.senderId === ME.id;
//             return (
//               <div
//                 key={msg.id}
//                 className={cn(
//                   "max-w-sm px-4 py-2 rounded-lg",
//                   mine
//                     ? "ml-auto bg-primary text-white"
//                     : "bg-muted text-muted-foreground"
//                 )}
//               >
//                 {msg.content}
//                 <div className="text-xs mt-1 opacity-50">
//                   {new Date(msg.createdAt).toLocaleTimeString()}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {selectedThread && (
//           <div className="border-t p-4 flex gap-2">
//             <Textarea
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               className="flex-1 resize-none"
//               placeholder="Type a message..."
//             />
//             <Button onClick={handleSend}>Send</Button>
//           </div>
//         )}
//       </div>

//       {/* Confirmation dialog for starting chat */}
//       <Dialog open={!!pendingChat} onOpenChange={() => setPendingChat(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               Start chat with {pendingChat?.displayName}?
//             </DialogTitle>
//           </DialogHeader>
//           <div className="flex justify-end gap-2">
//             <Button variant="outline" onClick={() => setPendingChat(null)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={() => {
//                 if (socketRef.current && pendingChat) {
//                   socketRef.current.emit("startChat", {
//                     me: ME,
//                     other: pendingChat,
//                   });
//                 }
//               }}
//             >
//               Start Chat
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
