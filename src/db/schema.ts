import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { SkillCategory } from "@/lib/constants";

/** Perfil (singleton): sempre a linha com id = 1. */
export const profile = pgTable("profile", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  headline: varchar("headline", { length: 200 }).notNull(),
  bio: text("bio").notNull(),
  location: varchar("location", { length: 120 }),
  email: varchar("email", { length: 200 }),
  resumeUrl: text("resume_url"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  /** URL da foto usada como origem (null quando a foto veio de upload). */
  photoUrl: text("photo_url"),
  /** Retrato já convertido para ASCII (é o que o terminal exibe). */
  photoAscii: text("photo_ascii"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 20 }).$type<SkillCategory>().notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  /** Nível de proficiência de 0 a 100. */
  level: integer("level").notNull().default(70),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  technologies: text("technologies").array().notNull().default(sql`'{}'::text[]`),
  order: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("sort_order").notNull().default(0),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profile.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Message = typeof messages.$inferSelect;
