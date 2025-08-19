import Joi from "joi";

export const createCarSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  car_model: Joi.string().required(),

  image_url: Joi.string().uri().optional(),
  thumbnail_urls: Joi.array().items(Joi.string().uri()).optional(),

  year: Joi.number().integer().required(),
  passengers: Joi.number().integer().required(),
  fuel: Joi.string().required(),
  fuel_capacity: Joi.number().required(),
  transmission: Joi.string().required(),

  price_per_hour: Joi.number().required(),
  price_per_day: Joi.number().required(),
  price_per_week: Joi.number().required(),

  availability: Joi.boolean().default(false),

  reviews: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        avatarUrl: Joi.string().uri().optional(),
        comment: Joi.string().required(),
      })
    )
    .default([]),
});