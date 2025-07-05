import Joi from "joi";

export const createCarSchema = Joi.object({
  name: Joi.string().required(),
  car_model: Joi.string().required(),
  description: Joi.string().optional(),

  image_url: Joi.string().uri().optional(),
  thumbnail_urls: Joi.array().items(Joi.string().uri()).optional(),

  year: Joi.number().integer().required(),
  color: Joi.string().required(),
  passengers: Joi.number().integer().required(),
  fuel: Joi.string().required(),
  transmission: Joi.string().required(),
  drive_type: Joi.string().required(),

  price_per_hour: Joi.number().required(),
  price_per_day: Joi.number().required(),
  price_per_week: Joi.number().required(),

  acceleration: Joi.string().required(),
  wheels: Joi.string().required(),
  suspension: Joi.string().required(),
  brakes: Joi.string().required(),
  oil_consumption: Joi.string().required(),
  air_conditioning: Joi.string().required(),
  power_steering: Joi.boolean().required(),
  sound_system: Joi.string().required(),
  rear_camera: Joi.string().required(),

  insurance_included: Joi.boolean().default(true),
  fuel_policy: Joi.string().required(),
  availability: Joi.boolean().default(true),

  reviews: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      avatarUrl: Joi.string().uri().optional(),
      comment: Joi.string().required(),
    })
  ).default([]),
});