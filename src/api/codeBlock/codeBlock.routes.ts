import { Router } from "express";
import {
  getCodeBlocks,
  getCodeBlockById,
  updateCodeBlock,
  removeCodeBlock,
} from "./codeBlock.controller";
export const router = Router();

router.get("/", getCodeBlocks);
router.get("/:id", getCodeBlockById);
router.put("/:id", updateCodeBlock);
router.delete("/:id", removeCodeBlock);
