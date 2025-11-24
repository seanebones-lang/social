"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  const { data: posts, isLoading } = trpc.posts.getHistory.useQuery({
    limit: 50,
    offset: 0,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Scheduled Posts</CardTitle>
        </div>
        <CardDescription>
          View and manage your upcoming scheduled posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : post.status === "scheduled"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                {post.scheduledAt && (
                  <p className="text-xs text-muted-foreground">
                    Scheduled for: {new Date(post.scheduledAt).toLocaleString()}
                  </p>
                )}
                {post.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    Published: {new Date(post.publishedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No posts yet. Create your first post from the composer!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

