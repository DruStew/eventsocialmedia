import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardContent from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Get the user and their profile
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with organization
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      organizations (
        id,
        name,
        slug,
        logo_url,
        brand_colors
      )
    `)
    .eq("id", user.id)
    .single()

  return <DashboardContent user={user} profile={profile} />
}
