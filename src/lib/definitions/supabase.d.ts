export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "13.0.5"
	}
	public: {
		Tables: {
			mailing_list: {
				Row: {
					city: string
					complement: string | null
					created_at: string | null
					id: string
					name: string
					neighborhood: string
					number: string
					phone_number: number
					postal_code: string
					state: string
					street: string
				}
				Insert: {
					city: string
					complement?: string | null
					created_at?: string | null
					id?: string
					name: string
					neighborhood: string
					number: string
					phone_number: number
					postal_code: string
					state: string
					street: string
				}
				Update: {
					city?: string
					complement?: string | null
					created_at?: string | null
					id?: string
					name?: string
					neighborhood?: string
					number?: string
					phone_number?: number
					postal_code?: string
					state?: string
					street?: string
				}
				Relationships: []
			}
			organization_invites: {
				Row: {
					created_at: string
					created_by_user_id: string
					expires_at: string | null
					handled_at: string | null
					handled_by_user_id: string | null
					id: string
					organization_id: string
					origin: string
					requested_by_user_id: string
					role: string
					status: string
					updated_at: string
				}
				Insert: {
					created_at?: string
					created_by_user_id: string
					expires_at?: string | null
					handled_at?: string | null
					handled_by_user_id?: string | null
					id?: string
					organization_id: string
					origin?: string
					requested_by_user_id: string
					role: string
					status: string
					updated_at?: string
				}
				Update: {
					created_at?: string
					created_by_user_id?: string
					expires_at?: string | null
					handled_at?: string | null
					handled_by_user_id?: string | null
					id?: string
					organization_id?: string
					origin?: string
					requested_by_user_id?: string
					role?: string
					status?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "organization_invites_created_by_user_id_fkey"
						columns: ["created_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "organization_invites_handled_by_user_id_fkey"
						columns: ["handled_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "organization_invites_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "organization_invites_requested_by_user_id_fkey"
						columns: ["requested_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			organization_memberships: {
				Row: {
					created_at: string
					invited_by_user_id: string | null
					is_active: boolean
					organization_id: string
					role: string
					updated_at: string
					user_id: string
				}
				Insert: {
					created_at?: string
					invited_by_user_id?: string | null
					is_active?: boolean
					organization_id: string
					role: string
					updated_at?: string
					user_id: string
				}
				Update: {
					created_at?: string
					invited_by_user_id?: string | null
					is_active?: boolean
					organization_id?: string
					role?: string
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "organization_memberships_invited_by_user_id_fkey"
						columns: ["invited_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "organization_memberships_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "organization_memberships_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			organizations: {
				Row: {
					created_at: string
					created_by_user_id: string | null
					id: string
					is_active: boolean
					name: string
					slug: string
					updated_at: string
				}
				Insert: {
					created_at?: string
					created_by_user_id?: string | null
					id?: string
					is_active?: boolean
					name: string
					slug: string
					updated_at?: string
				}
				Update: {
					created_at?: string
					created_by_user_id?: string | null
					id?: string
					is_active?: boolean
					name?: string
					slug?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "organizations_created_by_user_id_fkey"
						columns: ["created_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			user_profiles: {
				Row: {
					cep: string
					city: string
					complement: string | null
					cpf: string
					created_at: string
					neighborhood: string
					number: string
					phone: string
					state: string
					street: string
					updated_at: string
					user_id: string
				}
				Insert: {
					cep: string
					city: string
					complement?: string | null
					cpf: string
					created_at?: string
					neighborhood: string
					number: string
					phone: string
					state: string
					street: string
					updated_at?: string
					user_id: string
				}
				Update: {
					cep?: string
					city?: string
					complement?: string | null
					cpf?: string
					created_at?: string
					neighborhood?: string
					number?: string
					phone?: string
					state?: string
					street?: string
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "user_profiles_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: true
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			users: {
				Row: {
					created_at: string
					email: string
					id: string
					name: string
					updated_at: string
				}
				Insert: {
					created_at?: string
					email: string
					id: string
					name: string
					updated_at?: string
				}
				Update: {
					created_at?: string
					email?: string
					id?: string
					name?: string
					updated_at?: string
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
	DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	public: {
		Enums: {}
	}
} as const
