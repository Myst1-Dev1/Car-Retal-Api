import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from '../db/db';
import { users } from '../db/schema';
import { validateLogin, validateRegistration } from '../utils/validation';
import axios from 'axios';

export const register = async (req: Request, res: Response): Promise<any> => {
  logger.info('Registration endpoint hit...');
  
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn('Validation error', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, passwordHash, phone, address, cpfCnpj, birthDate } = req.body;

    if(!email || !passwordHash || !phone || !address || !cpfCnpj || !birthDate) {
      logger.warn('Campos incompletos ou erro');
      return res.status(400).json({
        success: false,
        message: 'Campos incompletos ou erro',
      });
    }

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      logger.warn(`Email já registrado: ${email}`);
      return res.status(409).json({
        success: false,
        message: "Este e-mail já está em uso",
      });
    }

    const passwordHashed = await bcrypt.hash(passwordHash, 10);

    const inserted = await db.insert(users).values({
      email,
      passwordHash: passwordHashed,
    }).returning();

    const userId = inserted[0].id;

    logger.info("Usuário registrado com sucesso, criando perfil...");

    await axios.post(`${process.env.USER_SERVICE_URL}/createProfile`, {
      userId,
      fullName: "Novo usuário",
      phone,
      address,
      cpfCnpj,
      birthDate,
      avatarUrl: "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png"
    });

    res.status(201).json({ success: true, message: "Usuário registrado" });

  } catch (error: any) {
    logger.error('Registration error occurred', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response) : Promise<any> => {
  logger.info("Login endpoint hit...");

  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    logger.info("Attempting login for:", email);

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      logger.warn("User not found:", email);
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!isPasswordValid) {
      logger.warn("Invalid password attempt for:", email);
      return res.status(401).json({ success: false, message: "Senha incorreta" });
    }
    
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    logger.info("Login successful:", email);
    return res.status(200).json({ success: true, token });
  } catch (error) {
    logger.error("Login error occurred", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  logger.info("GetUser endpoint hit...");

  try {
    const result = await db.select().from(users);

    const usersWithoutPasswords = result.map(({ passwordHash, ...rest }) => rest);

    logger.info(`Fetched ${result.length} users`);
    res.status(200).json({
      success: true,
      data: usersWithoutPasswords,
    });
  } catch (error) {
    logger.error("GetUser error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};