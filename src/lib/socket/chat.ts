import io, { Socket } from "socket.io-client";

type AuthParams = {
  userId: string;
  role: "SYSTEM_ADMIN" | "AGENCY_ADMIN" | "AGENCY_USER";
  participantType: "USER" | "MOBILE_EMPLOYEE" | "SYSTEM_ADMIN";
  displayName: string;
  agencyCode: string;
};

let socket: Socket | null = null;

export function getChatSocket(auth: AuthParams) {
  if (socket) return socket;
  socket = io("http://localhost:5000/chat", {
    autoConnect: false,
    transports: ["websocket"],
    auth,
  });
  socket.connect();
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
