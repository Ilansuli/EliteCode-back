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
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getById = getById;
exports.remove = remove;
exports.update = update;
const db_service_1 = require("../../services/db.service");
const logger_service_1 = require("../../services/logger.service");
const mongodb_1 = require("mongodb");
function query() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, db_service_1.getCollection)("codeBlock");
            var codeBlocks = yield collection.find().toArray();
            return codeBlocks;
        }
        catch (err) {
            logger_service_1.loggerService.error("cannot find codeBlocks", err);
            throw err;
        }
    });
}
function getById(codeBlockId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, db_service_1.getCollection)("codeBlock");
            const codeBlock = collection.findOne({ _id: new mongodb_1.ObjectId(codeBlockId) });
            return codeBlock;
        }
        catch (err) {
            logger_service_1.loggerService.error(`while finding codeBlock ${codeBlockId}`, err);
            throw err;
        }
    });
}
function remove(codeBlockId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, db_service_1.getCollection)("codeBlock");
            yield collection.deleteOne({ _id: new mongodb_1.ObjectId(codeBlockId) });
            return codeBlockId;
        }
        catch (err) {
            logger_service_1.loggerService.error(`cannot remove codeBlock ${codeBlockId}`, err);
            throw err;
        }
    });
}
function update(codeBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, db_service_1.getCollection)("codeBlock");
            const { _id } = codeBlock;
            delete codeBlock._id;
            yield collection.updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: codeBlock });
            return codeBlock;
        }
        catch (err) {
            logger_service_1.loggerService.error(`cannot update codeBlock ${codeBlock._id}`, err);
            throw err;
        }
    });
}
