"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { getChatSocket, disconnectChatSocket } from "@/lib/socket/chat"; // your socket helper
import io, { Socket } from "socket.io-client";

interface ChatRequest {
  threadId: string;
  from: { userId: string; displayName: string; participantType: string };
  startedAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function SystemAdminLiveChatPage() {
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const fetchChatRequests = async () => {
    try {
      const res = await fetch("/api/chat/requests");
      const data: ChatRequest[] = await res.json();
      setChatRequests(data);
    } catch (err) {
      console.error("Failed to fetch chat requests", err);
    }
  };

  useEffect(() => {
    fetchChatRequests();
    const interval = setInterval(fetchChatRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  // Initialize socket when a thread is active
  useEffect(() => {
    if (!activeThreadId) return;
    const user = getLoggedInUser(); // {userId, role, participantType, displayName, agencyCode}
    if (!user) return;

    const socket = getChatSocket({
      userId: user.id,
      role: user.role as any,
      participantType: "SYSTEM_ADMIN",
      displayName: user.name,
      agencyCode: user.agency?.code ?? "",
    });

    socketRef.current = socket;

    // Join the thread room
    socket.emit("joinThread", { threadId: activeThreadId });

    // Listen for new messages
    socket.on(
      "newMessage",
      (payload: { threadId: string; message: ChatMessage }) => {
        if (payload.threadId === activeThreadId) {
          setMessages((prev) => [...prev, payload.message]);
        }
      }
    );

    socket.on("chatEnded", ({ threadId }: { threadId: string }) => {
      if (threadId === activeThreadId) {
        alert("Chat has been ended by the user.");
        setActiveThreadId(null);
        setMessages([]);
      }
    });

    return () => {
      disconnectChatSocket();
    };
  }, [activeThreadId]);

  const acceptChat = async (threadId: string) => {
    try {
      const socket = socketRef.current;
      if (!socket) return;
      socket.emit("acceptChat", { threadId });
      setActiveThreadId(threadId);
      setMessages([]);
    } catch (err) {
      console.error("Failed to accept chat", err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeThreadId || !socketRef.current) return;
    socketRef.current.emit("sendMessage", {
      threadId: activeThreadId,
      content: newMessage,
    });
    setNewMessage("");
  };

  const endChat = () => {
    if (!activeThreadId || !socketRef.current) return;
    socketRef.current.emit("endChat", { threadId: activeThreadId });
    setActiveThreadId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] p-4 gap-4">
      {/* Chat Requests */}
      <div className="w-80 border p-2 bg-white overflow-y-auto">
        <h2 className="font-semibold mb-2">Pending Chat Requests</h2>
        {chatRequests.length === 0 && <p>No pending requests</p>}
        {chatRequests.map((req) => (
          <div key={req.threadId} className="border p-2 mb-2 rounded">
            <p>
              From: <strong>{req.from.displayName}</strong>
            </p>
            <p>Started at: {new Date(req.startedAt).toLocaleTimeString()}</p>
            <Button size="sm" onClick={() => acceptChat(req.threadId)}>
              Accept
            </Button>
          </div>
        ))}
      </div>

      {/* Active Chat */}
      <div className="flex-1 flex flex-col bg-gray-50 rounded p-2">
        {activeThreadId ? (
          <>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-xs px-3 py-1 rounded ${
                    msg.senderId === getLoggedInUser()?.id
                      ? "ml-auto bg-primary text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="text-sm font-semibold">{msg.senderName}</div>
                  <div>{msg.content}</div>
                  <div className="text-xs text-right opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={sendMessage}>Send</Button>
              <Button variant="destructive" onClick={endChat}>
                End Chat
              </Button>
            </div>
          </>
        ) : (
          <p className="m-auto text-center text-gray-500">
            Select a chat request to start live chat
          </p>
        )}
      </div>
    </div>
  );
}
