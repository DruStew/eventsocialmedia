import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import ProjectEditor from "@/components/projects/project-editor"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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

  // Get project with template details
  const { data: project, error } = await supabase
    .from("graphics")
    .select(`
      *,
      templates (
        id,
        name,
        description,
        svg_content,
        data_fields,
        thumbnail_url
      )
    `)
    .eq("id", params.id)
    .eq("organization_id", profile.organizations.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Check if user owns this project or is admin
  const canEdit = project.created_by === user.id || profile.role === "admin"

  if (!canEdit) {
    redirect("/dashboard")
  }

  return <ProjectEditor project={project} user={user} profile={profile} />
}
