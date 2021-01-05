import { NextFunction, Request, Response } from 'express';

export const authMiddleware = (_: Request, res: Response, next: NextFunction) => {
     console.log('Middleware working...');
     next();
};