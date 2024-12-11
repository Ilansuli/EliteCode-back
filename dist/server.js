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
// init
const app = (0, express_1.default)();
app.use(express_1.default.json());
const http = (0, http_1.createServer)(app);
(0, dotenv_1.config)();
(0, socket_service_1.setupSocketAPI)(http);
const corsOptions = {
    origin: "https://elite-code.onrender.com",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.resolve(__dirname, "public")));
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
// keeping server alive in free hosting
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://elite-code-api.onrender.com/api/test`);
        console.log("Request to /api/test successful:", response.data);
    }
    catch (error) {
        console.error("Error making request to /api/test:", error.message);
    }
}), 13 * 60 * 1000);
// catch-all for spa routes
app.get("/**", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
const port = process.env.PORT || 3030;
http.listen(port, () => {
    logger_service_1.loggerService.info("Server is running on http://localhost:" + port);
});
