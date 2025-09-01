"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // if you use clsx helper
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, SendIcon, InboxIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { getChatSocket } from "@/lib/socket/chat";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

type ThreadListItem = {
  id: string;
  title: string;
  status: "pending" | "active" | "closed";
  lastPreview: string;
  startedAt: string;
};

type Participant = {
  id: string;
  participantId: string;
  participantType: "USER" | "MOBILE_EMPLOYEE" | "SYSTEM_ADMIN";
  displayName: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
};

type ThreadDetail = {
  id: string;
  status: "pending" | "active" | "closed";
  type: "user" | "systemAdmin";
  participants: Participant[];
  messages: Message[];
  startedAt: string;
  endedAt?: string;
};

const AGENCY_CODE = "UNITY124";

// TEMP current user; wire this to your auth context
const user = getLoggedInUser();
const allowedRoles = ["SYSTEM_ADMIN", "AGENCY_ADMIN", "AGENCY_USER"] as const;
type AllowedRole = (typeof allowedRoles)[number];
const fallbackRole: AllowedRole = "AGENCY_USER";
const userRole = allowedRoles.includes(user?.role as AllowedRole)
  ? (user?.role as AllowedRole)
  : fallbackRole;

const ME = {
  id: user?.id ?? "",
  name: user?.name ?? "",
  role: userRole,
  participantType: "USER" as const,
  agencyCode: user?.agency?.code ?? AGENCY_CODE,
};

export default function InboxPage() {
  const router = useRouter();

  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<ReturnType<typeof getChatSocket> | null>(null);

  // Load threads list
  const loadThreads = async () => {
    const res = await fetch(
      `http://localhost:5000/api/chat/threads?agencyCode=${AGENCY_CODE}&me=${ME.id}`
    );
    const data = await res.json();
    setThreads(data);
  };

  // Load one thread
  const loadThreadDetail = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/chat/threads/${id}`);
    const data = await res.json();
    setSelectedThread(data);
    // join room
    socketRef.current?.emit("joinThread", { threadId: id });
  };

  useEffect(() => {
    const socket = getChatSocket({
      userId: ME.id,
      role: ME.role,
      participantType: ME.participantType,
      displayName: ME.name,
      agencyCode: ME.agencyCode,
    });
    socketRef.current = socket;

    const handleChatRequest = ({ threadId }: { threadId: string }) => {
      if (ME.role === "SYSTEM_ADMIN") loadThreads();
    };
    const handleNewMessage = ({
      threadId,
      message,
    }: {
      threadId: string;
      message: Message;
    }) => {
      if (selectedThread?.id === threadId) {
        setSelectedThread((prev) =>
          prev ? { ...prev, messages: [...prev.messages, message] } : prev
        );
      }
      loadThreads();
    };

    socket.on("chatRequest", () => {
      if (ME.role === "SYSTEM_ADMIN") loadThreads();
    });
    socket.on("chatStarted", ({ threadId }: { threadId: string }) => {
      loadThreads();
      loadThreadDetail(threadId);
    });
    socket.on(
      "chatAccepted",
      ({
        threadId,
        participants,
      }: {
        threadId: string;
        participants?: Participant[];
      }) => {
        // If we are a participant in this thread, open it (join + load messages)
        const amParticipant = participants?.some(
          (p) => p.participantId === ME.id
        );

        if (amParticipant) {
          // this will fetch thread detail from the server and emit joinThread
          loadThreadDetail(threadId);
        } else if (selectedThread?.id === threadId) {
          // already viewing it — refresh details
          loadThreadDetail(threadId);
        }

        loadThreads();
      }
    );
    socket.on("joinedThread", (thread: ThreadDetail) => {
      if (!thread) return;
      // If the joined thread is currently selected (or just opened), set it
      if (
        selectedThread?.id === thread.id ||
        thread.participants?.some((p) => p.participantId === ME.id)
      ) {
        setSelectedThread(thread);
      }
    });

    socket.on("chatEnded", ({ threadId }: { threadId: string }) => {
      if (selectedThread?.id === threadId) loadThreadDetail(threadId);
      loadThreads();
    });
    socket.on(
      "newMessage",
      ({
        threadId,
        message,
      }: {
        threadId: string;
        message: Message & { senderName: string; senderType: string };
      }) => {
        if (selectedThread?.id === threadId) {
          setSelectedThread((prev) =>
            prev ? { ...prev, messages: [...prev.messages, message] } : prev
          );
        }
        loadThreads();
      }
    );

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [selectedThread?.id]);

  useEffect(() => {
    loadThreads();
  }, []);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedThread || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      threadId: selectedThread.id,
      content: newMessage.trim(),
      senderType: ME.participantType, // pass participantType from ME object
    });

    setNewMessage("");
  };

  const startSystemAdminChat = () => {
    socketRef.current?.emit("startChat", { type: "systemAdmin" });
  };

  const acceptChat = () => {
    if (!selectedThread || !socketRef.current) return;

    socketRef.current.emit("acceptChat", { threadId: selectedThread.id });
  };

  const endChat = () => {
    if (!selectedThread) return;
    socketRef.current?.emit("endChat", { threadId: selectedThread.id });
  };

  const startDirectChat = async (
    targetId: string,
    targetName: string,
    targetType: "USER" | "MOBILE_EMPLOYEE"
  ) => {
    await fetch("http://localhost:5000/api/chat/threads/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyCode: AGENCY_CODE,
        me: ME.id,
        meName: ME.name,
        meType: ME.participantType,
        targetId,
        targetName,
        targetType,
      }),
    });
    await loadThreads();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* List */}
      <div className="w-80 border-r overflow-y-auto bg-white dark:bg-background">
        <div className="flex items-center p-4 border-b">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">Inbox</div>
          <Button size="sm" onClick={startSystemAdminChat}>
            Start System Admin Chat
          </Button>
        </div>

        {threads.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-3 cursor-pointer border-b hover:bg-muted",
              selectedThread?.id === t.id && "bg-muted font-medium"
            )}
            onClick={() => loadThreadDetail(t.id)}
          >
            <div className="flex justify-between items-center">
              <span>{t.title}</span>
              <span className="text-xs uppercase">{t.status}</span>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {t.lastPreview}
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="font-semibold">
            {selectedThread ? selectedThread.id : "Select a thread"}
          </div>
          <div className="flex gap-2">
            {selectedThread?.status === "pending" &&
              ME.role === "SYSTEM_ADMIN" && (
                <Button size="sm" onClick={acceptChat}>
                  Accept
                </Button>
              )}
            {selectedThread && selectedThread.status !== "closed" && (
              <Button variant="destructive" size="sm" onClick={endChat}>
                End Chat
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-background">
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
                <div className="text-xs text-right mt-1 opacity-50">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
          {!selectedThread && (
            <div className="text-sm text-muted-foreground">
              No thread selected
            </div>
          )}
        </div>

        <div className="border-t p-4 flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 resize-none"
            disabled={!selectedThread || selectedThread.status === "closed"}
          />
          <Button
            onClick={handleSend}
            disabled={
              !newMessage.trim() ||
              !selectedThread ||
              selectedThread.status === "closed"
            }
          >
            <SendIcon className="w-4 h-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
