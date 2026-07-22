export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			graphql: {
				Args: {
					extensions?: Json
					operationName?: string
					query?: string
					variables?: Json
				}
				Returns: Json
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	public: {
		Tables: {
			driver_applications: {
				Row: {
					cnh_document_path: string
					created_at: string
					crlv_document_path: string
					id: string
					organization_id: string
					plate: string
					reviewed_at: string | null
					reviewed_by_user_id: string | null
					status: Database["public"]["Enums"]["driver_application_status"]
					updated_at: string
					user_id: string
					vehicle_color: string | null
					vehicle_model: string | null
					vehicle_type: Database["public"]["Enums"]["driver_vehicle_type"]
					vehicle_year: number | null
				}
				Insert: {
					cnh_document_path: string
					created_at?: string
					crlv_document_path: string
					id?: string
					organization_id: string
					plate: string
					reviewed_at?: string | null
					reviewed_by_user_id?: string | null
					status?: Database["public"]["Enums"]["driver_application_status"]
					updated_at?: string
					user_id: string
					vehicle_color?: string | null
					vehicle_model?: string | null
					vehicle_type: Database["public"]["Enums"]["driver_vehicle_type"]
					vehicle_year?: number | null
				}
				Update: {
					cnh_document_path?: string
					created_at?: string
					crlv_document_path?: string
					id?: string
					organization_id?: string
					plate?: string
					reviewed_at?: string | null
					reviewed_by_user_id?: string | null
					status?: Database["public"]["Enums"]["driver_application_status"]
					updated_at?: string
					user_id?: string
					vehicle_color?: string | null
					vehicle_model?: string | null
					vehicle_type?: Database["public"]["Enums"]["driver_vehicle_type"]
					vehicle_year?: number | null
				}
				Relationships: [
					{
						foreignKeyName: "driver_applications_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "driver_applications_reviewed_by_user_id_fkey"
						columns: ["reviewed_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "driver_applications_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			drivers: {
				Row: {
					created_at: string
					driver_application_id: string
					id: string
					is_active: boolean
					organization_id: string
					plate: string
					updated_at: string
					user_id: string
					vehicle_color: string | null
					vehicle_model: string | null
					vehicle_type: Database["public"]["Enums"]["driver_vehicle_type"]
					vehicle_year: number | null
				}
				Insert: {
					created_at?: string
					driver_application_id: string
					id?: string
					is_active?: boolean
					organization_id: string
					plate: string
					updated_at?: string
					user_id: string
					vehicle_color?: string | null
					vehicle_model?: string | null
					vehicle_type: Database["public"]["Enums"]["driver_vehicle_type"]
					vehicle_year?: number | null
				}
				Update: {
					created_at?: string
					driver_application_id?: string
					id?: string
					is_active?: boolean
					organization_id?: string
					plate?: string
					updated_at?: string
					user_id?: string
					vehicle_color?: string | null
					vehicle_model?: string | null
					vehicle_type?: Database["public"]["Enums"]["driver_vehicle_type"]
					vehicle_year?: number | null
				}
				Relationships: [
					{
						foreignKeyName: "drivers_driver_application_id_fkey"
						columns: ["driver_application_id"]
						isOneToOne: false
						referencedRelation: "driver_applications"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "drivers_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "drivers_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			memberships: {
				Row: {
					created_at: string
					invited_by_user_id: string | null
					is_active: boolean
					organization_id: string
					role_id: string
					updated_at: string
					user_id: string
				}
				Insert: {
					created_at?: string
					invited_by_user_id?: string | null
					is_active?: boolean
					organization_id: string
					role_id: string
					updated_at?: string
					user_id: string
				}
				Update: {
					created_at?: string
					invited_by_user_id?: string | null
					is_active?: boolean
					organization_id?: string
					role_id?: string
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "memberships_invited_by_user_id_fkey"
						columns: ["invited_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "memberships_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "memberships_role_id_fkey"
						columns: ["role_id"]
						isOneToOne: false
						referencedRelation: "roles"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "memberships_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			organizations: {
				Row: {
					app_domain: string
					created_at: string
					description: string | null
					id: string
					image_path: string | null
					is_active: boolean
					name: string
					slug: string
					updated_at: string
				}
				Insert: {
					app_domain: string
					created_at?: string
					description?: string | null
					id?: string
					image_path?: string | null
					is_active?: boolean
					name: string
					slug: string
					updated_at?: string
				}
				Update: {
					app_domain?: string
					created_at?: string
					description?: string | null
					id?: string
					image_path?: string | null
					is_active?: boolean
					name?: string
					slug?: string
					updated_at?: string
				}
				Relationships: []
			}
			permissions: {
				Row: {
					created_at: string
					description: string
					key: string
				}
				Insert: {
					created_at?: string
					description: string
					key: string
				}
				Update: {
					created_at?: string
					description?: string
					key?: string
				}
				Relationships: []
			}
			referrals: {
				Row: {
					created_at: string
					id: string
					invited_user_id: string
					inviter_user_id: string
					organization_id: string
					relationship_to_inviter: string | null
				}
				Insert: {
					created_at?: string
					id?: string
					invited_user_id: string
					inviter_user_id: string
					organization_id: string
					relationship_to_inviter?: string | null
				}
				Update: {
					created_at?: string
					id?: string
					invited_user_id?: string
					inviter_user_id?: string
					organization_id?: string
					relationship_to_inviter?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "referrals_invited_user_id_fkey"
						columns: ["invited_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "referrals_inviter_user_id_fkey"
						columns: ["inviter_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "referrals_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					}
				]
			}
			role_permissions: {
				Row: {
					created_at: string
					permission_key: string
					role_id: string
				}
				Insert: {
					created_at?: string
					permission_key: string
					role_id: string
				}
				Update: {
					created_at?: string
					permission_key?: string
					role_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "role_permissions_permission_key_fkey"
						columns: ["permission_key"]
						isOneToOne: false
						referencedRelation: "permissions"
						referencedColumns: ["key"]
					},
					{
						foreignKeyName: "role_permissions_role_id_fkey"
						columns: ["role_id"]
						isOneToOne: false
						referencedRelation: "roles"
						referencedColumns: ["id"]
					}
				]
			}
			roles: {
				Row: {
					created_at: string
					id: string
					is_active: boolean
					is_system: boolean
					name: string
					organization_id: string
					updated_at: string
				}
				Insert: {
					created_at?: string
					id?: string
					is_active?: boolean
					is_system?: boolean
					name: string
					organization_id: string
					updated_at?: string
				}
				Update: {
					created_at?: string
					id?: string
					is_active?: boolean
					is_system?: boolean
					name?: string
					organization_id?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "roles_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					}
				]
			}
			task_assignments: {
				Row: {
					created_at: string
					organization_id: string
					task_id: string
					updated_at: string
					user_id: string
				}
				Insert: {
					created_at?: string
					organization_id: string
					task_id: string
					updated_at?: string
					user_id: string
				}
				Update: {
					created_at?: string
					organization_id?: string
					task_id?: string
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "task_assignments_membership_fk"
						columns: ["organization_id", "user_id"]
						isOneToOne: false
						referencedRelation: "memberships"
						referencedColumns: ["organization_id", "user_id"]
					},
					{
						foreignKeyName: "task_assignments_task_fk"
						columns: ["task_id", "organization_id"]
						isOneToOne: false
						referencedRelation: "tasks"
						referencedColumns: ["id", "organization_id"]
					},
					{
						foreignKeyName: "task_assignments_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					}
				]
			}
			tasks: {
				Row: {
					created_at: string
					created_by_user_id: string
					description: string | null
					due_at: string | null
					id: string
					organization_id: string
					status: Database["public"]["Enums"]["task_status"]
					title: string
					updated_at: string
					updated_by_user_id: string | null
				}
				Insert: {
					created_at?: string
					created_by_user_id: string
					description?: string | null
					due_at?: string | null
					id?: string
					organization_id: string
					status?: Database["public"]["Enums"]["task_status"]
					title: string
					updated_at?: string
					updated_by_user_id?: string | null
				}
				Update: {
					created_at?: string
					created_by_user_id?: string
					description?: string | null
					due_at?: string | null
					id?: string
					organization_id?: string
					status?: Database["public"]["Enums"]["task_status"]
					title?: string
					updated_at?: string
					updated_by_user_id?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "tasks_created_by_user_id_fkey"
						columns: ["created_by_user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "tasks_organization_id_fkey"
						columns: ["organization_id"]
						isOneToOne: false
						referencedRelation: "organizations"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "tasks_updated_by_user_id_fkey"
						columns: ["updated_by_user_id"]
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
					username: string
				}
				Insert: {
					created_at?: string
					email: string
					id: string
					name: string
					updated_at?: string
					username: string
				}
				Update: {
					created_at?: string
					email?: string
					id?: string
					name?: string
					updated_at?: string
					username?: string
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			approve_driver_application: {
				Args: { p_application_id: string; p_reviewer_user_id: string }
				Returns: Record<string, unknown>
			}
			has_membership_permission: {
				Args: {
					p_organization_id: string
					p_permission_key: string
					p_user_id: string
				}
				Returns: boolean
			}
			list_membership_permissions: {
				Args: { p_organization_id: string; p_user_id: string }
				Returns: string[]
			}
		}
		Enums: {
			driver_application_status: "pending" | "approved" | "rejected"
			driver_vehicle_type: "car" | "motorcycle" | "van" | "truck"
			task_status: "NOT_STARTED" | "IN_PROGRESS" | "CANCELLED" | "COMPLETED"
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
	graphql_public: {
		Enums: {}
	},
	public: {
		Enums: {
			driver_application_status: ["pending", "approved", "rejected"],
			driver_vehicle_type: ["car", "motorcycle", "van", "truck"],
			task_status: ["NOT_STARTED", "IN_PROGRESS", "CANCELLED", "COMPLETED"]
		}
	}
} as const
