import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { db } from "../db/db";
import { rentals, cars, userProfiles } from "../db/schema";
import { eq, and, or, between, lte, gte } from "drizzle-orm";
import { createRentalSchema } from "../utils/validation";

export const getAllRentals = async(req: Request, res: Response): Promise<any> => {
    logger.info("getAllRentals endpoint hit...");
    try {
        const results = await db.select().from(rentals);

        if(results.length === 0) {
            logger.warn("Nenhum aluguel encontrado");
            return res.status(404).json({
                success: false,
                message: "Nenhum aluguel encontrado",
            });
        }

        res.status(201).json({
            success: true,
            data: results
        });
        
    } catch (error) {
        logger.error("Erro ao pegar dados dos alugueis:", error);
        return res.status(500).json({
        success: false,
        message: "Erro interno no servidor",
        });
    }
};

export const getRentalById = async(req: Request, res: Response): Promise<any> => {
  logger.info("getRentalById endpoint hit...");
  
  try {
    const rentalId = Number(req.params.id);

    const result = await db.select().from(rentals).where(eq(rentals.id, rentalId));

    if (!result || result.length === 0) {
      logger.warn("Nenhum aluguel encontrado");
      return res.status(404).json({
        success: false,
        message: "Nenhum carro encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Erro ao pegar os dados de um aluguel:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const createRental = async (req: Request, res: Response): Promise<any> => {
  logger.info("createRental endpoint hit...");

  try {

    // Validação com Joi
    const { error, value } = createRentalSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn("Erro de validação ao criar aluguel", error);
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const {
      userId,
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
    } = value;

    // Validação de campos obrigatórios
    if (!userId || !carId || !startDate || !endDate) {
      logger.warn("Campos obrigatórios ausentes");
      return res.status(400).json({
        success: false,
        message: "userId, carId, startDate e endDate são obrigatórios",
      });
    }

    const start: any = new Date(startDate);
    const end: any = new Date(endDate);

    // Verifica se o carro está alugado no período
    const conflictingRentals = await db
      .select()
      .from(rentals)
      .where(
        and(
          eq(rentals.carId, carId),
          eq(rentals.status, "ativo"),
          or(
            between(start, rentals.startDate, rentals.endDate),
            between(end, rentals.startDate, rentals.endDate),
            and(
              lte(rentals.startDate, start),
              gte(rentals.endDate, end)
            )
          )
        )
      );

    if (conflictingRentals.length > 0) {
      logger.warn("Carro já alugado no período solicitado");
      return res.status(400).json({
        success: false,
        message: "Este carro já está alugado nesse período",
      });
    }

    // Busca o preço por dia
    const carData = await db.select().from(cars).where(eq(cars.id, carId));
    if (carData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Carro não encontrado",
      });
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerDay = carData[0].price_per_day ?? 0;
    const totalPrice = days * pricePerDay;

    // ✅ Insere aluguel
    const inserted = await db
      .insert(rentals)
      .values({
        userId,
        carId,
        startDate: start,
        endDate: end,
        pickupLocation,
        dropoffLocation,
        totalPrice,
        status: "ativo",
      })
      .returning();

    logger.info(`Aluguel criado para o carro ${carId} por ${days} dia(s)`);

    // 1️⃣ Atualiza o rentalHistory do usuário
    const user:any = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    const newRentalHistory = user[0].rentalHistory ? [...user[0].rentalHistory, inserted[0]] : [inserted[0]];

    await db
      .update(userProfiles)
      .set({ rentalHistory: newRentalHistory })
      .where(eq(userProfiles.userId, userId));

    // 2️⃣ Atualiza a disponibilidade do carro
    await db
      .update(cars)
      .set({ availability: true })
      .where(eq(cars.id, carId));

    return res.status(201).json({
      success: true,
      message: "Aluguel criado com sucesso",
      data: inserted[0],
    });
  } catch (error) {
    logger.error("Erro ao criar aluguel:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const returnRental = async (req: Request, res: Response) => {
  logger.info("returnRental endpoint hit...");

  try {
    const rentalId = Number(req.params.id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const rental: any = await db
      .select()
      .from(rentals)
      .where(eq(rentals.id, rentalId));

    if (rental.length === 0) {
      return res.status(404).json({ success: false, message: "Aluguel não encontrado" });
    }

    const now = new Date();
    const start = new Date(rental[0].startDate);
    const days = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerDay = rental[0].totalPrice / days || 0;
    const finalPrice = days * pricePerDay;

    // 1. Atualiza a tabela rentals
    const result = await db
      .update(rentals)
      .set({
        endDate: now,
        totalPrice: finalPrice,
        status: "finalizado",
      })
      .where(eq(rentals.id, rentalId))
      .returning();

    const updatedRental = result[0];

    // 2. Pega o rentalHistory do userProfiles
    const userProfile: any = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, rental[0].userId));

    if (userProfile.length > 0) {
      const history = userProfile[0].rentalHistory || [];

      // 3. Atualiza o item correspondente no histórico
      const updatedHistory = history.map((h: any) =>
        h.id === rentalId
          ? {
              ...h,
              status: "finalizado",
              endDate: now,
              totalPrice: finalPrice,
            }
          : h
      );

      // 4. Atualiza o rentalHistory no banco
      await db
        .update(userProfiles)
        .set({ rentalHistory: updatedHistory })
        .where(eq(userProfiles.userId, rental[0].userId));
    }

    return res.status(200).json({
      success: true,
      message: "Aluguel finalizado com sucesso",
      data: updatedRental,
    });
  } catch (error) {
    logger.error("Erro ao finalizar aluguel:", error);
    return res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};

export const cancelRental = async (req: Request, res: Response) => {
  logger.info("cancelRental endpoint hit...");

  try {
    const rentalId = Number(req.params.id);
    if (isNaN(rentalId)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const rental: any = await db
      .select()
      .from(rentals)
      .where(eq(rentals.id, rentalId));

    if (rental.length === 0) {
      return res.status(404).json({ success: false, message: "Aluguel não encontrado" });
    }

    const now = new Date();
    if (new Date(rental[0].startDate) <= now) {
      return res
        .status(400)
        .json({ success: false, message: "Não é possível cancelar um aluguel já iniciado" });
    }

    // 1. Atualiza a tabela rentals
    const result = await db
      .update(rentals)
      .set({ status: "cancelado" })
      .where(eq(rentals.id, rentalId))
      .returning();

    const updatedRental = result[0];

    // 2. Busca o perfil do usuário
    const userProfile: any = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, rental[0].userId));

    if (userProfile.length > 0) {
      const history = userProfile[0].rentalHistory || [];

      // 3. Atualiza o item correspondente no histórico
      const updatedHistory = history.map((h: any) =>
        h.id === rentalId
          ? {
              ...h,
              status: "cancelado",
              endDate: now, // opcional: marcar quando foi cancelado
            }
          : h
      );

      // 4. Salva o histórico atualizado no banco
      await db
        .update(userProfiles)
        .set({ rentalHistory: updatedHistory })
        .where(eq(userProfiles.userId, rental[0].userId));
    }

    return res.status(200).json({
      success: true,
      message: "Aluguel cancelado com sucesso",
      data: updatedRental,
    });
  } catch (error) {
    logger.error("Erro ao cancelar aluguel:", error);
    return res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};

export const checkAvailability = async (req: Request, res: Response) => {
  logger.info("checkAvailability endpoint hit...");

  try {
    const carId = Number(req.query.carId);
    const startDate:any = new Date(String(req.query.startDate));
    const endDate:any = new Date(String(req.query.endDate));

    if (isNaN(carId) || !startDate || !endDate || startDate >= endDate) {
      return res.status(400).json({ success: false, message: "Parâmetros inválidos" });
    }

    const conflicts = await db.select().from(rentals).where(
      and(
        eq(rentals.carId, carId),
        eq(rentals.status, "ativo"),
        or(
          between(startDate, rentals.startDate, rentals.endDate),
          between(endDate, rentals.startDate, rentals.endDate),
          and(
            lte(rentals.startDate, startDate),
            gte(rentals.endDate, endDate)
          )
        )
      )
    );

    const available = conflicts.length === 0;

    return res.status(200).json({
      success: true,
      available,
      message: available ? "Carro disponível" : "Carro já alugado neste período"
    });
  } catch (error) {
    logger.error("Erro ao verificar disponibilidade:", error);
    return res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};