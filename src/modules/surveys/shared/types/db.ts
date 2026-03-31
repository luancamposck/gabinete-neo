import type { Tables, TablesInsert } from "@/shared/types/supabase"

export type SurveyRow = Tables<"surveys">
export type SurveyQuestionRow = Tables<"survey_questions">
export type SurveyQuestionOptionRow = Tables<"survey_question_options">
export type SurveyResponseRow = Tables<"survey_responses">
export type SurveyResponseItemRow = Tables<"survey_response_items">

export type SurveyResponseInsert = TablesInsert<"survey_responses">
export type SurveyResponseItemInsert = TablesInsert<"survey_response_items">
