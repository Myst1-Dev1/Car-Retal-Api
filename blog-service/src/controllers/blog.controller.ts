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

export const createPost = async (req: Request, res: Response) => {
  logger.info("createPost endpoint hit...");

  try {
    if (typeof req.body.post_categories === "string") {
      try {
        req.body.post_categories = JSON.parse(req.body.post_categories);
      } catch {
      }
    }

    if (typeof req.body.related_posts === "string") {
      req.body.related_posts = JSON.parse(req.body.related_posts);
    }

    if (typeof req.body.related_posts === "string") {
      try { req.body.related_posts = JSON.parse(req.body.related_posts); } catch {}
    }

    const { error, value } = createPostSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn("Erro ao criar um artigo", error);
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.details.map((d) => d.message),
      });
    }

    const postImg = req.file as Express.Multer.File | undefined;

    let postUrl: string | null = null;
    if (postImg) {
      try {
        const uploadResult = await uploadToCloudinary(postImg.path);
        postUrl = uploadResult.url;
      } finally {
        try { await fs.unlink(postImg.path); } catch {}
      }
    }

    const [inserted] = await db
      .insert(posts)
      .values({
        ...value,
        post_image_url: postUrl,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Artigo criado com sucesso",
      data: inserted,
    });
  } catch (error) {
    logger.error("Erro ao criar um artigo:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  logger.info("updatePost endpoint hit...");

  try {
    const { id } = req.params;
    const postId = Number(id);

    if (Number.isNaN(postId)) {
      return res.status(400).json({ success: false, message: "ID do post inválido" });
    }

    if (typeof req.body.post_categories === "string") {
      try { req.body.post_categories = JSON.parse(req.body.post_categories); } catch {}
    }

    if (typeof req.body.related_posts === "string") {
      try { req.body.related_posts = JSON.parse(req.body.related_posts); } catch {}
    }

    const { error, value } = createPostSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn("Erro ao atualizar um artigo", error);
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.details.map((d) => d.message),
      });
    }

    const existingPost = await db.select().from(posts).where(eq(posts.id, postId));
    if (!existingPost || existingPost.length === 0) {
      return res.status(404).json({ success: false, message: "Artigo não encontrado" });
    }

    const postImg = req.file as Express.Multer.File | undefined;
    let postUrl = existingPost[0].post_image_url;

    if (postImg) {
      try {
        const uploadResult = await uploadToCloudinary(postImg.path);
        postUrl = uploadResult.url;
      } finally {
        try { await fs.unlink(postImg.path); } catch {}
      }
    }

    const updateData: Record<string, any> = { ...value };

    if (postUrl) updateData.post_image_url = postUrl;

    if (!Array.isArray(updateData.post_categories)) updateData.post_categories = [];
    if (!Array.isArray(updateData.related_posts)) updateData.related_posts = [];

    const result = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Artigo atualizado com sucesso",
      data: result[0],
    });
  } catch (error) {
    logger.error("Erro ao atualizar um artigo:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

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
};

export const addCommentToPost = async (req: Request, res: Response) => {
  logger.info("addCommentToPost endpoint hit...");

  try {
    const { id } = req.params;
    const postId = Number(id);

    if (Number.isNaN(postId)) {
      return res.status(400).json({ success: false, message: "ID do post inválido" });
    }

    const { name, avatarUrl, comment } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ success: false, message: "Nome e comentário são obrigatórios" });
    }

    // Busca o post existente
    const existingPosts = await db.select().from(posts).where(eq(posts.id, postId));
    if (!existingPosts || existingPosts.length === 0) {
      return res.status(404).json({ success: false, message: "Post não encontrado" });
    }

    const post = existingPosts[0];

    const newComment = {
      name,
      avatarUrl: avatarUrl || null,
      comment,
      createdAt: new Date().toISOString(),
    };

    const existingComments = Array.isArray(post.post_comments) ? post.post_comments : [];

    const updatedComments = [...existingComments, newComment];

    const result = await db
      .update(posts)
      .set({ post_comments: updatedComments })
      .where(eq(posts.id, postId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Comentário adicionado com sucesso",
      data: result[0],
    });

  } catch (error) {
    logger.error("Erro ao adicionar comentário:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};