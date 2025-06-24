import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export const register = async(req:Request, res:Response) => {
    logger.info('Registration endpoint hit...');
    
    try {
        logger.info("Register request received", req.body);
        res.status(201).json({ message: "User registered (stub)" });
    } catch (error) {
        logger.error('Registration error ocurred', error);
        res.status(500).json({
            success: 'false',
            message: 'Internal server error'
        });
    }
}

export const login = async(req:Request, res:Response) => {
    logger.info('Login endpoint hit...');
    
    try {
        logger.info("Register request received", req.body);
        res.status(201).json({ message: "User registered (stub)" });
    } catch (error) {
        logger.error('Registration error ocurred', error);
        res.status(500).json({
            success: 'false',
            message: 'Internal server error'
        });
    }
}