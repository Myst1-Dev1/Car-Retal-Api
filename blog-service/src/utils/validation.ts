import Joi from "joi";

export const createPostSchema = Joi.object({
  post_image_url: Joi.string().uri().optional(),

  post_title: Joi.string().min(3).max(300).required(),

  post_description: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid("text", "image").required(),
        content: Joi.string().when("type", {
          is: "text",
          then: Joi.required(),
          otherwise: Joi.forbidden()
        }),
        url: Joi.string().uri().when("type", {
          is: "image",
          then: Joi.required(),
          otherwise: Joi.forbidden()
        }),
      })
    )
    .required(),

  post_comments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        avatarUrl: Joi.string().uri().optional(),
        comment: Joi.string().required(),
      })
    )
    .default([]),

  post_categories: Joi.array().items(Joi.string()).default([]),

  related_posts: Joi.array().items(Joi.number().integer()).default([]),

  createdAt: Joi.date().default(() => new Date()),
});