/**
 * Late API Client
 * Documentation: https://getlate.dev/docs
 */

const LATE_API_BASE = "https://getlate.dev/api/v1";
const LATE_KEY = process.env.LATE_MASTER_API_KEY || "sk_8df0f8a562160cf0bb0dcec76a546a734b720bae3123743bf098af6521facaf5";

export interface LateProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LatePlatformInvite {
  id: string;
  profileId: string;
  platform: string;
  inviteUrl: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

export interface LateAccount {
  id: string;
  profileId: string;
  platform: string;
  username: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

export interface LatePostPayload {
  profileId: string;
  content: string;
  platforms: string[];
  scheduledAt?: string;
  mediaItems?: Array<{
    url: string;
    type: "image" | "video";
  }>;
  platformSpecificData?: {
    instagram?: {
      isReel?: boolean;
      firstComment?: string;
    };
    reddit?: {
      subreddit: string;
      title: string;
    };
    linkedin?: {
      firstComment?: string;
    };
    youtube?: {
      title: string;
      description?: string;
    };
  };
  queuedFromProfile?: string;
}

export interface LatePost {
  id: string;
  profileId: string;
  content: string;
  status: "scheduled" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  platforms: string[];
}

export interface LateQueueSlot {
  profileId: string;
  nextSlot: string;
  timezone: string;
}

export interface LateAnalytics {
  profileId: string;
  platform: string;
  metrics: {
    impressions: number;
    engagement: number;
    clicks: number;
    shares: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface LateUsageStats {
  postsCreated: number;
  postsScheduled: number;
  postsPublished: number;
  accountsConnected: number;
  profilesActive: number;
}

class LateApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = LATE_KEY, baseUrl: string = LATE_API_BASE) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Late API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Profile Management
  async createProfile(name: string): Promise<LateProfile> {
    return this.fetch<LateProfile>("/profiles", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getProfiles(): Promise<LateProfile[]> {
    return this.fetch<LateProfile[]>("/profiles");
  }

  async getProfile(profileId: string): Promise<LateProfile> {
    return this.fetch<LateProfile>(`/profiles/${profileId}`);
  }

  // Platform Invites
  async createPlatformInvite(
    profileId: string,
    platform: string
  ): Promise<LatePlatformInvite> {
    return this.fetch<LatePlatformInvite>("/platform-invites", {
      method: "POST",
      body: JSON.stringify({ profileId, platform }),
    });
  }

  async getPlatformInvites(profileId: string): Promise<LatePlatformInvite[]> {
    return this.fetch<LatePlatformInvite[]>(
      `/platform-invites?profileId=${profileId}`
    );
  }

  // Account Management
  async getAccounts(profileId?: string): Promise<LateAccount[]> {
    const query = profileId ? `?profileId=${profileId}` : "";
    return this.fetch<LateAccount[]>(`/accounts${query}`);
  }

  async disconnectAccount(accountId: string): Promise<void> {
    await this.fetch(`/accounts/${accountId}`, {
      method: "DELETE",
    });
  }

  // Post Management
  async createPost(payload: LatePostPayload): Promise<LatePost> {
    return this.fetch<LatePost>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getPosts(profileId?: string): Promise<LatePost[]> {
    const query = profileId ? `?profileId=${profileId}` : "";
    return this.fetch<LatePost[]>(`/posts${query}`);
  }

  async getPost(postId: string): Promise<LatePost> {
    return this.fetch<LatePost>(`/posts/${postId}`);
  }

  async deletePost(postId: string): Promise<void> {
    await this.fetch(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  // Queue Management
  async getNextQueueSlot(profileId: string): Promise<LateQueueSlot> {
    return this.fetch<LateQueueSlot>(`/queue/next-slot?profileId=${profileId}`);
  }

  // Analytics
  async getAnalytics(
    profileId: string,
    platform?: string,
    startDate?: string,
    endDate?: string
  ): Promise<LateAnalytics[]> {
    const params = new URLSearchParams({ profileId });
    if (platform) params.append("platform", platform);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return this.fetch<LateAnalytics[]>(`/analytics?${params.toString()}`);
  }

  // Usage Stats
  async getUsageStats(): Promise<LateUsageStats> {
    return this.fetch<LateUsageStats>("/usage-stats");
  }
}

export const lateApi = new LateApiClient();
export default lateApi;

