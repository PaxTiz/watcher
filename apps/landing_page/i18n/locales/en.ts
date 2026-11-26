export default {
  a11y: {
    skip_to_content: "Skip to content",
  },

  page: {
    home: "Home",
  },

  nav: {
    label: "Sections",
    home: "Home",
    why: "Why",
    features: "Features",
    fusion: "Merge",
    roadmap: "Roadmap",
    faq: "FAQ",
    login: "Log in",
    join: "Get started",
  },

  sign_in: {
    twitch: "Continue with Twitch",
    youtube: "Continue with YouTube",
  },

  hero: {
    title: "Your creators are everywhere.",
    title_accent: "You just need one place.",
    lead: "Watcher brings your Twitch and YouTube subscriptions together in a calm app, with no algorithm. Just new uploads from the people you follow, in order, favorites first.",
    note: "Free · Official sign-in, no password stored",
    preview_label:
      "Preview of the Watcher home: new uploads from favorites and yesterday's videos, with fictional creators",
  },

  preview: {
    favorites_new: "New from your favorites",
    see_all: "See all",
    yesterday: "Yesterday",
    home: "Home",
    live: "LIVE",
    viewers: "{count} watching",
    up_next: "Up next",
    autoplay: "Autoplay",
  },

  videos: {
    live_now: "live now",
    items: {
      live: { title: "Painting workshop — night landscape, day 3", when: "" },
      ice: { title: "Three days in Iceland, no car", when: "2 h ago" },
      notes: { title: "My travel journal, page by page", when: "3 days ago" },
      synth: { title: "Fixing a 1984 synth — episode 4", when: "5 h ago" },
      scope: { title: "A €15 oscilloscope: any good?", when: "6 days ago" },
      rediff: { title: "VOD · Painting workshop, day 2", when: "yesterday" },
      clip: { title: "Timelapse: the sky in 40 seconds", when: "4 days ago" },
      cook: { title: "A week of cooking with €20 of leftovers", when: "yesterday" },
      plant: { title: "Repotting without hurting the roots", when: "yesterday" },
      game: { title: "My first game in 48 h: the recap", when: "yesterday" },
    },
  },

  why: {
    label: "Why Watcher",
    title: "Following 50 creators shouldn't take 6 tabs.",
    problem_label: "The problem",
    problem: "Two apps, notifications everywhere, and the same video twice.",
    solution_label: "The solution",
    solution: "One feed, in order. Your favorites first.",
    recommended: "Recommended for you",
    feed_label: "The Watcher feed: a single list with the current live, then new videos in order",
    sources: {
      live: { what: "is live — Painting workshop, night 3", ago: "41 min" },
      ice: { what: "New video: Three days in Iceland…", ago: "2 h" },
      synth: { what: "Fixing a 1984 synth — episode 4", ago: "5 h" },
      rediff: { what: "Painting workshop, day 2 (VOD)", ago: "yesterday" },
      recommended: { what: "Three days in Iceland, no car", ago: "2 h" },
      game: { what: "VOD: My first game in 48 h", ago: "yesterday" },
    },
  },

  features: {
    label: "Features",
    title: "One player, your favorites.",
    player: {
      label: "Player",
      title: "Twitch and YouTube, one player.",
      text: "A Twitch live, then another creator's YouTube video: you stay in Watcher, and what's next plays from the same queue.",
      preview_label:
        "Preview: the Watcher player showing a Twitch live, with a queue mixing YouTube and Twitch videos",
    },
    favorites: {
      label: "Favorites",
      title: "Your favorites first. The rest after.",
      text: "New uploads from your favorite creators sit at the top of your home. Your other subscriptions stay within reach, without cutting in line.",
      preview_label: "Preview: new uploads from favorites at the top of the home",
    },
    no_reco: {
      title: "No recommendations.",
      text: "Watcher only shows uploads from the creators you follow, in order, favorites first.",
    },
  },

  fusion: {
    label: "Merge",
    soon: "Coming soon",
    title: "One creator. All their channels.",
    text: "Live on Twitch, VODs on a separate YouTube channel, clips on a third? Watcher brings them together under a single profile. Try it:",
    toggle_label: "Channel display",
    split: "Separate",
    merged: "Merged",
    subscriptions: "Subscriptions",
    count_split: "3 channels",
    count_merged: "1 creator",
    tags: {
      videos: "3 videos",
      clips: "5 clips",
    },
    split_note: "Three entries, three pages to open. Nothing tells you it's the same person.",
    channels: {
      twitch: "Twitch",
      rediffs: "VODs",
      clips: "Clips",
    },
    video_channels: {
      twitch: "Twitch",
      rediffs: "YouTube · VODs",
      clips: "YouTube · Clips",
    },
    all_in_one: "Everything in one place",
    notice_title: "Upcoming feature.",
    notice: "Channel merging isn't available yet: this preview shows what's planned.",
    notice_link: "See the roadmap",
  },

  start: {
    label: "30 seconds",
    title: "Ready before the opening credits end.",
    steps: {
      twitch: {
        title: "Connect Twitch",
        text: "Official sign-in in one click. The channels you follow are imported.",
      },
      youtube: {
        title: "Connect YouTube",
        text: "Same for your subscriptions. Nothing to type in again.",
      },
      favorites: {
        title: "Pick your favorites",
        text: "Choose who comes first. Your feed is ready.",
      },
    },
  },

  roadmap: {
    label: "Roadmap",
    title: "Where we're at.",
    lead: "What's being built, what's already available, and the ideas we keep in mind.",
    columns: {
      idea: "Considering",
      dev: "In progress",
      done: "Available",
    },
    status: {
      idea: "Considering · nothing decided",
      dev: "In development",
      done: "Available",
    },
    detail: "Details",
    close: "Close",
    items: {
      fusion: {
        title: "Channel merging",
        description: "Bring a creator's Twitch and YouTube channels together under one profile.",
        detail:
          "Many creators publish on several channels: a live on Twitch, VODs and clips on YouTube. With merging, you group them under a single profile and their videos show up together in your feed. You'll be able to merge and split whenever you want.",
      },
      mobile: {
        title: "Mobile app",
        description: "Your Watcher feed on your phone.",
        detail:
          "The same feed, the same favorites and the same player on your phone. It's an idea we're looking into: nothing is decided, neither the form nor the timeline.",
      },
      platforms: {
        title: "More platforms",
        description: "Follow creators beyond Twitch and YouTube too.",
        detail:
          "Watcher brings together Twitch and YouTube today. We're looking at whether other platforms are worth adding. Nothing is decided, neither the list nor the timeline.",
      },
      favorites: {
        title: "Favorites first",
        description: "New uploads from your favorite creators come before the rest.",
        detail:
          "Mark creators as favorites: their lives and new videos rise to the very top of your feed, ahead of the rest of your subscriptions.",
      },
      player: {
        title: "One player",
        description: "Twitch and YouTube in the same player, with a queue.",
        detail:
          "Twitch and YouTube play in the same player. You can line up videos from different platforms in one queue, without switching tabs.",
      },
      autoplay: {
        title: "Autoplay",
        description: "The next video starts on its own.",
        detail:
          "When a video ends, the next one in your queue starts on its own. You can turn it off if you'd rather stay in control.",
      },
      hide: {
        title: "Hide",
        description: "Hide a channel or a video without unsubscribing.",
        detail:
          "Not interested in a channel or a video? Hide it: it disappears from your feed, without unsubscribing from the channel.",
      },
      search: {
        title: "Search within a channel",
        description: "Find a creator's video, with date and duration filters.",
        detail:
          "Find a specific video from a creator by searching their channel, and narrow it down with date and duration filters.",
      },
    },
  },

  faq: {
    title: "Frequently asked questions",
    items: {
      free: {
        question: "Is the app free?",
        answer: "Yes, Watcher is free. A premium plan, with advanced filters, will come later.",
      },
      algorithm: {
        question: "Why “no algorithm”?",
        answer:
          "Watcher doesn't recommend anything. You see uploads from the channels you follow, in order, with your favorites first.",
      },
      security: {
        question: "Are my credentials safe?",
        answer:
          "Watcher only uses the official Twitch and YouTube sign-ins (OAuth). Your password is never stored.",
      },
    },
  },

  cta: {
    title: "Your favorite creator's next live? You won't miss it.",
    note: "Free, no card, no commitment.",
  },

  error: {
    not_found: {
      title: "Page not found",
      description: "The page you're looking for doesn't exist or has been moved.",
    },
    generic: {
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try again.",
    },
    back_home: "Back to home",
  },

  legal: {
    updated: "Updated on {date}",
    toc: "Contents",
  },

  footer: {
    label: "Footer",
    copyright:
      "© 2026 Watcher. Not affiliated with Twitch Interactive or YouTube LLC. Creators and videos shown are fictional examples.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
  },
};
