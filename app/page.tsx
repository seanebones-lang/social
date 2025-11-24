import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, BarChart3, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Pulse Social</h1>
          <div className="flex gap-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/pricing">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">
            Schedule Social Media Posts
            <br />
            <span className="text-blue-600">Across All Platforms</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage Instagram, TikTok, X, Facebook, YouTube, LinkedIn, Threads, Pinterest, Reddit, and Bluesky from one powerful dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">
              Queue posts and let our AI find the best times to publish for maximum engagement.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
            <p className="text-gray-600">
              Post to 10 different social networks simultaneously with platform-specific optimizations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">
              Track performance across all platforms with detailed insights and engagement metrics.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

