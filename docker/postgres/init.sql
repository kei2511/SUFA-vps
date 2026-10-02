-- ========================================================
-- SUFA (MHFA) Database Initialization Script for PostgreSQL
-- Automatically executed on container first boot
-- ========================================================

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

-- 3. Accounts Table (Better Auth)
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

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

-- A. Default Questionnaires: PHQ-9
INSERT INTO "questionnaires" ("id", "title", "description", "status")
VALUES ('phq-9', 'PHQ-9 (Patient Health Questionnaire-9)', 'Kuesioner skrining depresi. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?', 'Aktif')
ON CONFLICT ("id") DO NOTHING;

-- PHQ-9 Questions & Options
DO $$
DECLARE
    q_rec RECORD;
    phq_questions TEXT[] := ARRAY[
        'Kurang berminat atau tidak menikmati aktivitas yang biasanya menyenangkan.',
        'Merasa sedih, murung, atau putus asa.',
        'Sulit tidur, sering terbangun, atau tidur terlalu banyak.',
        'Merasa lelah atau tidak bertenaga.',
        'Nafsu makan berkurang atau berlebihan.',
        'Merasa diri tidak berharga atau merasa gagal.',
        'Sulit berkonsentrasi saat bekerja, belajar, atau membaca.',
        'Bergerak atau berbicara lebih lambat dari biasanya, atau sebaliknya merasa sangat gelisah sehingga sulit diam.',
        'Memiliki pikiran bahwa Anda lebih baik meninggal atau ingin menyakiti diri sendiri.'
    ];
    i INT;
    qid TEXT;
BEGIN
    FOR i IN 1..array_length(phq_questions, 1) LOOP
        qid := 'phq9-q' || i;
        INSERT INTO "questions" ("id", "questionnaire_id", "text", "type", "order")
        VALUES (qid, 'phq-9', phq_questions[i], 'single', i)
        ON CONFLICT ("id") DO NOTHING;

        INSERT INTO "options" ("id", "question_id", "text", "score") VALUES
        (qid || '-opt0', qid, 'Tidak Pernah', 0),
        (qid || '-opt1', qid, 'Beberapa Hari', 1),
        (qid || '-opt2', qid, '>7 Hari', 2),
        (qid || '-opt3', qid, 'Hampir Setiap Hari', 3)
        ON CONFLICT ("id") DO NOTHING;
    END LOOP;
END $$;

-- PHQ-9 Result Mappings
INSERT INTO "result_mappings" ("id", "questionnaire_id", "min_score", "max_score", "label", "description") VALUES
('phq9-map-0-4', 'phq-9', 0, 4, 'Minimal', 'Tidak ada gejala depresi yang signifikan.'),
('phq9-map-5-9', 'phq-9', 5, 9, 'Ringan', 'Gejala depresi ringan. Disarankan untuk memantau kondisi dan mencari dukungan jika perlu.'),
('phq9-map-10-14', 'phq-9', 10, 14, 'Sedang', 'Gejala depresi sedang. Disarankan untuk berkonsultasi dengan profesional.'),
('phq9-map-15-19', 'phq-9', 15, 19, 'Sedang Berat', 'Gejala depresi sedang-berat. Sangat disarankan untuk segera berkonsultasi dengan psikolog atau psikiater.'),
('phq9-map-20-27', 'phq-9', 20, 27, 'Berat', 'Gejala depresi berat. Segera cari bantuan profesional.')
ON CONFLICT ("id") DO NOTHING;


-- B. Default Questionnaires: GAD-7
INSERT INTO "questionnaires" ("id", "title", "description", "status")
VALUES ('gad-7', 'GAD-7 (Generalized Anxiety Disorder-7)', 'Kuesioner skrining kecemasan. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?', 'Aktif')
ON CONFLICT ("id") DO NOTHING;

-- GAD-7 Questions & Options
DO $$
DECLARE
    gad_questions TEXT[] := ARRAY[
        'Merasa gugup, cemas, atau tegang.',
        'Tidak mampu menghentikan atau mengendalikan rasa khawatir.',
        'Terlalu banyak mengkhawatirkan berbagai hal.',
        'Sulit merasa rileks.',
        'Sangat gelisah sehingga sulit duduk diam.',
        'Mudah marah atau mudah tersinggung.',
        'Merasa takut seolah-olah sesuatu yang buruk akan terjadi.'
    ];
    i INT;
    qid TEXT;
