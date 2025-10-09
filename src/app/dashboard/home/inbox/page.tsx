"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import { toast } from "sonner";

type ThreadListItem = {
  id: string;
  title: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
};

type Message = {
  id: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
};

type Participant = {
  participantId: string;
  displayName: string;
  participantType: string;
  [key: string]: any;
};

type ThreadDetail = {
  id: string;
  participants: Participant[];
  messages: Message[];
};

const AGENCY_CODE = "UNITY124";
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

/**
 * InboxPage component displays a list of chat threads and allows users to view, send messages, and start new chats with participants.
 * It manages chat state, handles socket events, and provides a UI for messaging within the dashboard.
 */
export default function InboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
  const [startChatLoading, setStartChatLoading] = useState(false);
  const [startChatError, setStartChatError] = useState<string | null>(null);

  // Get user on mount
  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  // Memoize ME so it updates when user changes
  const ME = useMemo(
    () =>
      user
        ? {
            id: user?.id ?? "",
            name: user?.name ?? "",
            participantType: "USER" as const,
            agencyCode: user?.agency?.code ?? AGENCY_CODE,
            role: mapRole(user?.role),
          }
        : {
            id: "",
            name: "",
            participantType: "USER" as const,
            agencyCode: AGENCY_CODE,
            role: "AGENCY_USER" as const,
          },
    [user]
  );

  // Normalize thread data safely
  // const normalizeThread = (t: any, me: typeof ME): ThreadListItem => {
  //   const others = Array.isArray(t.participants)
  //     ? t.participants.filter((p: any) => p.participantId !== me.id)
  //     : [];
  //   return {
  //     id: t.id,
  //     title: others.map((p: any) => p.displayName).join(", ") || "Unknown",
  //     lastMessage: t.messages?.[t.messages.length - 1]?.content ?? "",
  //     lastTime:
  //       t.messages?.[t.messages.length - 1]?.createdAt ??
  //       t.startedAt ??
  //       new Date().toISOString(),
  //   };
  // };
  const normalizeThread = (t: any, me: typeof ME): ThreadListItem => {
    const others = (t.participants || []).filter(
      (p: any) => p.participantId !== me.id
    );
    const lastMsg = t.messages?.[t.messages.length - 1];
    return {
      id: t.id,
      title: others.map((p: any) => p.displayName).join(", ") || "Unknown",
      lastMessage: lastMsg?.content ?? "",
      lastTime: lastMsg?.createdAt ?? t.startedAt,
      unreadCount: t.unreadCount || 0,
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
      setThreads(data.map((t: any) => normalizeThread(t, ME)));
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

  const markThreadAsRead = async (threadId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/threads/${threadId}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: ME.id }),
        }
      );
      // Update UI immediately
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Load participants
  const loadParticipants = async (me: typeof ME) => {
    setLoadingParticipants(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/chat/participants?agencyCode=${encodeURIComponent(
          me.agencyCode
        )}&excludeId=${encodeURIComponent(
          me.id
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

  // // Init socket
  // useEffect(() => {
  //   if (!user) return;

  //   // Disconnect old socket
  //   if (socketRef.current) {
  //     socketRef.current.disconnect();
  //   }

  //   const socket = getChatSocket({
  //     userId: user?.id ?? "",
  //     displayName: user?.name ?? "",
  //     participantType: "USER",
  //     agencyCode: user?.agency?.code ?? AGENCY_CODE,
  //     role: mapRole(user?.role),
  //   });
  //   socketRef.current = socket;

  //   const handleIncomingMessage = ({
  //     threadId,
  //     message,
  //   }: {
  //     threadId: string;
  //     message: Message;
  //   }) => {
  //     setSelectedThread((prev) =>
  //       prev &&
  //       prev.id === threadId &&
  //       !prev.messages.find((m) => m.id === message.id)
  //         ? { ...prev, messages: [...prev.messages, message] }
  //         : prev
  //     );
  //     setThreads((prev) =>
  //       prev.map((t) =>
  //         t.id === threadId
  //           ? {
  //               ...t,
  //               lastMessage: message.content,
  //               lastTime: message.createdAt,
  //             }
  //           : t
  //       )
  //     );
  //   };

  //   socket.on("newMessage", handleIncomingMessage);

  //   // ✅ Update thread list order in real time when any thread gets a new message
  //   const handleThreadUpdated = ({
  //     threadId,
  //     lastMessage,
  //   }: {
  //     threadId: string;
  //     lastMessage: { content: string; createdAt: string };
  //   }) => {
  //     setThreads((prev) => {
  //       const updated = prev.map((t) =>
  //         t.id === threadId
  //           ? {
  //               ...t,
  //               lastMessage: lastMessage.content,
  //               lastTime: lastMessage.createdAt,
  //             }
  //           : t
  //       );

  //       // ✅ If thread doesn’t exist in list, skip reordering
  //       const exists = updated.some((t) => t.id === threadId);
  //       if (!exists) return updated;

  //       // ✅ Reorder so most recent is on top
  //       return [...updated].sort(
  //         (a, b) =>
  //           new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
  //       );
  //     });
  //   };

  //   socket.on("threadUpdated", handleThreadUpdated);

  //   // ✅ once instead of on
  //   socket.once("chatStarted", (thread: ThreadDetail) => {
  //     setSelectedThread(thread);
  //     setThreads((prev) => {
  //       const exists = prev.some((t) => t.id === thread.id);
  //       return exists
  //         ? prev.map((t) =>
  //             t.id === thread.id ? normalizeThread(thread, ME) : t
  //           )
  //         : [normalizeThread(thread, ME), ...prev];
  //     });
  //     setPendingChat(null);
  //   });

  //   return () => {
  //     socket.off("newMessage", handleIncomingMessage);
  //     socket.off("threadUpdated", handleThreadUpdated);
  //     socket.disconnect();
  //     socketRef.current = null;
  //   };
  // }, [user]);

  useEffect(() => {
    if (!user) return;

    // Always create a fresh socket connection when page is mounted
    const socket = getChatSocket({
      userId: user?.id ?? "",
      displayName: user?.name ?? "",
      participantType: "USER",
      agencyCode: user?.agency?.code ?? AGENCY_CODE,
      role: mapRole(user?.role),
    });
    socketRef.current = socket;

    const handleIncomingMessage = ({ threadId, message }: any) => {
      setSelectedThread((prev) =>
        prev && prev.id === threadId
          ? {
              ...prev,
              id: prev.id,
              participants: prev.participants,
              messages: [...prev.messages, message],
            }
          : prev
      );
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          const isMine = message.senderId === ME.id;
          return {
            ...t,
            lastMessage: message.content,
            lastTime: message.createdAt,
            unreadCount: isMine ? t.unreadCount : t.unreadCount + 1,
          };
        })
      );
    };

    socket.on("newMessage", handleIncomingMessage);

    socket.on("threadUpdated", ({ threadId, lastMessage }: any) => {
      setThreads((prev) =>
        [
          ...prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessage: lastMessage.content,
                  lastTime: lastMessage.createdAt,
                }
              : t
          ),
        ].sort(
          (a, b) =>
            new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // 👇 intentionally NO dependency on [user]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (selectedThread?.id && socketRef.current) {
      socketRef.current.emit("joinThread", { threadId: selectedThread.id });
    }
  }, [selectedThread?.id]);

  useEffect(() => {
    if (user) loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ME]);

  // Send message
  const handleSend = useCallback(() => {
    if (!newMessage.trim() || !selectedThread || !socketRef.current) return;
    socketRef.current.emit(
      "sendMessage",
      {
        threadId: selectedThread.id,
        content: newMessage.trim(),
        senderType: ME.participantType,
        senderId: ME.id,
      },
      (resp: any) => {
        if (resp?.error) toast.error(resp.error);
      }
    );
    setNewMessage("");
  }, [newMessage, selectedThread, ME.participantType, ME.id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <span>Loading...</span>
      </div>
    );
  }

  // // Helper to safely format date
  // const formatTime = (dateStr: string) => {
  //   const d = new Date(dateStr);
  //   return isNaN(d.getTime()) ? "" : d.toLocaleTimeString();
  // };

  // Format message time (no seconds)
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date header ("Today", "Yesterday", or formatted date)
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (d.getFullYear() !== now.getFullYear()) options.year = "numeric";
    return d.toLocaleDateString(undefined, options);
  };

  // Format compact thread timestamp (today/yesterday/date with time)
  const formatThreadTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (isToday) return `Today ${time}`;
    if (isYesterday) return `Yesterday ${time}`;

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (d.getFullYear() !== now.getFullYear()) options.year = "numeric";
    return `${d.toLocaleDateString(undefined, options)} ${time}`;
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

          <Dialog onOpenChange={(open) => open && loadParticipants(ME)}>
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
                      (p.displayName?.toLowerCase() ?? "").includes(
                        search.toLowerCase()
                      )
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
                "px-4 py-3 cursor-pointer border-b hover:bg-muted flex justify-between items-center",
                selectedThread?.id === t.id && "bg-muted font-medium"
              )}
              onClick={() => {
                loadThreadDetail(t.id);
                markThreadAsRead(t.id);
              }}
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium flex items-center gap-2">
                    {t.title}
                  </span>
                  <span className="text-xs opacity-60">
                    {formatThreadTime(t.lastTime)}
                  </span>
                </div>
                <div className="text-sm truncate">{t.lastMessage}</div>
              </div>
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
          {(() => {
            if (!selectedThread?.messages) return null;

            let lastDateLabel: string | null = null;
            return selectedThread.messages.map((msg) => {
              const msgDateLabel = formatDateLabel(msg.createdAt);
              const showDateHeader = msgDateLabel !== lastDateLabel;
              lastDateLabel = msgDateLabel;

              const mine = msg.senderId === ME.id;
              return (
                <div key={msg.id}>
                  {showDateHeader && (
                    <div className="text-center text-xs text-gray-500 my-2">
                      {msgDateLabel}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-sm px-4 py-2 rounded-lg",
                      mine
                        ? "ml-auto bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.content}
                    <div className="text-xs mt-1 opacity-50">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {selectedThread && (
          <div className="border-t p-4 flex gap-2 items-center">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 resize-none mb-4"
              placeholder="Type a message..."
            />
            <Button onClick={handleSend} className="mb-4">
              Send
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation dialog for starting chat */}
      <Dialog
        open={!!pendingChat}
        onOpenChange={() => {
          setPendingChat(null);
          setStartChatError(null);
          setStartChatLoading(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Start chat with {pendingChat?.displayName}?
            </DialogTitle>
          </DialogHeader>
          {startChatError && (
            <div className="text-sm text-red-600 mb-2">{startChatError}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPendingChat(null);
                setStartChatError(null);
                setStartChatLoading(false);
              }}
              disabled={startChatLoading}
            >
              Cancel
            </Button>
            {/* <Button
              onClick={() => {
                if (!pendingChat || !socketRef.current) return;
                socketRef.current.emit(
                  "startChat",
                  {
                    me: ME,
                    other: pendingChat,
                  },
                  (resp: any) => {
                    if (resp?.error) setStartChatError(resp.error);
                  }
                );
              }}
            >
              Start Chat
            </Button> */}
            <Button
              onClick={async () => {
                if (!pendingChat || !socketRef.current) return;

                setStartChatError(null);
                setStartChatLoading(true);

                try {
                  await new Promise<void>((resolve, reject) => {
                    socketRef.current!.emit(
                      "startChat",
                      { me: ME, other: pendingChat },
                      (resp: any) => {
                        if (resp?.error) {
                          reject(new Error(resp.error));
                        } else if (resp?.thread) {
                          // ✅ Backend returned an existing or new thread directly
                          setSelectedThread(resp.thread);
                          setThreads((prev) => {
                            const exists = prev.some(
                              (t) => t.id === resp.thread.id
                            );
                            return exists
                              ? prev.map((t) =>
                                  t.id === resp.thread.id
                                    ? normalizeThread(resp.thread, ME)
                                    : t
                                )
                              : [normalizeThread(resp.thread, ME), ...prev];
                          });
                          resolve();
                        } else {
                          // ✅ Wait for chatStarted event (for new threads)
                          const handleStarted = (thread: ThreadDetail) => {
                            if (thread.id === resp?.threadId || thread.id) {
                              setSelectedThread(thread);
                              setThreads((prev) => {
                                const exists = prev.some(
                                  (t) => t.id === thread.id
                                );
                                return exists
                                  ? prev.map((t) =>
                                      t.id === thread.id
                                        ? normalizeThread(thread, ME)
                                        : t
                                    )
                                  : [normalizeThread(thread, ME), ...prev];
                              });
                              socketRef.current?.off(
                                "chatStarted",
                                handleStarted
                              );
                              resolve();
                            }
                          };
                          socketRef.current?.on("chatStarted", handleStarted);
                        }
                      }
                    );
                  });

                  // ✅ Close modal once done
                  setPendingChat(null);
                  setStartChatLoading(false);
                } catch (err: any) {
                  setStartChatError(err.message || "Failed to start chat");
                  setStartChatLoading(false);
                }
              }}
            >
              {startChatLoading ? "Starting..." : "Start Chat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
