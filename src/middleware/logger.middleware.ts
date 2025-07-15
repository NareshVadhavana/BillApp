import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger/logger.service';

export const routeAccessLogger = (req: Request, res: Response, next: NextFunction) => {
  const logFormat = `${req.method} ${req.originalUrl} ${res.statusCode}`;
  logger.info(logFormat);
  next();
};
