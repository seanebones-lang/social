"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { id: "tiktok", name: "TikTok", icon: Twitter, color: "text-black" },
  { id: "x", name: "X (Twitter)", icon: Twitter, color: "text-blue-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { id: "threads", name: "Threads", icon: Instagram, color: "text-black" },
  { id: "pinterest", name: "Pinterest", icon: Twitter, color: "text-red-500" },
  { id: "reddit", name: "Reddit", icon: Twitter, color: "text-orange-600" },
  { id: "bluesky", name: "Bluesky", icon: Twitter, color: "text-blue-400" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<"create" | "connect" | "complete">("create");
  const [profileId, setProfileId] = useState<string>("");
  const [invites, setInvites] = useState<any[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const createProfileMutation = trpc.profiles.create.useMutation();
  const createInvitesMutation = trpc.profiles.createPlatformInvites.useMutation();
  const { data: userSession } = trpc.auth.getSession.useQuery();
  const { data: connectionStatus, refetch: refetchStatus } =
    trpc.profiles.checkConnectionStatus.useQuery(
      { profileId: profileId || undefined },
      { enabled: !!profileId && isPolling, refetchInterval: 3000 }
    );

  // Auto-load existing profile if user already has one
  useEffect(() => {
    if (userSession?.lateProfileId && !profileId) {
      setProfileId(userSession.lateProfileId);
      setStep("connect");
    }
  }, [userSession, profileId]);

  useEffect(() => {
    if (connectionStatus) {
      const connected = connectionStatus
        .filter((p) => p.connected)
        .map((p) => p.platform);
      setConnectedPlatforms(connected);
    }
  }, [connectionStatus]);

  const handleCreateProfile = async () => {
    try {
      const uniqueName = `${session?.user?.name || "User"}'s Profile ${Date.now()}`;
      const profile = await createProfileMutation.mutateAsync({
        name: uniqueName,
      });

      setProfileId(profile.id);

      const platformInvites = await createInvitesMutation.mutateAsync({
        profileId: profile.id,
      });

      setInvites(platformInvites);
      setStep("connect");
      setIsPolling(true);

      toast.success("Profile created! Now connect your platforms.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    }
  };

  const handleOpenInvite = (inviteUrl: string) => {
    window.open(inviteUrl, "_blank");
  };

  const handleComplete = () => {
    toast.success("Onboarding complete!");
    router.push("/dashboard" as any);
  };

  const handleSkip = () => {
    toast.info("You can connect platforms later from Settings");
    router.push("/dashboard" as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Pulse Social</h1>
          <p className="text-muted-foreground">
            Let&apos;s connect your social media accounts
          </p>
        </div>

        <Progress
          value={
            step === "create" ? 33 : step === "connect" ? 66 : 100
          }
          className="mb-8"
        />

        {step === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>
                We&apos;ll create a profile to manage your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your profile will be named: <strong>{session?.user?.name}&apos;s Profile</strong>
              </p>
              <Button
                onClick={handleCreateProfile}
                disabled={createProfileMutation.isPending}
                className="w-full"
              >
                {createProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "connect" && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Platforms</CardTitle>
              <CardDescription>
                Click on each platform to authorize Pulse Social to post on your behalf.
                Each will open in a new tab where you&apos;ll log in and grant permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>How to connect:</strong> Click a platform below → Log in to that platform → 
                  Authorize Pulse Social → Return here (the status will update automatically)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {PLATFORMS.map((platform) => {
                  const invite = invites.find((i) => i.platform === platform.id);
                  const isConnected = connectedPlatforms.includes(platform.id);
                  const Icon = platform.icon;

                  return (
                    <button
                      key={platform.id}
                      onClick={() => invite && handleOpenInvite(invite.inviteUrl)}
                      disabled={!invite || isConnected}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors ${
                        isConnected ? "bg-green-50 border-green-200" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${platform.color}`} />
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      {isConnected ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Connected: {connectedPlatforms.length} / {PLATFORMS.length}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSkip}>
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={connectedPlatforms.length === 0}
                  >
                    Continue to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

