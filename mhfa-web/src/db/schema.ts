import { pgTable, text, timestamp, integer, boolean, jsonb, AnyPgColumn } from "drizzle-orm/pg-core";

// Better Auth standard tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: text("role").default("Konseli").notNull(), // Konseli | Konselor | Admin
  status: text("status").default("Aktif").notNull(), // Aktif | Nonaktif
  phone: text("phone"),
  dob: text("dob"),
  gender: text("gender"),
  nik: text("nik"),
  counselorCode: text("counselor_code").unique(),
  assignedCounselorId: text("assigned_counselor_id").references((): AnyPgColumn => user.id),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Business logic tables
export const inviteCodes = pgTable("invite_codes", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  role: text("role").default("Konselor").notNull(), // Konselor | Admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status").default("Belum Digunakan").notNull(), // Belum Digunakan | Digunakan | Kedaluwarsa
  usedByUserId: text("used_by_user_id").references(() => user.id),
});

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  institution: text("institution").notNull(),
  specialization: text("specialization").notNull(),
  phone: text("phone").notNull(),
  schedule: text("schedule").notNull(),
  scheduleDays: text("schedule_days").notNull(),
  status: text("status").default("Tersedia").notNull(),
  type: text("type").notNull(), // whatsapp | hotline
});

export const questionnaires = pgTable("questionnaires", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("Aktif").notNull(), // Aktif | Nonaktif
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  questionnaireId: text("questionnaire_id").notNull().references(() => questionnaires.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type").notNull(), // single | multiple
  order: integer("order").notNull(),
});

export const options = pgTable("options", {
  id: text("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  score: integer("score").notNull(),
});

export const resultMappings = pgTable("result_mappings", {
  id: text("id").primaryKey(),
  questionnaireId: text("questionnaire_id").notNull().references(() => questionnaires.id, { onDelete: "cascade" }),
  minScore: integer("min_score").notNull(),
  maxScore: integer("max_score").notNull(),
  label: text("label").notNull(), // Risiko Rendah | Risiko Sedang | Risiko Tinggi
  description: text("description").notNull(),
});

export const screeningSessions = pgTable("screening_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  questionnaireId: text("questionnaire_id").notNull().references(() => questionnaires.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  conditionLabel: text("condition_label").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").default("active").notNull(), // active | completed
});

export const screeningAnswers = pgTable("screening_answers", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => screeningSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedOptionIds: jsonb("selected_option_ids").notNull(), // string[]
});

export const guides = pgTable("guides", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url").notNull(),
  instructions: text("instructions").notNull(),
  status: text("status").default("Aktif").notNull(),
  conditionTags: jsonb("condition_tags").notNull(), // string[]
});

export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  counselorId: text("counselor_id").references(() => user.id),
  screeningSessionId: text("screening_session_id").references(() => screeningSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // curhat | first_aid
  status: text("status").default("waiting").notNull(), // waiting | active | completed
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => user.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const counselorNotes = pgTable("counselor_notes", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  counselorId: text("counselor_id").notNull().references(() => user.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("notice").notNull(), // chat | assignment | event | notice
  sender: text("sender").default("Sistem SUFA").notNull(),
  isUnread: boolean("is_unread").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionalContactLogs = pgTable("professional_contact_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  contactName: text("contact_name").notNull(),
  contactType: text("contact_type").notNull(), // whatsapp | hotline
  contactedAt: timestamp("contacted_at").defaultNow().notNull(),
});

import { relations } from "drizzle-orm";

export const questionnairesRelations = relations(questionnaires, ({ many }) => ({
  questions: many(questions)
}));

export const questionsRelations = relations(questions, ({ many, one }) => ({
  questionnaire: one(questionnaires, {
    fields: [questions.questionnaireId],
    references: [questionnaires.id]
  }),
  options: many(options)
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id]
  })
}));

