import { createError, getRequestURL, type RequestEvent, useRuntimeConfig } from "nuxt/server";

import { useLogger } from "#framework";

// `nuxt-auth-utils` derives the relying party ID and the expected origin from the request URL,
// so from the `Host` header. Requests reaching the WebAuthn endpoints with another origin than
// the configured one (`NUXT_SITE_URL`) are rejected: both values then match the site URL.
export const require_webauthn_rp_id = (event: RequestEvent) => {
  const { siteUrl, public: public_config } = useRuntimeConfig();

  if (!siteUrl) {
    if (public_config.environment !== "local") {
      useLogger("server.utils.webauthn").error("NUXT_SITE_URL is not configured");
      throw createError({ status: 500, message: "NUXT_SITE_URL is not configured" });
    }

    return getRequestURL(event).hostname;
  }

  const site_url = new URL(siteUrl);
  if (getRequestURL(event).origin !== site_url.origin) {
    useLogger("server.utils.webauthn").warn(
      { origin: getRequestURL(event).origin, expected: site_url.origin },
      "WebAuthn request refused: unexpected origin",
    );
    throw createError({ status: 400, message: "invalid_origin" });
  }

  return site_url.hostname;
};

// `nuxt-auth-utils` verifies the responses with `requireUserVerification: false`
export const require_user_verification = (user_verified: boolean) => {
  if (!user_verified) {
    useLogger("server.utils.webauthn").warn("WebAuthn response refused: user not verified");
    throw createError({ status: 400, message: "user_verification_required" });
  }
};
