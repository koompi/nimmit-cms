import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface KoompiProfile extends Record<string, any> {
  user: {
    _id: string;
    fullname: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    profile: string;
    phone: string;
    telegram_id: number;
    wallet_address: string;
  };
}

// Koompi OAuth configuration
const KOOMPI_OAUTH_BASE_URL =
  process.env.KOOMPI_OAUTH_URL || "https://oauth.koompi.org";

export default function KoompiProvider<P extends KoompiProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "koompi",
    name: "Koompi",
    type: "oauth",
    authorization: {
      url: KOOMPI_OAUTH_BASE_URL,
      params: { scope: "email profile" },
    },
    token: `${KOOMPI_OAUTH_BASE_URL}/v1/oauth/token`,
    userinfo: `${KOOMPI_OAUTH_BASE_URL}/v1/oauth/userinfo`,
    profile(profile) {
      const user = profile.user;
      return {
        id: user._id,
        name:
          user.fullname ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username,
        email: user.email,
        image: user.profile || null,
        role: "USER" as const, // Default role for new OAuth users
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        telegramId: user.telegram_id,
        walletAddress: user.wallet_address,
        phone: user.phone,
      };
    },
    style: {
      logo: "/koompi-logo.svg",
      logoDark: "/koompi-logo-dark.svg",
      bg: "#1a1a2e",
      text: "#ffffff",
      bgDark: "#1a1a2e",
      textDark: "#ffffff",
    },
    options,
  };
}

// Helper to check if Koompi OAuth is configured
export function isKoompiOAuthConfigured(): boolean {
  return !!(process.env.KOOMPI_CLIENT_ID && process.env.KOOMPI_CLIENT_SECRET);
}
