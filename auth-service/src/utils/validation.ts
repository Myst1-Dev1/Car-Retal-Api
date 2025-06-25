
import { ValidateRegister } from "../types/ValidateRegister";
import Joi from "joi";

export const validateRegistration = (data:ValidateRegister) => {
    const schema = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required()
            .messages({
            "string.email": "Formato de e-mail inválido.",
            "any.required": "Email é obrigatório.",
        }),

        passwordHash: Joi.string()
            .min(6)
            .required()
            .messages({
            "string.min": "A senha deve ter no mínimo 6 caracteres.",
            "any.required": "Senha é obrigatória.",
            }),
        });

    return schema.validate(data);
}

export const validateLogin = (data: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        "string.email": "Formato de e-mail inválido.",
        "any.required":"Email é obrigatório."
    }),
    password: Joi.string().min(6).required().messages({
        "any.required": "Senha é obrigatória.",
        }),
  });

  return schema.validate(data);
};