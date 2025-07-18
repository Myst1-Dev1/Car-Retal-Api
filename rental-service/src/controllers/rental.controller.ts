import { Request, Response } from "express";
import { logger } from "../utils/logger";

export const getRental = async(req:Request, res:Response) => {
    logger.info("getRental endpoint hit...");
    try {
        res.send("Rota de aluguel funciona!");
    } catch (error) {
        logger.error("Erro ao buscar posts:", error);
            res.status(500).json({
            success: false,
            message: "Erro interno no servidor",
        });
    }
}