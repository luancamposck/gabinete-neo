import { AuthTabs } from "@/components/auth-tabs"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <AuthTabs />
    </div>
  )
}
