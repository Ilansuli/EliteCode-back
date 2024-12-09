import { loggerService } from "../services/logger.service";
import { NextFunction, Request, Response } from "express";

export async function log(req: Request, res: Response, next: NextFunction) {
  // logger.info('Sample Logger Middleware')
  next();
}
