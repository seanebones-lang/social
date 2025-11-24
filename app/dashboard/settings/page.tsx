"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { CreditCard, User, Shield } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: userSession } = trpc.auth.getSession.useQuery();
  const { data: subscription } = trpc.stripe.getSubscription.useQuery();
  const createPortalMutation = trpc.stripe.createPortalSession.useMutation();

  const handleManageSubscription = async () => {
    try {
      const result = await createPortalMutation.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to open billing portal");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Account Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{userSession?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{userSession?.name || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>
            Manage your plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="font-medium capitalize">{subscription?.plan || "Free"}</p>
          </div>

          {subscription?.addons && subscription.addons.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Active Add-ons</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {subscription.addons.map((addon: string) => (
                  <span
                    key={addon}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize"
                  >
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {subscription?.stripeCurrentPeriodEnd && (
            <div>
              <p className="text-sm text-muted-foreground">Next billing date</p>
              <p className="font-medium">
                {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {subscription?.stripeSubscriptionId ? (
              <Button
                onClick={handleManageSubscription}
                disabled={createPortalMutation.isPending}
              >
                Manage Subscription
              </Button>
            ) : (
              <Link href="/pricing">
                <Button>Upgrade Plan</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}

