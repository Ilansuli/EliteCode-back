import { loggerService } from "../../services/logger.service";
import { Request, Response } from "express";
import { query, getById, update, remove } from "./codeBlock.service";

export async function getCodeBlocks(req: Request, res: Response) {
  try {
    loggerService.debug("Getting CodeBlocks");
    const codeBlocks = await query();
    res.json(codeBlocks);
  } catch (err) {
    loggerService.error("Failed to get codeBlocks", err);
    res.status(500).send({ err: "Failed to get codeBlocks" });
  }
}

export async function getCodeBlockById(req: Request, res: Response) {
  try {
    const codeBlockId = req.params.id;
    const codeBlock = await getById(codeBlockId);
    res.json(codeBlock);
  } catch (err) {
    loggerService.error("Failed to get codeBlock", err);
    res.status(500).send({ err: "Failed to get codeBlock" });
  }
}

export async function updateCodeBlock(req: Request, res: Response) {
  try {
    const codeBlock = req.body;
    const updatedCodeBlock = await update(codeBlock);
    res.json(updatedCodeBlock);
  } catch (err) {
    loggerService.error("Failed to update codeBlock", err);
    res.status(500).send({ err: "Failed to update codeBlock" });
  }
}

export async function removeCodeBlock(req: Request, res: Response) {
  try {
    const codeBlockId = req.params.id;
    const removedId = await remove(codeBlockId);
    res.send(removedId);
  } catch (err) {
    loggerService.error("Failed to remove codeBlock", err);
    res.status(500).send({ err: "Failed to remove codeBlock" });
  }
}
