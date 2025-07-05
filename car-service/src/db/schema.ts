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
  car_model: text("car_model").notNull(),
  description: text("description"),

  image_url: text("image_url"),
  thumbnail_urls: text("thumbnail_urls").array(),

  year: integer("year"),
  color: text("color"),
  passengers: integer("passengers"),
  fuel: text("fuel"),
  transmission: text("transmission"),
  drive_type: text("drive_type"),

  // Preços por período
  price_per_hour: real("price_per_hour"),
  price_per_day: real("price_per_day"),
  price_per_week: real("price_per_week"),

  // Especificações técnicas
  acceleration: text("acceleration"), // ex: "6 segundos (0-100 km/h)"
  wheels: text("wheels"), // ex: "17\" de liga leve"
  suspension: text("suspension"), // ex: "Independente"
  brakes: text("brakes"), // ex: "Disco ventilado nas 4 rodas"
  oil_consumption: text("oil_consumption"), // ex: "0.2L a cada 1000 km"
  air_conditioning: text("air_conditioning"), // ex: "Ar condicionado automático"
  power_steering: boolean("power_steering"), // ex: true
  sound_system: text("sound_system"), // ex: "Bluetooth / Rádio FM"
  rear_camera: text("rear_camera"), // ex: "Sim, com sensores de estacionamento"

  // Observações adicionais
  insurance_included: boolean("insurance_included").default(true),
  fuel_policy: text("fuel_policy"), // ex: "Pago pelo cliente no momento da entrega"

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