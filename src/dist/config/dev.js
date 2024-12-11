"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.dev = {
    dbURL: process.env.DB_URL,
    dbName: process.env.DB_NAME,
};
