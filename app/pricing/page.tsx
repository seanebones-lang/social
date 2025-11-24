"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "essentials",
    name: "Essentials",
    price: 15,
    description: "Perfect for individuals and small creators",
    features: [
      "2 social profiles",
      "5 platforms",
      "100 posts per month",
      "Queue scheduling",
      "Basic support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    description: "For growing businesses and agencies",
    features: [
      "10 social profiles",
      "All 10 platforms",
      "500 posts per month",
      "Queue scheduling",
      "Priority support",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    description: "For large teams and enterprises",
    features: [
      "50 social profiles",
      "All 10 platforms",
      "Unlimited posts",
      "Queue scheduling",
      "24/7 premium support",
      "Team collaboration",
      "Custom integrations",
    ],
  },
];

const ADDONS = [
  {
    id: "reddit",
    name: "Reddit Virality Pack",
    price: 19,
    description: "Unlock Reddit posting with subreddit targeting",
  },
  {
    id: "linkedin",
    name: "LinkedIn Pro Suite",
    price: 19,
    description: "Advanced LinkedIn features and first comments",
  },
  {
    id: "analytics",
    name: "Analytics Pro",
    price: 25,
    description: "Detailed analytics and performance insights",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = ADDONS.find((a) => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return (plan?.price || 0) + addonTotal;
  };

  const handleStartTrial = async (planId: string) => {
    if (!session) {
      router.push("/signin?from=/pricing");
      return;
    }

    try {
      const result = await createCheckoutMutation.mutateAsync({
        plan: planId as "essentials" | "pro" | "business",
        addons: selectedAddons as any,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600">Pulse Social</h1>
          </Link>
          <div className="flex gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Start with a 7-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-blue-600 border-2 shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleStartTrial(plan.id)}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Premium Add-ons</CardTitle>
              <CardDescription>
                Enhance your plan with these optional features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ADDONS.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        id={addon.id}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={() => toggleAddon(addon.id)}
                      />
                      <Label htmlFor={addon.id} className="cursor-pointer">
                        <div className="font-medium">{addon.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {addon.description}
                        </div>
                      </Label>
                    </div>
                  </div>
                  <div className="text-lg font-semibold ml-4">
                    ${addon.price}/mo
                  </div>
                </div>
              ))}
            </CardContent>
            {selectedAddons.length > 0 && (
              <CardFooter className="flex justify-between items-center border-t pt-6">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total with add-ons
                  </div>
                  <div className="text-2xl font-bold">
                    ${calculateTotal()}/month
                  </div>
                </div>
                <Button
                  onClick={() => handleStartTrial(selectedPlan)}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Continue with Add-ons"
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include a 7-day free trial</p>
          <p>Cancel anytime. No questions asked.</p>
        </div>
      </main>
    </div>
  );
}

