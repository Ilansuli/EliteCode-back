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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const logger_service_1 = require("./services/logger.service");
const codeBlock_routes_1 = require("./api/codeBlock/codeBlock.routes");
const http_1 = require("http");
const dotenv_1 = require("dotenv");
const socket_service_1 = require("./services/socket.service");
//INIT
const app = (0, express_1.default)();
app.use(express_1.default.json());
const http = (0, http_1.createServer)(app);
(0, dotenv_1.config)();
(0, socket_service_1.setupSocketAPI)(http);
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.resolve(__dirname, "public")));
}
else {
    const corsOptions = {
        origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
        credentials: true,
    };
    app.use((0, cors_1.default)(corsOptions));
}
app.use("/api/codeBlock", codeBlock_routes_1.router);
app.get("/api/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send("test");
    }
    catch (err) {
        logger_service_1.loggerService.error("Failed to get test", err);
        res.status(500).send({ err: "Failed to get test" });
    }
}));
//keeping server alive in free hosting
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://elitecode-api.onrender.com/api/test`);
        console.log("Request to / successful:", response.data);
    }
    catch (error) {
        console.error("Error making request to /:", error.message);
    }
}), 13 * 60 * 1000);
// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/codeBlock/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get("/**", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
const port = process.env.PORT || 3030;
http.listen(port, () => {
    logger_service_1.loggerService.info("Server is running on http://localhost:" + port);
});
