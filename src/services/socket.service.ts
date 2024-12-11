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
let currentRoomId: string;
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
          currentRoomId = roomId;
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
        emitToRoom(socket, "set-is-mentor", roomId, true);
        loggerService.info("Mentor entered the room socketId:", socket.id);
      } else {
        updateRoomCount("increase", socket, roomId);
        loggerService.info("Student entered the room socketId:", socket.id);
      }
    });

    socket.on("disconnect", () => {
      if (!currentRoomId) return;

      const room = roomDetails[currentRoomId];

      // handle mentor disconnect
      if (socket.id === room.mentorSocketId) {
        disconnectMentor(socket, currentRoomId);
        disconnectAllInRoom(currentRoomId);
        loggerService.info("Mentor disconnected socketId:", socket.id);
      } else if (room.studentsCounts > 0) {
        updateRoomCount("decrease", socket, currentRoomId);
        loggerService.info("Student disconnected socketId:", socket.id);
      }
      socket.leave(currentRoomId);
    });

    socket.on(
      "update-code-content",
      ({ newCodeContent }: { newCodeContent: string }) => {
        if (!currentRoomId) return;
        roomDetails[currentRoomId].codeContent = newCodeContent;
        emitToRoom(
          socket,
          "update-code-content",
          currentRoomId,
          newCodeContent
        );
        loggerService.info("Code Updated by socketId:", socket.id);
      }
    );
  });
};
const updateRoomCount = (
  flag: "increase" | "decrease",
  socket: Socket,
  roomId: string
) => {
  const room = roomDetails[roomId];

  if (!room) {
    loggerService.warn(`Room with ID ${roomId} not found.`);
    return;
  }

  if (flag === "increase") {
    room.studentsCounts += 1;
  } else if (flag === "decrease") {
    room.studentsCounts -= 1;
  }

  emitToRoom(socket, "update-room-count", roomId, room.studentsCounts);
};

const disconnectMentor = (socket: Socket, roomId: string) => {
  const room = roomDetails[roomId];
  if (!room) return;
  room.mentorSocketId = "";
  room.codeContent = room.initialTemplate;
  emitToRoom(socket, "set-is-mentor", roomId, false);
};

const disconnectAllInRoom = (roomId: string) => {
  const roomSockets = gIo?.sockets.adapter.rooms.get(roomId);
  if (!roomSockets) return;
  Array.from(roomSockets).forEach((socketId) => {
    const socket = gIo?.sockets.sockets.get(socketId);
    socket?.leave(roomId);
    socket?.emit("force-leave-room", { roomId });
  });
};

const emitToRoom = (
  socket: Socket,
  event: string,
  roomId: string,
  data: any,
  broadcastGlobally: boolean = true
) => {
  if (!gIo) return;

  if (broadcastGlobally) {
    gIo.to(roomId).emit(event, data);
  } else {
    socket.to(roomId).emit(event, data);
  }
};

const emitToSocket = (event: string, socketId: string, data: any) => {
  if (gIo) {
    gIo.to(socketId).emit(event, data);
  }
};
