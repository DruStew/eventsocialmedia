import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Get authenticated user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get project with template
    const { data: project, error: projectError } = await supabase
      .from("graphics")
      .select(`
        *,
        templates (
          id,
          name,
          svg_content,
          data_fields
        )
      `)
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user owns this project or is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const canRender = project.created_by === user.id || profile?.role === "admin"

    if (!canRender) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // For now, return a mock response
    // In a real implementation, you would:
    // 1. Load the SVG template from storage
    // 2. Apply the form data to the SVG elements
    // 3. Use resvg-wasm or similar to render to PNG
    // 4. Upload the PNG to storage
    // 5. Return the public URL

    const mockPngUrl = "/rendered-graphic.png"

    // Update project with rendered URL
    await supabase
      .from("graphics")
      .update({
        png_url: mockPngUrl,
        status: "completed",
      })
      .eq("id", projectId)

    return NextResponse.json({
      success: true,
      url: mockPngUrl,
      message: "Graphic rendered successfully",
    })
  } catch (error) {
    console.error("Render error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
