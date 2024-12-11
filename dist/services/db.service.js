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
exports.getCollection = getCollection;
const mongodb_1 = require("mongodb");
const index_1 = __importDefault(require("../config/index"));
const logger_service_1 = require("./logger.service");
var dbConn = null;
function getCollection(collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield connect();
            const collection = db === null || db === void 0 ? void 0 : db.collection(collectionName);
            return collection;
        }
        catch (err) {
            logger_service_1.loggerService.error("Failed to get Mongo collection", err);
            throw err;
        }
    });
}
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (dbConn)
            return dbConn;
        try {
            if (index_1.default.dbURL) {
                logger_service_1.loggerService.info(dbConn, "db is firstly connecting");
                const client = yield mongodb_1.MongoClient.connect(index_1.default.dbURL, {
                    ssl: true,
                    tls: true,
                });
                const db = client.db(index_1.default.dbName);
                logger_service_1.loggerService.error("Missing dbURL in the configuration");
                dbConn = db;
                return db;
            }
        }
        catch (err) {
            logger_service_1.loggerService.error("Cannot Connect to DB", err);
            throw err;
        }
    });
}
