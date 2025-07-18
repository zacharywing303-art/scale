"use client";

import { useState } from "react";
import { InboxIcon, SendIcon } from "lucide-react"; // Replace with your icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // if you use clsx helper
import mockMessages from "./mock-inbox"; // we’ll create this file
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function InboxPage() {
  const [selectedThread, setSelectedThread] = useState(mockMessages[0]);
  const [newMessage, setNewMessage] = useState("");

  const router = useRouter();

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const updated = {
      ...selectedThread,
      messages: [
        ...selectedThread.messages,
        {
          sender: "me",
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSelectedThread(updated);
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {" "}
      {/* Adjust height based on topbar */}
      {/* Message List */}
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

        <div className="p-4 font-semibold text-lg border-b">Inbox</div>
        {mockMessages.map((thread) => (
          <div
            key={thread.id}
            className={cn(
              "px-4 py-3 cursor-pointer border-b hover:bg-muted",
              selectedThread.id === thread.id && "bg-muted font-medium"
            )}
            onClick={() => setSelectedThread(thread)}
          >
            <div className="flex justify-between items-center">
              <span>{thread.name}</span>
              {thread.unread > 0 && (
                <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5">
                  {thread.unread}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {thread.messages.at(-1)?.content}
            </div>
          </div>
        ))}
      </div>
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-6 py-4 font-semibold">
          {selectedThread.name}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-background">
          {selectedThread.messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "max-w-sm px-4 py-2 rounded-lg",
                msg.sender === "me"
                  ? "ml-auto bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {msg.content}
              <div className="text-xs text-right mt-1 opacity-50">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 resize-none"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim()}>
            <SendIcon className="w-4 h-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
