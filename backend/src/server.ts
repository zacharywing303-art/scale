import express from "express";
import prisma from "./lib/db";
import http from "http";
import { Server } from "socket.io";
import { registerChatNamespace } from "./sockets/chat.socket";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import agencyRoutes from "./routes/agency.route";
import statsRoutes from "./routes/agency.stats.route";
import userRoutes from "./routes/users.route";
import dashboardRoutes from "./routes/dashboard.route";
import chatRoutes from "./routes/chat.route";
import scheduleRoutes from "./routes/schedule.route";
import clientRoutes from "./routes/client.route";
import employeeRoutes from "./routes/employee.route";
import serviceRoutes from "./routes/services.route";
import missedVisitsRoutes from "./routes/missed-visits.route";
import "./workers/visitStatus.worker";
import mobileAuthRoutes from "./routes/mobile.auth.route";

// Load env variables
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000", // local Next.js dev
  "http://localhost:19006", // Expo Go default dev
  "https://unitycarehcm.com", // your main website
  "https://www.unitycarehcm.com", // www version
  "https://api.unitycarehcm.com", // your backend API domain
  "exp://192.168.1.156:8081", // Expo Go on local network
];

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/system", statsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/missed-visits", missedVisitsRoutes);
app.use("/api/mobile/auth", mobileAuthRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// sockets
registerChatNamespace(io);

// Register socket.io namespaces
registerChatNamespace(io);

// Root endpoint
app.get("/", (_req, res) => {
  res.send("Unity Care API is running");
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
