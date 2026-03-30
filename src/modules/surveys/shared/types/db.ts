import type { Tables, TablesInsert } from "@/shared/types/supabase"

export type SurveyRow = Tables<"surveys">
export type SurveyResponseRow = Tables<"survey_responses">
export type SurveyResponseInsert = TablesInsert<"survey_responses">
