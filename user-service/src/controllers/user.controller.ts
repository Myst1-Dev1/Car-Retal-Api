import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { db } from "../db/db";
import { userProfiles, users } from "../db/userProfiles.schema";
import { eq } from "drizzle-orm";
import uploadToCloudinary from "../helpers/cloudinary-helper";

export const getAllProfiles = async(req: Request, res: Response): Promise<any> => {
  logger.info("getAllProfiles endpoint hit...");

  try {
    const result = await db.select().from(userProfiles);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
      logger.error("Get all profiles error occurred", error);
          res.status(500).json({
          success: false,
          message: "Internal server error",
      });
  }
}

export const getProfileById = async(req: Request | any, res: Response): Promise<any> => {
  logger.info("getProfileById endpoint hit...");

  try {
    const userId = req.user?.id;

    if (!userId) {
      logger.warn("Usuário não autenticado");
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
      logger.error("Get single profile error occurred", error);
          res.status(500).json({
          success: false,
          message: "Internal server error",
      });
  }
}

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
    const { fullName } = req.body;
    const avatar = req.file;

    if (!userId || !fullName) {
      logger.warn("Dados incompletos para atualização");
      return res.status(400).json({
        success: false,
        message: "Informe userId e fullName",
      });
    }

    let avatarUrl = null;
    if (avatar) {
      const uploadResult = await uploadToCloudinary(avatar.path);
      avatarUrl = uploadResult.url;
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

export const deleteAccount = async (req: Request | any, res: Response): Promise<any> => {
  logger.info("deleteAccount endpoint hit...");

  try {
    const userId = req.user?.id;

    if (!userId) {
      logger.warn("Id do usuário não encontrado!");
      return res.status(400).json({
        success: false,
        message: "Id do usuário não foi encontrado",
      });
    }

    const deletedProfile = await db
      .delete(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .returning();

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (deletedProfile.length === 0 || deletedUser.length === 0) {
      logger.warn(`Erro ao deletar conta para userId=${userId}`);
      return res.status(404).json({
        success: false,
        message: "Usuário ou perfil não encontrados",
      });
    }

    logger.info(`Conta deletada com sucesso para userId=${userId}`);
    res.status(200).json({ success: true, message: "Conta deletada com sucesso" });
  } catch (error) {
    logger.error("Erro ao deletar conta", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};