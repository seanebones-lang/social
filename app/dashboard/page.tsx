"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  Loader2,
  Upload,
  X,
  Lock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { put } from "@vercel/blob";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, limit: 2200, premium: false },
  { id: "tiktok", name: "TikTok", icon: Twitter, limit: 2200, premium: false },
  { id: "x", name: "X", icon: Twitter, limit: 280, premium: false },
  { id: "facebook", name: "Facebook", icon: Facebook, limit: 63206, premium: false },
  { id: "youtube", name: "YouTube", icon: Youtube, limit: 5000, premium: false },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, limit: 3000, premium: true },
  { id: "threads", name: "Threads", icon: Instagram, limit: 500, premium: false },
  { id: "pinterest", name: "Pinterest", icon: Twitter, limit: 500, premium: false },
  { id: "reddit", name: "Reddit", icon: Twitter, limit: 40000, premium: true },
  { id: "bluesky", name: "Bluesky", icon: Twitter, limit: 300, premium: false },
];

export default function DashboardPage() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [useQueue, setUseQueue] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const { data: usageStats } = trpc.posts.getUsageStats.useQuery();
  const { data: userSession } = trpc.auth.getSession.useQuery();
  const { data: connectedAccounts } = trpc.profiles.getConnectedAccounts.useQuery();
  const createPostMutation = trpc.posts.create.useMutation();

  const togglePlatform = (platformId: string) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    
    if (platform?.premium) {
      const isPremium = platform.id === "reddit"
        ? userSession?.addons.includes("reddit")
        : userSession?.addons.includes("linkedin");

      if (!isPremium) {
        setUpgradeMessage(
          `Unlock ${platform.name} posting with the ${
            platform.id === "reddit" ? "Reddit Virality Pack" : "LinkedIn Pro Suite"
          } add-on for $19/month`
        );
        setShowUpgradeModal(true);
        return;
      }
    }

    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const blob = await put(file.name, file, {
          access: "public",
          token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
        });
        return blob.url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedFiles((prev) => [...prev, ...urls]);
      toast.success(`Uploaded ${files.length} file(s)`);
    } catch (error) {
      toast.error("Failed to upload files");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((u) => u !== url));
  };

  const handlePost = async (postNow: boolean) => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    // Check usage limits
    if (usageStats) {
      const newTotal = usageStats.postsUsed + selectedPlatforms.length;
      if (newTotal > usageStats.postsLimit) {
        setUpgradeMessage(
          `You've used ${usageStats.postsUsed}/${usageStats.postsLimit} posts this month. Upgrade to continue posting.`
        );
        setShowUpgradeModal(true);
        return;
      }
    }

    try {
      await createPostMutation.mutateAsync({
        content,
        platforms: selectedPlatforms,
        scheduledAt: postNow ? undefined : scheduledDate || undefined,
        useQueue: useQueue && !postNow,
        mediaUrls: uploadedFiles,
      });

      toast.success(
        postNow
          ? "Post published successfully!"
          : "Post scheduled successfully!"
      );

      // Reset form
      setContent("");
      setSelectedPlatforms([]);
      setUploadedFiles([]);
      setScheduledDate("");
      setUseQueue(false);
    } catch (error: any) {
      if (error.message.includes("locked") || error.message.includes("limit")) {
        setUpgradeMessage(error.message);
        setShowUpgradeModal(true);
      } else {
        toast.error(error.message || "Failed to create post");
      }
    }
  };

  const getCharacterCount = () => {
    if (selectedPlatforms.length === 0) return null;

    const limits = selectedPlatforms.map((id) => {
      const platform = PLATFORMS.find((p) => p.id === id);
      return { name: platform?.name, limit: platform?.limit || 0 };
    });

    return (
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {limits.map((l) => (
          <span key={l.name} className={content.length > l.limit ? "text-red-600" : ""}>
            {l.name}: {content.length}/{l.limit}
          </span>
        ))}
      </div>
    );
  };

  const isConnected = (platformId: string) => {
    return connectedAccounts?.some((acc) => acc.platform === platformId && acc.isConnected);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
          <CardDescription>
            Compose and schedule your social media posts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
            {getCharacterCount()}
          </div>

          <div className="space-y-2">
            <Label>Media</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "Uploading..." : "Click to upload images or videos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Up to 5GB per file
                </p>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {uploadedFiles.map((url, index) => (
                  <div key={index} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      onClick={() => removeFile(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const connected = isConnected(platform.id);
                const selected = selectedPlatforms.includes(platform.id);

                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    disabled={!connected}
                    className={`flex flex-col items-center gap-2 p-3 border rounded-lg transition-all ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!connected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="relative">
                      <Icon className="h-6 w-6" />
                      {platform.premium && (
                        <Lock className="h-3 w-3 absolute -top-1 -right-1 text-yellow-600" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{platform.name}</span>
                    {!connected && (
                      <span className="text-xs text-red-600">Not connected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="use-queue"
                  checked={useQueue}
                  onCheckedChange={setUseQueue}
                />
                <Label htmlFor="use-queue" className="cursor-pointer">
                  Add to Queue (Auto-schedule)
                </Label>
              </div>
            </div>

            {!useQueue && (
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Schedule for later (optional)</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handlePost(true)}
              disabled={createPostMutation.isPending}
              className="flex-1"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Now"
              )}
            </Button>
            <Button
              onClick={() => handlePost(false)}
              disabled={createPostMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {useQueue ? "Add to Queue" : "Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>{upgradeMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={() => setShowUpgradeModal(false)} variant="outline">
              Cancel
            </Button>
            <Link href="/pricing" className="flex-1">
              <Button className="w-full">View Plans</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

