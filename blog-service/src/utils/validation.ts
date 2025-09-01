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
        createdAt: Joi.string().isoDate().required()
      })
    )
    .default([]),

  post_categories: Joi.array().items(Joi.string()).default([]),

  related_posts: Joi.array().items(
    Joi.object({
      id: Joi.number().required(),
      post_title: Joi.string().required(),
      post_description: Joi.string().required(),
      post_image_url: Joi.string().uri().optional(),
      post_comments: Joi.array().default([]),
      post_categories: Joi.array().items(Joi.string()).default([]),
      createdAt: Joi.string().isoDate().required(),
      related_posts: Joi.array().default([]),
    })
  ).default([]),

  createdAt: Joi.date().default(() => new Date()),
});