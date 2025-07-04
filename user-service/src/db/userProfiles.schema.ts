import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
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