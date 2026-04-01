import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type SurveyRow = Tables<"surveys">
export type SurveyInsert = TablesInsert<"surveys">
export type SurveyUpdate = TablesUpdate<"surveys">

export type SurveyQuestionRow = Tables<"survey_questions">
export type SurveyQuestionInsert = TablesInsert<"survey_questions">
export type SurveyQuestionUpdate = TablesUpdate<"survey_questions">

export type SurveyQuestionOptionRow = Tables<"survey_question_options">
export type SurveyQuestionOptionInsert = TablesInsert<"survey_question_options">
export type SurveyQuestionOptionUpdate = TablesUpdate<"survey_question_options">

export type SurveyResponseRow = Tables<"survey_responses">
export type SurveyResponseUpdate = TablesUpdate<"survey_responses">
export type SurveyResponseItemRow = Tables<"survey_response_items">
export type SurveyResponseItemUpdate = TablesUpdate<"survey_response_items">
export type SurveyResponseSafeRow = Tables<"survey_responses_safe">
export type SurveyResponseItemSafeRow = Tables<"survey_response_items_safe">

export type SurveyResponseInsert = TablesInsert<"survey_responses">
export type SurveyResponseItemInsert = TablesInsert<"survey_response_items">

export type SurveyStatus = Enums<"survey_status">
export type SurveyVisibility = Enums<"survey_visibility">
export type SurveyQuestionType = Enums<"survey_question_type">
