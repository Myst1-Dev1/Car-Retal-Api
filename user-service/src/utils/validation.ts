import Joi from "joi";

export const validateProfile = (data: { fullName: string, phone: string, cpfCnpj: string, birthDate: string, address: string }) => {
    const schema = Joi.object({
        fullName: Joi.string().min(3).required().messages({
            "string.min": "O nome deve ter pelo menos 3 caracteres"
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