BEGIN
    FOR i IN 1..array_length(gad_questions, 1) LOOP
        qid := 'gad7-q' || i;
        INSERT INTO "questions" ("id", "questionnaire_id", "text", "type", "order")
        VALUES (qid, 'gad-7', gad_questions[i], 'single', i)
        ON CONFLICT ("id") DO NOTHING;

        INSERT INTO "options" ("id", "question_id", "text", "score") VALUES
        (qid || '-opt0', qid, 'Tidak Pernah', 0),
        (qid || '-opt1', qid, 'Beberapa Hari', 1),
        (qid || '-opt2', qid, '>7 Hari', 2),
        (qid || '-opt3', qid, 'Hampir Setiap Hari', 3)
        ON CONFLICT ("id") DO NOTHING;
    END LOOP;
END $$;

-- GAD-7 Result Mappings
INSERT INTO "result_mappings" ("id", "questionnaire_id", "min_score", "max_score", "label", "description") VALUES
('gad7-map-0-4', 'gad-7', 0, 4, 'Minimal', 'Tidak ada gejala kecemasan yang signifikan.'),
('gad7-map-5-9', 'gad-7', 5, 9, 'Ringan', 'Gejala kecemasan ringan. Disarankan untuk memantau kondisi.'),
('gad7-map-10-14', 'gad-7', 10, 14, 'Sedang', 'Gejala kecemasan sedang. Disarankan untuk berkonsultasi dengan profesional.'),
('gad7-map-15-21', 'gad-7', 15, 21, 'Berat', 'Gejala kecemasan berat. Segera cari bantuan profesional.')
ON CONFLICT ("id") DO NOTHING;


-- C. Default Questionnaires: MMYS Combined (Mini MindHEAR Youth Scale)
INSERT INTO "questionnaires" ("id", "title", "description", "status")
VALUES ('mmys-combined', 'Deteksi Kesehatan Mental Remaja', 'Mini MindHEAR Youth Scale V.1 (MMYS V.1) untuk remaja usia 10-18 tahun. Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir.', 'Aktif')
ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "description" = EXCLUDED."description", "status" = 'Aktif';

DO $$
DECLARE
    mmys_questions TEXT[] := ARRAY[
        'Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi',
        'Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi',
        'Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi',
        'Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas',
        'Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka',
        'Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan'
    ];
    i INT;
    qid TEXT;
BEGIN
    FOR i IN 1..array_length(mmys_questions, 1) LOOP
        qid := 'mmys-combined-q' || i;
        INSERT INTO "questions" ("id", "questionnaire_id", "text", "type", "order")
        VALUES (qid, 'mmys-combined', mmys_questions[i], 'single', i)
        ON CONFLICT ("id") DO NOTHING;

        INSERT INTO "options" ("id", "question_id", "text", "score") VALUES
        (qid || '-opt1', qid, 'Ya', 1),
        (qid || '-opt0', qid, 'Tidak', 0)
        ON CONFLICT ("id") DO NOTHING;
    END LOOP;
END $$;


-- D. Default Invite Codes for initial setup
-- You can register at /register using these codes:
INSERT INTO "invite_codes" ("id", "code", "role", "expires_at", "status") VALUES
('inv-admin-initial', 'ADMIN2026', 'Admin', '2099-12-31 23:59:59', 'Belum Digunakan'),
('inv-konselor-initial', 'KONSELOR2026', 'Konselor', '2099-12-31 23:59:59', 'Belum Digunakan'),
('inv-sufa-initial', 'SUFA2026', 'Konselor', '2099-12-31 23:59:59', 'Belum Digunakan')
ON CONFLICT ("code") DO NOTHING;


-- E. Default Mental Health Support Contacts
INSERT INTO "contacts" ("id", "name", "institution", "specialization", "phone", "schedule", "schedule_days", "status", "type") VALUES
('cnt-sejiwa', 'Layanan Sejiwa Kemenkes', 'Kementerian Kesehatan RI', 'Pertolongan Pertama Psikologis & Konseling Krisis', '119', '24 Jam', 'Setiap Hari', 'Tersedia', 'hotline'),
('cnt-lisa', 'LISA Helpline', 'Love Inside Suicide Awareness', 'Pencegahan Bunuh Diri & Krisis Emosional', '+628113855472', '24 Jam', 'Setiap Hari', 'Tersedia', 'whatsapp'),
('cnt-pulih', 'Yayasan Pulih', 'Yayasan Pulih Indonesia', 'Konseling Psikologis & Trauma', '+628118436633', '09:00 - 17:00', 'Senin - Jumat', 'Tersedia', 'whatsapp')
ON CONFLICT ("id") DO NOTHING;
