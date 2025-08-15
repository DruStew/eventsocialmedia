import DashboardContent from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  // Mock user and profile data for testing core functionality
  const mockUser = {
    id: "mock-user-id",
    email: "test@example.com",
  }

  const mockProfile = {
    id: "mock-user-id",
    email: "test@example.com",
    full_name: "Test User",
    role: "admin",
    organization_id: "default-org-001",
    organizations: {
      id: "default-org-001",
      name: "Test Organization",
      slug: "test-org",
    },
  }

  return <DashboardContent user={mockUser} profile={mockProfile} />
}
