
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

            phone: Joi.string().pattern(/^\d{10,11}$/).required().messages({
                "string.pattern.base": "Número de telefone inválido. Use 10 ou 11 dígitos.",
                "any.required": "Telefone é obrigatório."
            }),
                
            cpfCnpj: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required().messages({
                "string.pattern.base": "CPF inválido. O formato correto é XXX.XXX.XXX-XX.",
                "any.required": "CPF é obrigatório."
            }),
                
            birthDate: Joi.date().less('now').required().messages({
                "date.less": "A data de nascimento deve ser anterior a data atual.",
                "any.required": "Data de nascimento é obrigatória."
            }).custom((value, helpers:any) => {
                    const age = new Date().getFullYear() - new Date(value).getFullYear();
                    if (age < 18) {
                        return helpers.message("Você deve ter pelo menos 18 anos.");
                    }
                    return value;
            }),
                
            address: Joi.string().min(10).required().messages({
                    "string.min": "O endereço deve ter pelo menos 10 caracteres.",
                    "any.required": "Endereço é obrigatório."
            })
        });

    return schema.validate(data);
}

export const validateLogin = (data: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      "string.email": "Formato de e-mail inválido.",
      "any.required": "Email é obrigatório."
    }),
    
    password: Joi.string().min(6).required().messages({
      "any.required": "Senha é obrigatória.",
    }),
  });

  return schema.validate(data);
};