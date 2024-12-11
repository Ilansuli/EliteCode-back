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
exports.getCodeBlocks = getCodeBlocks;
exports.getCodeBlockById = getCodeBlockById;
exports.updateCodeBlock = updateCodeBlock;
exports.removeCodeBlock = removeCodeBlock;
const logger_service_1 = require("../../services/logger.service");
const codeBlock_service_1 = require("./codeBlock.service");
function getCodeBlocks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_service_1.loggerService.debug("Getting CodeBlocks");
            const codeBlocks = yield (0, codeBlock_service_1.query)();
            res.json(codeBlocks);
        }
        catch (err) {
            logger_service_1.loggerService.error("Failed to get codeBlocks", err);
            res.status(500).send({ err: "Failed to get codeBlocks" });
        }
    });
}
function getCodeBlockById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const codeBlockId = req.params.id;
            const codeBlock = yield (0, codeBlock_service_1.getById)(codeBlockId);
            res.json(codeBlock);
        }
        catch (err) {
            logger_service_1.loggerService.error("Failed to get codeBlock", err);
            res.status(500).send({ err: "Failed to get codeBlock" });
        }
    });
}
function updateCodeBlock(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const codeBlock = req.body;
            const updatedCodeBlock = yield (0, codeBlock_service_1.update)(codeBlock);
            res.json(updatedCodeBlock);
        }
        catch (err) {
            logger_service_1.loggerService.error("Failed to update codeBlock", err);
            res.status(500).send({ err: "Failed to update codeBlock" });
        }
    });
}
function removeCodeBlock(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const codeBlockId = req.params.id;
            const removedId = yield (0, codeBlock_service_1.remove)(codeBlockId);
            res.send(removedId);
        }
        catch (err) {
            logger_service_1.loggerService.error("Failed to remove codeBlock", err);
            res.status(500).send({ err: "Failed to remove codeBlock" });
        }
    });
}
