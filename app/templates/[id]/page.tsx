import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import TemplatePreview from "@/components/templates/template-preview"

interface TemplatePageProps {
  params: {
    id: string
  }
}

export default async function TemplatePage({ params }: TemplatePageProps) {
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
        slug
      )
    `)
    .eq("id", user.id)
    .single()

  if (!profile?.organizations) {
    redirect("/dashboard")
  }

  // Get template details
  const { data: template, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", profile.organizations.id)
    .eq("status", "active")
    .single()

  if (error || !template) {
    notFound()
  }

  return <TemplatePreview template={template} user={user} profile={profile} />
}
