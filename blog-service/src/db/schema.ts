import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  rentalHistory: jsonb("rental_history"),
  favorites: jsonb("favorites"),
  userType: text("user_type"),
  cpfCnpj: text("cpf_cnpj"),
  birthDate: timestamp("birth_date"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),
  description: text("description"),
  car_model: text("car_model").notNull(),
  image_url: text("image_url"),
  thumbnail_urls: text("thumbnail_urls").array(),

  year: integer("year"),
  passengers: integer("passengers"),
  fuel: text("fuel"),
  fuel_capacity: real("fuel_capacity"),
  transmission: text("transmission"),

  price_per_hour: real("price_per_hour"),
  price_per_day: real("price_per_day"),
  price_per_week: real("price_per_week"),

  availability: boolean("availability").default(true),

  reviews: jsonb("reviews").default([])
});

export const carReviews = pgTable("car_reviews", {
  id: serial("id").primaryKey(),
  evaluatorName: text("evaluator_name").notNull(),
  evaluatorUrl: text("evaluator_url").default("https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png"),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoriteCars = pgTable("favorite_cars", {
  id: serial("id").primaryKey(),
  userProfileId: integer("user_profile_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  post_image_url: text("image_url"),
  post_title: text("post_title").notNull(),
  post_description: text("post_description").notNull(),
  post_comments: jsonb("post_comments"),
  post_categories: jsonb("post_categories"),
  related_posts: jsonb("relate_posts").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});