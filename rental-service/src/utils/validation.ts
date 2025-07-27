import Joi from "joi";

export const createRentalSchema = Joi.object({
  userId: Joi.number().integer().required(),
  carId: Joi.number().integer().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required()
    .messages({
      "date.greater": "A data de término deve ser depois da data de início"
    }),
  pickupLocation: Joi.string().optional(),
  dropoffLocation: Joi.string().optional(),
});