"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Calendar,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: usageStats } = trpc.posts.getUsageStats.useQuery();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600">Pulse Social</h1>
          </Link>
          <div className="flex items-center gap-4">
            {usageStats && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Posts:</span>
                <span className="font-medium">
                  {usageStats.postsUsed} / {usageStats.postsLimit}
                </span>
                <Progress
                  value={usageStats.percentageUsed}
                  className="w-24"
                />
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-lg border p-4 space-y-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Composer
                </Button>
              </Link>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

