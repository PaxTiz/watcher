import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { tryResolveModule } from "nuxt/kit";

// nuxt-auth-utils only exposes its server helpers as Nitro auto-imports: they are re-exported
// here, so the server code can import them explicitly from `#framework/auth`.
const EXPORTS: Record<string, Array<string>> = {
  "runtime/server/utils/session": [
    "clearUserSession",
    "getUserSession",
    "replaceUserSession",
    "requireUserSession",
    "sessionHooks",
    "setUserSession",
  ],
  "runtime/server/lib/oauth/google": ["defineOAuthGoogleEventHandler"],
  "runtime/server/lib/oauth/twitch": ["defineOAuthTwitchEventHandler"],
  "runtime/server/lib/webauthn/authenticate": ["defineWebAuthnAuthenticateEventHandler"],
  "runtime/server/lib/webauthn/register": ["defineWebAuthnRegisterEventHandler"],
};

export async function buildAuth(nuxtRoot: string, root: string) {
  const entry = await tryResolveModule("nuxt-auth-utils", pathToFileURL(join(nuxtRoot, "/")));
  if (!entry) {
    throw new Error("[framework] Could not resolve nuxt-auth-utils");
  }

  const dist = dirname(entry);
  const exports = Object.entries(EXPORTS).map(
    ([file, names]) => `export { ${names.join(", ")} } from '${join(dist, file)}';`,
  );

  await writeFile(join(root, "auth.ts"), `${exports.join("\n")}\n`);
}
