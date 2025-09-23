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
    return {
      id: t.id,
      title: others.map((p: any) => p.displayName).join(", ") || "Unknown",
      lastMessage: t.messages?.[0]?.content ?? "",
      lastTime: t.messages?.[0]?.createdAt ?? t.startedAt,
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

  // Init socket
  useEffect(() => {
    if (!user || socketRef.current) return;

    const socket = getChatSocket({
      userId: user?.id ?? "",
      displayName: user?.name ?? "",
      participantType: "USER",
      agencyCode: user?.agency?.code ?? AGENCY_CODE,
      role: mapRole(user?.role),
    });
    socketRef.current = socket;

    socket.on(
      "newMessage",
      ({ threadId, message }: { threadId: string; message: Message }) => {
        setSelectedThread((prev) =>
          prev &&
          prev.id === threadId &&
          !prev.messages.find((m) => m.id === message.id)
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

    // ✅ once instead of on
    socket.once("chatStarted", (thread: ThreadDetail) => {
      setSelectedThread(thread);
      setThreads((prev) => {
        const exists = prev.some((t) => t.id === thread.id);
        return exists
          ? prev.map((t) =>
              t.id === thread.id ? normalizeThread(thread, ME) : t
            )
          : [normalizeThread(thread, ME), ...prev];
      });
      setPendingChat(null);
    });

    return () => {
      socket.disconnect(); // <- ensure it fully disconnects
      socketRef.current = null;
    };
  }, [user]);

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

  // Helper to safely format date
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString();
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
                "px-4 py-3 cursor-pointer border-b hover:bg-muted",
                selectedThread?.id === t.id && "bg-muted font-medium"
              )}
              onClick={() => loadThreadDetail(t.id)}
            >
              <div className="flex justify-between">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs opacity-60">
                  {formatTime(t.lastTime)}
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
                  {formatTime(msg.createdAt)}
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
              onClick={async () => {
                setStartChatError(null);
                setStartChatLoading(true);
                try {
                  if (socketRef.current && pendingChat) {
                    await new Promise<void>((resolve, reject) => {
                      socketRef.current!.emit(
                        "startChat",
                        { me: ME, other: pendingChat },
                        (resp: any) => {
                          if (resp?.error) reject(new Error(resp.error));
                          else resolve();
                        }
                      );
                    });
                  }
                } catch (err: any) {
                  setStartChatError(
                    err?.message || "Failed to start chat. Please try again."
                  );
                } finally {
                  setStartChatLoading(false);
                }
              }}
            >
              {startChatLoading ? "Starting..." : "Start Chat"}
            </Button> */}
            <Button
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
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
