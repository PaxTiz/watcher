// Mirrors `AuthenticatorTransportFuture` from @simplewebauthn, so it stays assignable to
// `WebAuthnCredential["transports"]` without depending on nuxt-auth-utils.
export type PasskeyTransport =
  | "ble"
  | "cable"
  | "hybrid"
  | "internal"
  | "nfc"
  | "smart-card"
  | "usb";
