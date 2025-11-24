"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { BarChart3, TrendingUp, Users, Eye, Lock } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { data: userSession } = trpc.auth.getSession.useQuery();
  const { data: overview, isLoading } = trpc.analytics.getOverview.useQuery(
    undefined,
    { enabled: userSession?.addons.includes("analytics") }
  );

  const hasAnalytics = userSession?.addons.includes("analytics");

  if (!hasAnalytics) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-yellow-600" />
            <CardTitle>Analytics Pro</CardTitle>
          </div>
          <CardDescription>
            Unlock detailed analytics and performance insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">What you&apos;ll get:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Detailed engagement metrics across all platforms</li>
              <li>• Reach and impression tracking</li>
              <li>• Best posting time recommendations</li>
              <li>• Audience growth analytics</li>
              <li>• Exportable reports</li>
            </ul>
          </div>
          <Link href="/pricing">
            <Button className="w-full">
              Upgrade to Analytics Pro - $25/month
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalEngagement?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Likes, comments, shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalReach?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Impressions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Platform</CardTitle>
          <CardDescription>
            Engagement metrics for each connected platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overview?.byPlatform && overview.byPlatform.length > 0 ? (
            <div className="space-y-4">
              {overview.byPlatform.map((platform: any) => (
                <div
                  key={platform.platform}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold capitalize">{platform.platform}</h3>
                    <p className="text-sm text-muted-foreground">
                      {platform.metrics.engagement} engagements
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {platform.metrics.impressions.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">impressions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No analytics data available yet. Start posting to see your performance!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

