export const INIT_SQL = `
-- 1. Users Table
CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "role" text DEFAULT 'Konseli' NOT NULL,
    "status" text DEFAULT 'Aktif' NOT NULL,
    "phone" text,
    "dob" text,
    "gender" text,
    "nik" text,
    "counselor_code" text UNIQUE,
    "assigned_counselor_id" text REFERENCES "user"("id")
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expires_at" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id");

-- 3. Accounts Table
CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" timestamp,
    "refresh_token_expires_at" timestamp,
    "scope" text,
    "password" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Verifications Table
CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- 5. Invite Codes Table
CREATE TABLE IF NOT EXISTS "invite_codes" (
    "id" text PRIMARY KEY NOT NULL,
    "code" text NOT NULL UNIQUE,
    "role" text DEFAULT 'Konselor' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp NOT NULL,
    "status" text DEFAULT 'Belum Digunakan' NOT NULL,
    "used_by_user_id" text REFERENCES "user"("id")
);

-- 6. Contacts Table
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "institution" text NOT NULL,
    "specialization" text NOT NULL,
    "phone" text NOT NULL,
    "schedule" text NOT NULL,
    "schedule_days" text NOT NULL,
    "status" text DEFAULT 'Tersedia' NOT NULL,
    "type" text NOT NULL
);

-- 7. Questionnaires Table
CREATE TABLE IF NOT EXISTS "questionnaires" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "status" text DEFAULT 'Aktif' NOT NULL
);

-- 8. Questions Table
CREATE TABLE IF NOT EXISTS "questions" (
    "id" text PRIMARY KEY NOT NULL,
    "questionnaire_id" text NOT NULL REFERENCES "questionnaires"("id") ON DELETE CASCADE,
    "text" text NOT NULL,
    "type" text NOT NULL,
    "order" integer NOT NULL
);
CREATE INDEX IF NOT EXISTS "questions_questionnaire_order_idx" ON "questions" ("questionnaire_id", "order");

-- 9. Options Table
CREATE TABLE IF NOT EXISTS "options" (
    "id" text PRIMARY KEY NOT NULL,
    "question_id" text NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
    "text" text NOT NULL,
    "score" integer NOT NULL
);
CREATE INDEX IF NOT EXISTS "options_question_id_idx" ON "options" ("question_id");

-- 10. Result Mappings Table
CREATE TABLE IF NOT EXISTS "result_mappings" (
    "id" text PRIMARY KEY NOT NULL,
    "questionnaire_id" text NOT NULL REFERENCES "questionnaires"("id") ON DELETE CASCADE,
    "min_score" integer NOT NULL,
    "max_score" integer NOT NULL,
    "label" text NOT NULL,
    "description" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "result_mappings_questionnaire_score_idx" ON "result_mappings" ("questionnaire_id", "min_score", "max_score");

-- 11. Screening Sessions Table
CREATE TABLE IF NOT EXISTS "screening_sessions" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "questionnaire_id" text NOT NULL REFERENCES "questionnaires"("id") ON DELETE CASCADE,
    "score" integer NOT NULL,
    "condition_label" text NOT NULL,
    "started_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp,
    "status" text DEFAULT 'active' NOT NULL
);
CREATE INDEX IF NOT EXISTS "screening_sessions_user_completed_idx" ON "screening_sessions" ("user_id", "completed_at");

-- 12. Screening Answers Table
CREATE TABLE IF NOT EXISTS "screening_answers" (
    "id" text PRIMARY KEY NOT NULL,
    "session_id" text NOT NULL REFERENCES "screening_sessions"("id") ON DELETE CASCADE,
    "question_id" text NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
    "selected_option_ids" jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS "screening_answers_session_id_idx" ON "screening_answers" ("session_id");

-- 13. Guides Table
CREATE TABLE IF NOT EXISTS "guides" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "youtube_url" text NOT NULL,
    "instructions" text NOT NULL,
    "status" text DEFAULT 'Aktif' NOT NULL,
    "condition_tags" jsonb NOT NULL
);

-- 14. Chat Sessions Table
CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" text PRIMARY KEY NOT NULL,
    "patient_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "counselor_id" text REFERENCES "user"("id"),
    "screening_session_id" text REFERENCES "screening_sessions"("id") ON DELETE CASCADE,
    "type" text NOT NULL,
    "status" text DEFAULT 'waiting' NOT NULL,
    "started_at" timestamp DEFAULT now() NOT NULL,
    "ended_at" timestamp
);

-- 15. Chat Messages Table
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" text PRIMARY KEY NOT NULL,
    "session_id" text NOT NULL REFERENCES "chat_sessions"("id") ON DELETE CASCADE,
    "sender_id" text NOT NULL REFERENCES "user"("id"),
    "text" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 16. Counselor Notes Table
CREATE TABLE IF NOT EXISTS "counselor_notes" (
    "id" text PRIMARY KEY NOT NULL,
    "session_id" text NOT NULL REFERENCES "chat_sessions"("id") ON DELETE CASCADE,
    "counselor_id" text NOT NULL REFERENCES "user"("id"),
    "note" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 17. Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "type" text DEFAULT 'notice' NOT NULL,
    "sender" text DEFAULT 'Sistem SUFA' NOT NULL,
    "is_unread" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 18. Professional Contact Logs Table
CREATE TABLE IF NOT EXISTS "professional_contact_logs" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "contact_id" text REFERENCES "contacts"("id") ON DELETE SET NULL,
    "contact_name" text NOT NULL,
    "contact_type" text NOT NULL,
    "contacted_at" timestamp DEFAULT now() NOT NULL
);

-- Seed Questionnaires
INSERT INTO "questionnaires" ("id", "title", "description", "status")
VALUES 
  ('phq-9', 'PHQ-9 (Patient Health Questionnaire-9)', 'Kuesioner skrining depresi. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?', 'Aktif'),
  ('gad-7', 'GAD-7 (Generalized Anxiety Disorder-7)', 'Kuesioner skrining kecemasan. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?', 'Aktif'),
  ('mmys-combined', 'Deteksi Kesehatan Mental Remaja', 'Mini MindHEAR Youth Scale V.1 (MMYS V.1) untuk remaja usia 10-18 tahun. Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir.', 'Aktif')
ON CONFLICT ("id") DO NOTHING;

-- Seed Default Invite Codes
INSERT INTO "invite_codes" ("id", "code", "role", "expires_at", "status") VALUES
('inv-admin-initial', 'ADMIN2026', 'Admin', '2099-12-31 23:59:59', 'Belum Digunakan'),
('inv-konselor-initial', 'KONSELOR2026', 'Konselor', '2099-12-31 23:59:59', 'Belum Digunakan'),
('inv-sufa-initial', 'SUFA2026', 'Konselor', '2099-12-31 23:59:59', 'Belum Digunakan')
ON CONFLICT ("code") DO NOTHING;

-- Seed Default Emergency Contacts
INSERT INTO "contacts" ("id", "name", "institution", "specialization", "phone", "schedule", "schedule_days", "status", "type") VALUES
('cnt-sejiwa', 'Layanan Sejiwa Kemenkes', 'Kementerian Kesehatan RI', 'Pertolongan Pertama Psikologis & Konseling Krisis', '119', '24 Jam', 'Setiap Hari', 'Tersedia', 'hotline'),
('cnt-lisa', 'LISA Helpline', 'Love Inside Suicide Awareness', 'Pencegahan Bunuh Diri & Krisis Emosional', '+628113855472', '24 Jam', 'Setiap Hari', 'Tersedia', 'whatsapp'),
('cnt-pulih', 'Yayasan Pulih', 'Yayasan Pulih Indonesia', 'Konseling Psikologis & Trauma', '+628118436633', '09:00 - 17:00', 'Senin - Jumat', 'Tersedia', 'whatsapp')
ON CONFLICT ("id") DO NOTHING;
`;
