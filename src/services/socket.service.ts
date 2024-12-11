import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { loggerService } from "./logger.service";
import axios from "axios";

let gIo: Server | null = null;

interface RoomDetails {
  studentsCounts: number;
  mentorSocketId: string;
  codeContent: string;
  initialTemplate: string;
}

const roomDetails: { [currentRoomId: string]: RoomDetails } = {};

export const setupSocketAPI = (http: HttpServer) => {
  gIo = new Server(http, {
    cors: {
      origin: "*",
    },
  });

  gIo.on("connection", (socket: Socket) => {
    socket.on("join-room", async ({ roomId }: { roomId: string }) => {
      if (!roomId) return;

      socket.join(roomId);

      // Initialize room state if it is the first user joining the room
      if (!roomDetails[roomId]) {
        try {
          const { data } = await axios.get(
            `https://elite-code-api.onrender.com/api/codeBlock/${roomId}`
          );
          roomDetails[roomId] = {
            mentorSocketId: "",
            studentsCounts: 0,
            codeContent: data.initialTemplate,
            initialTemplate: data.initialTemplate,
          };
        } catch (error) {
          loggerService.error(
            `Failed to fetch code block for room ${roomId}: ${error}`
          );
          return;
        }
      }

      // Send code content to the newly joined user
      emitToSocket(
        "update-code-content",
        socket.id,
        roomDetails[roomId].codeContent
      );

      // Handle mentor and student logic
      if (
        !roomDetails[roomId].mentorSocketId &&
        roomDetails[roomId].studentsCounts === 0
      ) {
        roomDetails[roomId].mentorSocketId = socket.id;
        emitToRoom("set-is-mentor", roomId, true);
      } else {
        incrementRoomCount(roomId);
      }
    });

    socket.on("disconnect", () => {
      const roomId = findRoomBySocket(socket.id);
      if (!roomId) return;

      const room = roomDetails[roomId];

      // Handle mentor disconnect
      if (socket.id === room.mentorSocketId) {
        disconnectMentor(roomId);
        disconnectAllInRoom(roomId);
      } else if (room.studentsCounts > 0) {
        decrementRoomCount(roomId);
      }

      socket.leave(roomId);
    });

    socket.on(
      "update-code-content",
      ({ newCodeContent }: { newCodeContent: string }) => {
        const roomId = findRoomBySocket(socket.id);
        if (!roomId) return;

        roomDetails[roomId].codeContent = newCodeContent;
        emitToRoom("update-code-content", roomId, newCodeContent);
      }
    );
  });
};

const incrementRoomCount = (roomId: string) => {
  if (roomDetails[roomId]) {
    roomDetails[roomId].studentsCounts += 1;
    emitToRoom("update-room-count", roomId, roomDetails[roomId].studentsCounts);
  }
};

const decrementRoomCount = (roomId: string) => {
  const room = roomDetails[roomId];
  if (room) {
    room.studentsCounts -= 1;
    emitToRoom("update-room-count", roomId, room.studentsCounts);
  } else {
    loggerService.warn(`Room with ID ${roomId} not found.`);
  }
};

const disconnectMentor = (roomId: string) => {
  const room = roomDetails[roomId];
  if (room) {
    room.mentorSocketId = "";
    room.codeContent = room.initialTemplate;
    emitToRoom("set-is-mentor", roomId, false);
  }
};

const disconnectAllInRoom = (roomId: string) => {
  const roomSockets = gIo?.sockets.adapter.rooms.get(roomId);
  if (roomSockets) {
    Array.from(roomSockets).forEach((socketId) => {
      const socket = gIo?.sockets.sockets.get(socketId);
      socket?.leave(roomId);
      socket?.emit("force-leave-room", { roomId });
    });
  }
};

const emitToRoom = (event: string, roomId: string, data: any) => {
  if (gIo) {
    gIo.to(roomId).emit(event, data);
  }
};

const emitToSocket = (event: string, socketId: string, data: any) => {
  if (gIo) {
    gIo.to(socketId).emit(event, data);
  }
};

const findRoomBySocket = (socketId: string) => {
  for (const roomId in roomDetails) {
    const room = gIo?.sockets.adapter.rooms.get(roomId);
    if (room && room.has(socketId)) {
      return roomId;
    }
  }
  return null;
};
