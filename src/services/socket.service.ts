import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let gIo: Server | null = null;
const roomCounts: { [roomId: string]: number } = {};

export function setupSocketAPI(http: HttpServer) {
  gIo = new Server(http, {
    cors: {
      origin: "*",
    },
  });

  gIo.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", ({ roomId }: { roomId: string }) => {
      if (!roomId) return;

      socket.join(roomId);

      if (!roomCounts[roomId]) {
        roomCounts[roomId] = 0;
      }

      roomCounts[roomId] += 1;

      emitRoomCount(roomId);

      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("disconnecting", () => {
      const rooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id
      );
      rooms.forEach((roomId) => {
        if (roomCounts[roomId] > 0) {
          roomCounts[roomId] -= 1;
        }

        emitRoomCount(roomId);
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function emitRoomCount(roomId: string) {
  if (!gIo) return;

  const count = roomCounts[roomId] || 0;
  console.log("students count in room", count);

  gIo.to(roomId).emit("update-room-count", count);
}
