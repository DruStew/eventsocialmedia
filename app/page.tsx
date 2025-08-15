import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
          <p className="text-gray-600">Configure your Supabase integration to use Producer Promo Builder</p>
        </div>
      </div>
    )
  }

  // Check if user is logged in
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Producer Promo Builder</h1>
          <p className="text-lg text-gray-600 mb-8">
            Create stunning 1080x1080 social media graphics from branded templates
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/sign-up">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">Get Started</Button>
          </Link>

          <Link href="/auth/login">
            <Button variant="outline" className="w-full py-3 text-lg bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
