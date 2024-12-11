"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketAPI = void 0;
const socket_io_1 = require("socket.io");
const logger_service_1 = require("./logger.service");
const axios_1 = __importDefault(require("axios"));
let gIo = null;
const roomDetails = {};
const setupSocketAPI = (http) => {
    gIo = new socket_io_1.Server(http, {
        cors: {
            origin: "*",
        },
    });
    gIo.on("connection", (socket) => {
        socket.on("join-room", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId }) {
            if (!roomId)
                return;
            socket.join(roomId);
            // Initialize room state if it is the first user joining the room
            if (!roomDetails[roomId]) {
                try {
                    const { data } = yield axios_1.default.get(`https://elite-code-api.onrender.com/api/codeBlock/${roomId}`);
                    roomDetails[roomId] = {
                        mentorSocketId: "",
                        studentsCounts: 0,
                        codeContent: data.initialTemplate,
                        initialTemplate: data.initialTemplate,
                    };
                }
                catch (error) {
                    logger_service_1.loggerService.error(`Failed to fetch code block for room ${roomId}: ${error}`);
                    return;
                }
            }
            // Send code content to the newly joined user
            emitToSocket("update-code-content", socket.id, roomDetails[roomId].codeContent);
            // Handle mentor and student logic
            if (!roomDetails[roomId].mentorSocketId &&
                roomDetails[roomId].studentsCounts === 0) {
                roomDetails[roomId].mentorSocketId = socket.id;
                emitToRoom("set-is-mentor", roomId, true);
                logger_service_1.loggerService.info("Mentor entered the room socketId:", socket.id);
            }
            else {
                incrementRoomCount(roomId);
                logger_service_1.loggerService.info("Student entered the room socketId:", socket.id);
            }
        }));
        socket.on("disconnect", () => {
            const roomId = findRoomBySocket(socket.id);
            if (!roomId)
                return;
            const room = roomDetails[roomId];
            // Handle mentor disconnect
            if (socket.id === room.mentorSocketId) {
                disconnectMentor(roomId);
                disconnectAllInRoom(roomId);
                logger_service_1.loggerService.info("Mentor disconnected socketId:", socket.id);
            }
            else if (room.studentsCounts > 0) {
                decrementRoomCount(roomId);
                logger_service_1.loggerService.info("Student disconnected socketId:", socket.id);
            }
            socket.leave(roomId);
        });
        socket.on("update-code-content", ({ newCodeContent }) => {
            const roomId = findRoomBySocket(socket.id);
            if (!roomId)
                return;
            roomDetails[roomId].codeContent = newCodeContent;
            emitToRoom("update-code-content", roomId, newCodeContent);
            logger_service_1.loggerService.info("Code Updated by socketId:", socket.id);
        });
    });
};
exports.setupSocketAPI = setupSocketAPI;
const incrementRoomCount = (roomId) => {
    if (roomDetails[roomId]) {
        roomDetails[roomId].studentsCounts += 1;
        emitToRoom("update-room-count", roomId, roomDetails[roomId].studentsCounts);
    }
};
const decrementRoomCount = (roomId) => {
    const room = roomDetails[roomId];
    if (room) {
        room.studentsCounts -= 1;
        emitToRoom("update-room-count", roomId, room.studentsCounts);
    }
    else {
        logger_service_1.loggerService.warn(`Room with ID ${roomId} not found.`);
    }
};
const disconnectMentor = (roomId) => {
    const room = roomDetails[roomId];
    if (room) {
        room.mentorSocketId = "";
        room.codeContent = room.initialTemplate;
        emitToRoom("set-is-mentor", roomId, false);
    }
};
const disconnectAllInRoom = (roomId) => {
    const roomSockets = gIo === null || gIo === void 0 ? void 0 : gIo.sockets.adapter.rooms.get(roomId);
    if (roomSockets) {
        Array.from(roomSockets).forEach((socketId) => {
            const socket = gIo === null || gIo === void 0 ? void 0 : gIo.sockets.sockets.get(socketId);
            socket === null || socket === void 0 ? void 0 : socket.leave(roomId);
            socket === null || socket === void 0 ? void 0 : socket.emit("force-leave-room", { roomId });
        });
    }
};
const emitToRoom = (event, roomId, data) => {
    if (gIo) {
        gIo.to(roomId).emit(event, data);
    }
};
const emitToSocket = (event, socketId, data) => {
    if (gIo) {
        gIo.to(socketId).emit(event, data);
    }
};
const findRoomBySocket = (socketId) => {
    for (const roomId in roomDetails) {
        const room = gIo === null || gIo === void 0 ? void 0 : gIo.sockets.adapter.rooms.get(roomId);
        if (room && room.has(socketId)) {
            return roomId;
        }
    }
    return null;
};
