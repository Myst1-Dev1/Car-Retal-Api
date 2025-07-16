import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { db } from "../db/db";
import { posts } from "../db/schema";
import { createPostSchema } from "../utils/validation";
import fs from "fs/promises";
import uploadToCloudinary from "../helpers/cloudnary-helper";
import { eq } from "drizzle-orm";

export const getPost = async(req: Request, res: Response) => {
    logger.info("getPost endpoint hit...");

    try {
        const results = await db.select().from(posts);

        if (!results || results.length === 0) {
            logger.warn("Nenhum artigo encontrado");
            return res.status(404).json({
                success: false,
                message: "Nenhum artigo encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        logger.error("Erro ao buscar posts:", error);
            res.status(500).json({
            success: false,
            message: "Erro interno no servidor",
        });
    }
}

export const getPostById = async(req: Request, res: Response) => {
    logger.info("getPostById endpoint hit...");
    
    try {
        const { id } = req.params;

        const postId = Number(id);

        const result = await db.select().from(posts).where(eq(posts.id, postId));

        if (!result || result.length === 0) {
            logger.warn("Nenhum artigo encontrado");
            return res.status(404).json({
                success: false,
                message: "Nenhum artigo encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        logger.error("Erro ao buscar post pelo id:", error);
            res.status(500).json({
            success: false,
            message: "Erro interno no servidor",
        });
    }
}

export const createPost = async(req: Request, res: Response) => {
    logger.info("createPost endpoint hit...");
    
    try {

        if (typeof req.body.post_categories === "string") {
            req.body.post_categories = JSON.parse(req.body.post_categories);
        }

        if (typeof req.body.post_description === "string") {
            req.body.post_description = JSON.parse(req.body.post_description);
        }

        const { error, value } = createPostSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const postImg = req.file;

        if (error) {
        logger.warn("Erro ao criar um artigo", error);
        return res.status(400).json({
            success: false,
            message: "Erro de validação",
            errors: error.details.map((detail) => detail.message),
        });
        }

        let postUrl = null;
            if (postImg) {
                const uploadResult = await uploadToCloudinary(postImg.path);
                postUrl = uploadResult.url;
        }

        const result:any = await db.insert(posts).values({
            ...value,
            post_image_url: postUrl
        });

        return res.status(201).json({
        success: true,
        message: "Artigo criado com sucesso",
        data: result[0],
        });

    } catch (error) {
        logger.error("Erro ao criar um artigo:", error);
            res.status(500).json({
            success: false,
            message: "Erro interno no servidor",
        });
    }
}

export const updatePost = async(req: Request, res: Response) => {
    logger.info("updatePost endpoint hit...");
    
    try {

        if (typeof req.body.post_categories === "string") {
            req.body.post_categories = JSON.parse(req.body.post_categories);
        }

        if (typeof req.body.post_description === "string") {
            req.body.post_description = JSON.parse(req.body.post_description);
        }

        const { error, value } = createPostSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const { id } = req.params;
        const postId = Number(id);

        const postImg = req.file;

        if (error) {
            logger.warn("Erro ao criar um artigo", error);
            return res.status(400).json({
                success: false,
                message: "Erro de validação",
                errors: error.details.map((detail) => detail.message),
        });
        }

        const existingPosts:any = await db.select().from(posts).where(eq(posts.id, postId));
        if (!existingPosts) {
        return res.status(404).json({
            success: false,
            message: "Artigo não encontrado não encontrado",
        });
        }

        let postUrl = null;
        if (postImg) {
            const uploadResult = await uploadToCloudinary(postImg.path);
            postUrl = uploadResult.url;
        }

        const result:any = await db.update(posts)
        .set({
            ...value,
             post_image_url: postUrl
        }).where(eq(posts.id, postId))
        .returning();

        return res.status(201).json({
        success: true,
        message: "Artigo atualizado com sucesso",
        data: result[0],
        });

    } catch (error) {
        logger.error("Erro ao atualizar um artigo:", error);
            res.status(500).json({
            success: false,
            message: "Erro interno no servidor",
        });
    }
}

export const deletePost = async(req: Request, res: Response) => {
    logger.info("deletePost endpoint hit...");
    
    try {
        const { id } = req.params;

        const postId = Number(id);

        await db.delete(posts).where(eq(posts.id, postId)).returning();

        logger.info(`Artigo deletado com sucesso`);
        res.status(200).json({ success: true, message: "Artigo deletado com sucesso" });

    } catch (error) {
        logger.error("Erro ao deletar um artigo:", error);
            res.status(500).json({
            success: false,
            message: "Erro interno no servidor",
        });
    }
}