import { Response, Request } from "express";
import { logger } from "../utils/logger";
import { db } from "../db/db";
import { carReviews, cars, favoriteCars, userProfiles } from "../db/schema";
import { createCarSchema } from "../utils/validation";
import fs from "fs/promises";
import uploadToCloudinary from "../helpers/cloudinary-helper";
import { eq, and } from "drizzle-orm";

export const getAllCars = async (req: Request, res: Response): Promise<any> => {
  logger.info("getAllCars endpoint hit...");

  try {
    const results = await db.select().from(cars);

    if (!results || results.length === 0) {
      logger.warn("Nenhum carro encontrado");
      return res.status(404).json({
        success: false,
        message: "Nenhum carro encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Erro ao buscar carros:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const getCarById = async (req: Request, res: Response): Promise<any> => {
  logger.info("getCarById endpoint hit...");

  try {
    const { id } = req.params;

    const carId = Number(id);

    const results = await db.select().from(cars).where(eq(cars.id, carId));

    if (!results || results.length === 0) {
      logger.warn("Nenhum carro encontrado");
      return res.status(404).json({
        success: false,
        message: "Nenhum carro encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Erro ao buscar carros:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const getFavoriteCarsByUser = async (req: Request, res: Response): Promise<any> => {
  try {

    const userProfileId = Number(req.params.id);

    if (isNaN(userProfileId)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }

    const favorites = await db
      .select({
        id: cars.id,
        name: cars.name,
        car_model: cars.car_model,
        image_url: cars.image_url,
        year: cars.year,
        price_per_day: cars.price_per_day,
        availability: cars.availability,
      })
      .from(favoriteCars)
      .innerJoin(cars, eq(favoriteCars.carId, cars.id))
      .where(eq(favoriteCars.userProfileId, userProfileId));


    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao buscar favoritos",
    });
  }
};

// export const createCar = async (req: Request, res: Response): Promise<any> => {
//   logger.info("createCar endpoint hit...");
  
//   try {
//     const { error, value } = createCarSchema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//     });

//     if (error) {
//       logger.warn("Erro ao criar um carro", error);
//       return res.status(400).json({
//         success: false,
//         message: "Erro de validação",
//         errors: error.details.map((detail) => detail.message),
//       });
//     }

//     let imageUrl: string | undefined;
//     if ((req.files as any)?.image_url?.[0]) {
//       const file = (req.files as any).image_url[0];
//       const uploadResult = await uploadToCloudinary(file.path);
//       imageUrl = uploadResult.url;
//       await fs.unlink(file.path);
//     }

//     const thumbnails: string[] = [];
//     if ((req.files as any)?.thumbnail_urls) {
//       for (const file of (req.files as any).thumbnail_urls) {
//         const uploadResult = await uploadToCloudinary(file.path);
//         thumbnails.push(uploadResult.url);
//         await fs.unlink(file.path);
//       }
//     }

//     const result = await db
//       .insert(cars)
//       .values({
//         ...value,
//         image_url: imageUrl,
//         thumbnail_urls: thumbnails,
//         reviews: []
//       })
//       .returning();

//     return res.status(201).json({
//       success: true,
//       message: "Carro criado com sucesso",
//       data: result[0],
//     });
//   } catch (error) {
//     logger.error("Erro ao criar carro:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erro interno no servidor",
//     });
//   }
// };

export const createCar = async (req: Request, res: Response): Promise<any> => {
  logger.info("createCar endpoint hit...");
  
  try {
    const { error, value } = createCarSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn("Erro ao criar um carro", error);
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.details.map((detail) => detail.message),
      });
    }

    let imageUrl: string | undefined;
    
    if ((req.files as any)?.image_url && (req.files as any).image_url[0]) {
      const file = (req.files as any).image_url[0];
      const uploadResult = await uploadToCloudinary(file.path);
      imageUrl = uploadResult.url;
      await fs.unlink(file.path);
    }

    const thumbnails: string[] = [];
    if ((req.files as any)?.thumbnail_urls) {
      for (const file of (req.files as any).thumbnail_urls) {
        const uploadResult = await uploadToCloudinary(file.path);
        thumbnails.push(uploadResult.url);
        await fs.unlink(file.path);
      }
    }

    const result = await db
      .insert(cars)
      .values({
        ...value,
        image_url: imageUrl,
        thumbnail_urls: thumbnails,
        reviews: [],
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Carro criado com sucesso",
      data: result[0],
    });
  } catch (error) {
    logger.error("Erro ao criar carro:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const createCarReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { evaluatorName, evaluatorUrl, comment } = req.body;

    const carId = Number(id);

    const existingCar: any = (await db.select().from(cars).where(eq(cars.id, carId)))[0];
    if (!existingCar) {
      return res.status(404).json({
        success: false,
        message: "Carro não encontrado",
      });
    }

    const newReview = {
      name: evaluatorName,
      avatarUrl: evaluatorUrl,
      comment,
    };

    const updatedReviews = existingCar.reviews ? [...existingCar.reviews, newReview] : [newReview];

    await db.update(cars)
      .set({ reviews: updatedReviews })
      .where(eq(cars.id, carId));

    const reviewResult = await db.insert(carReviews).values({
      evaluatorName,
      evaluatorUrl,
      comment,
    }).returning();

    return res.status(201).json({
      success: true,
      message: "Avaliação adicionada com sucesso",
      data: reviewResult[0],
    });
  } catch (error) {
    logger.error("Erro ao criar avaliação", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const updateCar = async (req: Request, res: Response): Promise<any> => {
  logger.info("updateCar endpoint hit...");
  
  try {
    const { error, value } = createCarSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn('Erro ao atualizar o carro', error);
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { id } = req.params;

     const carId = Number(id);

    const existingCar:any = await db.select().from(cars).where(eq(cars.id, carId));
    if (!existingCar) {
      return res.status(404).json({
        success: false,
        message: "Carro não encontrado",
      });
    }

    let imageUrl: string | undefined;
    if ((req.files as any)?.image_url?.[0]) {
      const file = (req.files as any).image_url[0];
      const uploadResult = await uploadToCloudinary(file.path);
      imageUrl = uploadResult.url;
      await fs.unlink(file.path);
    } else {
      imageUrl = existingCar.image_url;
    }

    const thumbnails: string[] = [];
    if ((req.files as any)?.thumbnail_urls) {
      for (const file of (req.files as any).thumbnail_urls) {
        const uploadResult = await uploadToCloudinary(file.path);
        thumbnails.push(uploadResult.url);
        await fs.unlink(file.path);
      }
    } else {
      thumbnails.push(...existingCar.thumbnail_urls);
    }

    const result = await db
      .update(cars)
      .set({
        ...value,
        image_url: imageUrl,
        thumbnail_urls: thumbnails,
      })
      .where(eq(cars.id, carId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Carro atualizado com sucesso",
      data: result[0],
    });
  } catch (error) {
    logger.error("Erro ao atualizar carro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const deleteCar = async(req: Request, res: Response): Promise<any> => {
  logger.info('deleteCar endpoint hit...');
  
  try {
    const { id } = req.params;

    const carId = Number(id);

    await db.delete(cars).where(eq(cars.id, carId)).returning();

    logger.info(`Carro deletada com sucesso`);
    res.status(200).json({ success: true, message: "Carro deletado com sucesso" });
  } catch (error) {
    logger.error("Erro ao deletar carro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
}

export const favoriteCar = async (req: Request, res: Response): Promise<any> => {
  logger.info("favoriteCar endpoint hit...");

  try {
    const { carId, userProfileId } = req.body;

    if (!carId || !userProfileId) {
      return res.status(400).json({
        success: false,
        message: "carId e userProfileId são obrigatórios",
      });
    }

    // Verifica se o carro existe
    const carExists = await db.select().from(cars).where(eq(cars.id, carId)).limit(1);
    if (carExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Carro não encontrado",
      });
    }

    // Verifica se o perfil de usuário existe
    const userExists = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userProfileId))
      .limit(1);

    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verifica se já favoritou
    const alreadyFavorited = await db
    .select()
    .from(favoriteCars)
    .where(
      and(
        eq(favoriteCars.carId, carId),
        eq(favoriteCars.userProfileId, userProfileId)
      )
    )
    .limit(1);

    if (alreadyFavorited.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este carro já está nos favoritos",
      });
    }

    // Insere na tabela de favoritos
    const result = await db
      .insert(favoriteCars)
      .values({
        carId,
        userProfileId,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Carro favoritado com sucesso",
      data: result[0],
    });
  } catch (error) {
    logger.error("Erro ao favoritar carro:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const unfavoriteCar = async (req: Request, res: Response): Promise<any> => {
  try {
    const userProfileId = Number(req.body.userProfileId);
    const carId = Number(req.body.carId);

    if (isNaN(userProfileId) || isNaN(carId)) {
      return res.status(400).json({
        success: false,
        message: "Parâmetros inválidos",
      });
    }

    const result = await db
      .delete(favoriteCars)
      .where(
        and(
          eq(favoriteCars.userProfileId, userProfileId),
          eq(favoriteCars.carId, carId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Favorito não encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Carro removido dos favoritos com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};