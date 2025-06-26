import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { db } from "../db/db";
import { userProfiles } from "../db/userProfiles.schema";
import { eq } from "drizzle-orm";

export const createProfile = async(req: Request, res: Response): Promise<any> => {
    logger.info("createProfile endpoint hit...");
    
    try {
        const { userId, fullName, avatarUrl } = req.body;

        if (!userId || !fullName) {
            return res.status(400).json({
                success: false,
                message: "Informe userId e fullName",
            });
        }

        const result = await db.insert(userProfiles).values({
            userId, fullName, avatarUrl
        });

        res.status(201).json({ success: true, data: result });

        logger.info("Perfil criado com sucesso!");
        
    } catch (error) {
        logger.error("Create profile error occurred", error);
            res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const updateProfile = async (req: Request | any, res: Response): Promise<any> => {
  logger.info("updateProfile endpoint hit...");

  try {
    const userId = req.user?.id;
    const { fullName, avatarUrl } = req.body;

    if (!userId || !fullName) {
      logger.warn("Dados incompletos para atualização");
      return res.status(400).json({
        success: false,
        message: "Informe userId e fullName",
      });
    }

    const updated = await db
      .update(userProfiles)
      .set({ fullName, avatarUrl })
      .where(eq(userProfiles.userId, userId))
      .returning();

    if (updated.length === 0) {
      logger.warn(`Perfil não encontrado para userId=${userId}`);
      return res.status(404).json({
        success: false,
        message: "Perfil não encontrado",
      });
    }

    logger.info(`Perfil atualizado com sucesso para userId=${userId}`);
    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error("Update profile error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};