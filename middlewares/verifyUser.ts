import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Unauthorized access: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Unauthorized access: Invalid token' });
        }

        req.body.decoded = decoded;
        next();
    });
};
