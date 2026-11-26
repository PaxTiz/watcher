import type { LegalContent, LegalInfo } from "~/utils/legal";

export default (info: LegalInfo): LegalContent => ({
  privacy: {
    title: "Privacy policy",
    description: "The data Watcher collects, why, how long it is kept and how to delete it.",
    intro:
      "Watcher brings your YouTube and Twitch subscriptions together in one feed. To do that, it needs a minimum of data, and only that. This page explains which data, what we do with it, and how you stay in control.",
    sections: [
      {
        title: "Who is responsible for your data",
        blocks: [
          `The data controller is ${info.publisher}, ${info.address}. For any question about your data, write to [${info.email}](mailto:${info.email}).`,
        ],
      },
      {
        title: "The data we collect",
        blocks: [
          "When you sign in and use Watcher, we store:",
          [
            "your account: the display name of your Google or Twitch profile, the identifier of that account at the provider, and the creation and last sign-in dates;",
            "the access granted by Google and Twitch (OAuth tokens), encrypted with AES-256-GCM; they are only used to read your subscriptions;",
            "your subscriptions: the list of YouTube channels you subscribe to and Twitch channels you follow;",
            "your use of Watcher: your favorites, the channels and videos you have hidden, and your playback position in each video;",
            "your passkeys, if you create any: the public key, the name you give them, the type of device and the dates of use. Your private key and biometric data never leave your device;",
            "your sessions: the browser used (user agent), sign-in and activity dates;",
            "your IP address, temporarily, to limit abusive sign-in attempts;",
            "technical logs (requests, errors), linked to your Watcher identifier, to diagnose problems.",
          ],
          "Twitch also sends your email address when you sign in: Watcher does not keep it.",
        ],
      },
      {
        title: "What we don't do",
        blocks: [
          [
            "Watcher has no password to ask you for, and stores none.",
            "Watcher never posts, changes or subscribes to anything on your YouTube or Twitch accounts: access is read-only.",
            "No ads, no ad trackers, no third-party analytics.",
            "Your data is never sold, rented or shared for commercial purposes.",
          ],
        ],
      },
      {
        title: "Why we use it",
        blocks: [
          [
            "To run the service, that is to show your feed, your favorites and resume your videos where you left off: this is the performance of the service you request by creating your account.",
            "To secure your account and the service (revocable sessions, rate limiting, error logs): this is our legitimate interest in protecting Watcher and its users.",
          ],
        ],
      },
      {
        title: "Google and YouTube data",
        blocks: [
          "Watcher uses the YouTube API Services. With Google, it asks for two permissions: read-only access to your YouTube account (to retrieve your subscriptions) and your basic profile (for your name).",
          "Watcher's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.",
          "By using Watcher, you also agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms). Google processes your data according to its [Privacy Policy](https://policies.google.com/privacy).",
          "You can revoke Watcher's access at any time from the [permissions page of your Google account](https://myaccount.google.com/permissions), and on Twitch from your [Twitch connections](https://www.twitch.tv/settings/connections).",
        ],
      },
      {
        title: "Third-party services",
        blocks: [
          [
            "YouTube (Google) and Twitch, to retrieve your subscriptions and the videos of the channels you follow.",
            "The embedded YouTube player, served from youtube-nocookie.com: when you play a YouTube video, Google receives your IP address and may set its own cookies.",
            "Twitch videos go through Watcher's server: Twitch does not receive your IP address when you watch them.",
            "Channel thumbnails and logos are copied to Watcher's storage: your browser does not load them from YouTube or Twitch.",
            `Hosting is provided by ${info.host}, ${info.host_address}.`,
          ],
        ],
      },
      {
        title: "Cookies and local storage",
        blocks: [
          "Watcher only uses cookies required for it to work, which don't need consent:",
          [
            "an encrypted session cookie that keeps you signed in;",
            "a cookie that remembers your language;",
            "your browser's local storage, which remembers your theme (light or dark).",
          ],
        ],
      },
      {
        title: "How long we keep it",
        blocks: [
          [
            "Your account, subscriptions, favorites and progress: as long as your account exists.",
            "Sessions: 7 days at most, or until you sign out.",
            "IP addresses used for rate limiting: one hour at most.",
            "Technical logs: about 30 days.",
          ],
          "When you delete your account from the app's settings, Watcher revokes its access at Google and Twitch, then erases your account, access tokens, sessions, passkeys, favorites, hidden items and progress. Public channels and videos, shared by all users, are not personal data and stay in place.",
        ],
      },
      {
        title: "Your rights",
        blocks: [
          `Under the GDPR, you can access your data, correct it, erase it, request its portability, restrict its processing or object to it. Deletion is available directly in the app's settings; for anything else, write to [${info.email}](mailto:${info.email}).`,
          "If you believe your rights are not respected, you can lodge a complaint with the [CNIL](https://www.cnil.fr/fr/plaintes), the French data protection authority, or with the authority of your country.",
        ],
      },
      {
        title: "Security",
        blocks: [
          "Google and Twitch access tokens are encrypted, sessions can be revoked at any time from the settings, and sensitive actions (deleting the account, linking or unlinking a service, managing your passkeys) require a recent authentication.",
        ],
      },
      {
        title: "Minimum age",
        blocks: [
          "Watcher is intended for people aged 15 and over. Below that age, the consent of a parent or guardian is required.",
        ],
      },
      {
        title: "Changes",
        blocks: [
          "This policy may change along with the service. The update date at the top of the page shows the latest version; for any significant change, you will be informed in the app.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms of use",
    description: "The rules for using Watcher and the site's legal notice.",
    intro:
      "These terms govern the use of Watcher, the app and this site. By creating an account, you accept them. They are written to be read: if something is unclear, write to us.",
    sections: [
      {
        title: "The service",
        blocks: [
          "Watcher brings the videos and lives of the YouTube and Twitch channels you follow together in a single feed, with one player, favorites and resume playback.",
          "Watcher is free. Paid features may be offered later; they will be clearly presented as such and nothing will be charged without your explicit consent.",
        ],
      },
      {
        title: "Your account",
        blocks: [
          "You sign in with Google, Twitch or a passkey. You are responsible for access to those accounts and for what is done from your session. If you think someone is using your account, revoke your sessions from the settings and write to us.",
          "You can delete your account at any time from the app's settings.",
        ],
      },
      {
        title: "Acceptable use",
        blocks: [
          "By using Watcher, you agree not to:",
          [
            "circumvent the technical limits of the service or try to access other users' data;",
            "extract data from Watcher at scale through automated means;",
            "use Watcher to download, redistribute or commercially exploit creators' content;",
            "disrupt the operation of the service or its providers.",
          ],
          "In case of breach, access to the account concerned may be suspended or deleted.",
        ],
      },
      {
        title: "Creators' content",
        blocks: [
          "The videos, lives, thumbnails and channel names shown in Watcher belong to their creators and remain subject to the terms of YouTube and Twitch. Watcher only displays them for you; it claims no rights over them.",
          "Watcher is not affiliated with or endorsed by Twitch Interactive or YouTube LLC. By using Watcher, you also agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms) and the [Twitch Terms of Service](https://www.twitch.tv/p/legal/terms-of-service/).",
        ],
      },
      {
        title: "Availability",
        blocks: [
          "Watcher does its best to be available and up to date, but depends on YouTube and Twitch: a video may show up with a slight delay, and a feature may stop working if either of them changes its rules. The service may change, be interrupted for maintenance or shut down; in that last case, you will be warned in advance as much as possible.",
        ],
      },
      {
        title: "Liability",
        blocks: [
          "Watcher is provided as is. To the extent permitted by law, the publisher cannot be held liable for service interruptions, content published by creators, or decisions made by YouTube or Twitch.",
        ],
      },
      {
        title: "Personal data",
        blocks: ["How Watcher processes your data is described in the [privacy policy](privacy)."],
      },
      {
        title: "Changes and governing law",
        blocks: [
          "These terms may change; for any significant change, you will be informed in the app. They are governed by French law. In case of dispute, an amicable solution will be sought first; failing that, the French courts have jurisdiction.",
          "These terms exist in several languages; in case of discrepancy, the French version prevails.",
        ],
      },
      {
        title: "Legal notice",
        blocks: [
          [
            `Publisher: ${info.publisher}, ${info.status}, ${info.address}. ${info.siret}.`,
            `Publication director: ${info.publisher}.`,
            `Contact: [${info.email}](mailto:${info.email}).`,
            `Host: ${info.host}, ${info.host_address}.`,
          ],
        ],
      },
    ],
  },
});
