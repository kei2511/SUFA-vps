CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_questionnaire_order_idx" ON "questions" USING btree ("questionnaire_id", "order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "options_question_id_idx" ON "options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "result_mappings_questionnaire_score_idx" ON "result_mappings" USING btree ("questionnaire_id", "min_score", "max_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "screening_sessions_user_completed_idx" ON "screening_sessions" USING btree ("user_id", "completed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "screening_answers_session_id_idx" ON "screening_answers" USING btree ("session_id");
