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

type ThreadListItem = { id: string; lastPreview: string; startedAt: string };
type Message = {
  id: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
};
type ThreadDetail = { id: string; participants: any[]; messages: Message[] };

const AGENCY_CODE = "UNITY124";
const user = getLoggedInUser();

const ME = {
  id: user?.id ?? "",
  name: user?.name ?? "",
  participantType: "USER" as const,
  agencyCode: user?.agency?.code ?? AGENCY_CODE,
  role: user?.role ?? "AGENCY_USER",
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

  const loadThreads = async () => {
    try {
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/chat/threads?agencyCode=${encodeURIComponent(
        ME.agencyCode
      )}&me=${encodeURIComponent(ME.id)}&meType=${encodeURIComponent(
        ME.participantType
      )}`;

      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to load threads:", res.status, txt);
        setThreads([]);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error(
          "Expected an array from /api/chat/threads but got:",
          data
        );
        setThreads([]);
        return;
      }

      setThreads(data);
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
      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to load thread detail:", res.status, txt);
        setSelectedThread(null);
        return;
      }
      const data = await res.json();
      setSelectedThread(data);
    } catch (err) {
      console.error("Load thread detail error:", err);
      setSelectedThread(null);
    }
  };

  const loadParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/chat/participants?agencyCode=${encodeURIComponent(
        ME.agencyCode
      )}&excludeId=${encodeURIComponent(ME.id)}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.error("Failed to load participants:", await res.text());
        setParticipants([]);
        return;
      }
      setParticipants(await res.json());
    } catch (err) {
      console.error("loadParticipants error:", err);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Initialize socket once
  useEffect(() => {
    const socket = getChatSocket({
      userId: ME.id,
      displayName: ME.name,
      participantType: ME.participantType,
      agencyCode: ME.agencyCode,
      role: ME.role,
    });
    socketRef.current = socket;

    socket.on(
      "newMessage",
      ({ threadId, message }: { threadId: string; message: Message }) => {
        setSelectedThread((prev) =>
          prev && prev.id === threadId
            ? { ...prev, messages: [...prev.messages, message] }
            : prev
        );
        loadThreads();
      }
    );

    socket.on("connect_error", (err: any) => {
      console.error("Socket connect error:", err.message);
    });

    socket.on("disconnect", (reason: string) => {
      console.warn("Socket disconnected:", reason);
    });

    return () => {
      disconnectChatSocket();
    };
  }, []);

  // Join the selected thread
  useEffect(() => {
    if (selectedThread?.id && socketRef.current) {
      socketRef.current.emit("joinThread", { threadId: selectedThread.id });
    }
  }, [selectedThread?.id]);

  useEffect(() => {
    loadThreads();
  }, []);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedThread || !socketRef.current) return;
    socketRef.current.emit("sendMessage", {
      threadId: selectedThread.id,
      content: newMessage.trim(),
      senderType: ME.participantType,
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

          <Dialog
            onOpenChange={(open) => {
              if (open) {
                // Load only mobile employees with same agency code
                setLoadingParticipants(true);
                fetch(
                  `${
                    process.env.NEXT_PUBLIC_API_URL
                  }/api/chat/participants?agencyCode=${encodeURIComponent(
                    ME.agencyCode
                  )}&excludeId=${encodeURIComponent(
                    ME.id
                  )}&participantType=MOBILE_EMPLOYEE`
                )
                  .then(async (res) => {
                    if (!res.ok) {
                      setParticipants([]);
                      return;
                    }
                    setParticipants(await res.json());
                  })
                  .catch(() => setParticipants([]))
                  .finally(() => setLoadingParticipants(false));
              }
            }}
          >
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
                        key={p.id}
                        className="p-2 border rounded cursor-pointer hover:bg-muted"
                        onClick={() => {
                          // create thread and open it
                          socketRef.current?.emit("startChat", {
                            me: ME,
                            other: p,
                          });
                        }}
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
            No conversations yet.
            <br />
            Click <strong>New Chat</strong> to start one.
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
              <div className="text-sm truncate">{t.lastPreview}</div>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-6 py-4 font-semibold">
          {selectedThread ? "Chat" : "Select a thread"}
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
    </div>
  );
}
