import Joi from "joi";

export const createPostSchema = Joi.object({
  post_image_url: Joi.string().uri().optional(),

  post_title: Joi.string().min(3).max(300).required(),

  post_description: Joi.string().min(1).required(),

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