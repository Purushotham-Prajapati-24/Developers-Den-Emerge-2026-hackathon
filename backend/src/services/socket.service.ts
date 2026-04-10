import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
// @ts-ignore — y-socket.io ships CJS/ESM without full TS types
import { YSocketIO } from 'y-socket.io/dist/server';

interface SetupSocketOptions {
  server: HttpServer;
  corsOrigin: string | string[];
}

export let io: SocketIOServer;

export const initSocketService = ({ server, corsOrigin }: SetupSocketOptions) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── y-socket.io: initialize FIRST, before any middleware ─────────────────
  const ySocketIO = new YSocketIO(io, {
    gcEnabled: false, // Keep room state so late-joiners get full doc
  });
  ySocketIO.initialize();

  console.log('[SOCKET] y-socket.io CRDT engine initialized');

  // ── Default namespace: app events (chat relay, project join) ─────────────
  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token || (socket.handshake.query?.token as string);

    if (!token) {
      console.warn(`[SOCKET] No token, rejecting ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      (socket as any).user = decoded;
    } catch {
      console.warn(`[SOCKET] Invalid token, rejecting ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    const user = (socket as any).user;
    const userId = user.userId || user.id || user.sub;
    console.log(`[SOCKET] Authenticated: ${socket.id} (${userId})`);

    // Join private user room for targeted notifications
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[SOCKET] User ${userId} joined their private room`);
    }

    // Room join — used by app-level broadcast (e.g. notifications, cursor list)
    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`[SOCKET] ${socket.id} joined room project:${projectId}`);
    });

    // ── Chat relay over Socket.IO ────────────────────────────────────────────
    socket.on('chat-message', (data: { projectId: string; message: any }) => {
      const { projectId, message } = data;
      socket.to(`project:${projectId}`).emit('chat-message', message);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Disconnected: ${socket.id}`);
    });
  });

  return io;
};
