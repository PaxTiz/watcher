export default {
  meta: {
    description: "Watcher - Follow all your favorite creators in one place",
  },

  nav: {
    label: "Main navigation",
    breadcrumb: "Breadcrumb",
    home: "Home",
    videos: "Videos",
    favorites: "Favorites",
    my_favorites: "My favorites",
    subscriptions: "Subscriptions",
    channels: "Channels",
    settings: "Settings",
    open_menu: "Open menu",
    back: "Back",
    expand: "Expand",
    collapse: "Collapse",
    expand_sidebar: "Expand sidebar",
    collapse_sidebar: "Collapse sidebar",
  },

  account: {
    label: "Account",
    label_of: "{name}'s account",
    logout: "Log out",
  },

  sync: {
    action: "Sync",
    running: "Syncing…",
    done: "Sync complete",
    failed: "Sync failed, please try again in a few minutes",
  },

  errors: {
    generic: "Something went wrong, please try again in a moment",
    internal: "An internal error occurred",
  },

  validation: {
    name_too_long: "The name must not exceed 64 characters",
  },

  auth: {
    title: "Log in",
    headline: "All your channels, in one place.",
    benefits: {
      feed: "Your YouTube and Twitch subscriptions together in one feed",
      order: "In the order they come out, with no algorithm sorting for you",
      resume: "Pick up every video right where you left off",
    },
    google: "Continue with Google",
    passkey: "Passkey",
    no_account: "No account yet?",
    signup_with_passkey: "Create an account with a passkey",
    read_only: "Read-only access to your YouTube and Twitch subscriptions.",
    preview: {
      title: "One feed",
      text: "all your channels, in the order they come out",
    },
    signup: {
      title: "Create an account with a passkey",
      description:
        "Your passkey is stored on your device or in your password manager. No password to remember.",
      name: "Your name",
      name_placeholder: "John",
      submit: "Create my account",
    },
  },

  passkeys: {
    title: "Passkeys",
    description: "Log in with your device's fingerprint, face or PIN.",
    name: "Passkey name",
    name_placeholder: "MacBook, iPhone, Bitwarden…",
    name_hint:
      "Give it a name so you can easily recognize it, such as the device or password manager that stores it.",
    added_on: "Added on {date}",
    used_ago: "Used {ago}",
    add: {
      title: "Add a passkey",
      supported: "Save a passkey on this device.",
      unsupported: "Your browser doesn't support passkeys.",
      success: "Your passkey has been added",
    },
    rename: {
      title: "Rename passkey",
      success: "The passkey has been renamed",
      failed: "Renaming the passkey failed, please try again later",
    },
    delete: {
      title: "Delete this passkey",
      description:
        "You will no longer be able to log in to Watcher with this passkey. Remember to also remove it from your device or password manager.",
      success: "The passkey has been deleted",
      failed: "Deleting the passkey failed, please try again later",
      last_login_method: "Link an account or another passkey before deleting this one",
    },
    errors: {
      already_registered: "This passkey is already linked to your account",
      unknown: "This passkey isn't linked to any Watcher account",
      expired: "The request has expired, please try again",
      login: "Something went wrong while logging in with your passkey",
      signup: "Something went wrong while creating your account",
      add: "Something went wrong while adding your passkey",
    },
  },

  dashboard: {
    description: "Discover the latest releases from your favorite creators.",
    greeting: "Hi {name}",
    synced_ago: "Synced {ago}",
    resume: "Continue watching",
    resume_action: "Resume",
    mark_as_watched: "Mark as watched",
    also_in_progress: "Also in progress",
    favorites: "New from your favorites",
    empty: {
      title: "No videos to show.",
      description: "Run a sync to fetch some content.",
    },
    loading_more: "Loading more videos…",
    groups: {
      today: "Today",
      yesterday: "Yesterday",
      weekly: "This week",
      monthly: "Last 30 days",
      older: "Older",
    },
  },

  onboarding: {
    title: "Welcome",
    description: "Set up your accounts and sync your subscriptions with ease",
    heading: "Welcome to Watcher",
    lead: "Link your accounts, then run a first sync to fetch your channels and their latest videos.",
    link: {
      title: "Link your accounts",
      description: "Connect the platforms of your choice to bring all your subscriptions together.",
    },
    sync: {
      title: "Sync your subscriptions",
      description:
        "Watcher fetches your subscriptions from the linked accounts and imports their latest videos.",
      action: "Sync my subscriptions",
      later: "Later",
      stay: "Stay on this page, you will be redirected automatically.",
    },
  },

  integrations: {
    linked: "Connected",
    unlinked: "Not connected",
    link: "Link",
    disconnect: {
      action: "Disconnect",
      title: "Disconnect your {name} account",
      description:
        "If you disconnect your account, your subscriptions and their videos will no longer be updated.",
      success: "Your {name} account has been disconnected",
      failed: "Something went wrong while disconnecting {name}",
    },
    oauth: {
      success: "Your {provider} account is now connected",
      already_linked: "This {provider} account is already linked to another Watcher account.",
      failed: "Something went wrong while connecting to your {provider} account",
    },
  },

  settings: {
    heading: "My account",
    linked_accounts: {
      title: "Linked accounts",
      description: "Your YouTube and Twitch subscriptions are fetched from these accounts.",
    },
    interface: "Interface",
    account: "Account",
    danger: "Danger zone",
    delete_account: {
      title: "Delete my account",
      description: "Permanently deletes your account, subscriptions and history.",
      confirm:
        "Your account, subscriptions and history will be permanently deleted. This action cannot be undone.",
      success: "Your account has been deleted",
      failed: "Deleting your account failed, please try again later",
    },
  },

  subscriptions: {
    filter: "Filter {count} subscriptions",
    filter_label: "Filter subscriptions",
    filter_by_service: "Filter by service",
    all_services: "All services",
    hidden: "Hidden",
    new_video: "New video in the last 24 hours",
    empty: "No subscriptions found.",
    logo: "{name} logo",
    discover: "Discover the latest videos from {name}.",
    last_video: "Last video {ago}",
    open_on: "Open on {service}",
    search_in: "Search in {name}",
    search_in_label: "Search {name}'s videos",
    favorite: {
      add: "Add to favorites",
      remove: "Remove from favorites",
      active: "In favorites",
      added: "{name} has been added to your favorites",
      removed: "{name} has been removed from your favorites",
      failed: "Updating your favorites failed, please try again later",
    },
    hide: {
      action: "Hide",
      show: "Show again",
      title: "Hide channel",
      description:
        "Videos from {name} will no longer appear in your feed. You can show it again from this page.",
      notice: "This channel is hidden: its videos don't appear in your feed.",
      failed: "Updating the channel failed, please try again later",
    },
  },

  videos: {
    description: "Browse all the videos from your YouTube and Twitch subscriptions.",
    favorites_title: "Videos from your favorites",
    results_for: "Results for “{query}”",
    count: "{n} videos | {n} video | {n} videos",
    no_results: "Sorry, no results were found for your search.",
    watched: "Watched",
    new: "New",
    actions: "Video actions",
    video: "Video",
    subscription: "Subscription",
    published: "Published {ago} · {date}",
    watch_description: "Watch {title} by {author}, published on {date}.",
    mark_as_watched: {
      action: "Mark as watched",
      success: "The video has been marked as watched",
      failed: "The video couldn't be marked as watched, please try again later",
    },
    hide: {
      action: "Hide video",
      title: "Hide a video",
      description: "Do you really want to hide this video? It will no longer appear in your feed.",
      hidden: "Video hidden",
      hidden_description: "It will no longer appear in your feed.",
      success: "The video has been hidden",
      failed: "Hiding the video failed, please try again later",
    },
    hide_channel: {
      action: "Hide channel",
      title: "Hide a channel",
      description:
        "Do you really want to hide this channel? Its history and new videos will no longer be visible in your feed.",
      hidden: "Channel hidden",
      hidden_description: "Its videos will no longer appear in your feed.",
      success: "The channel has been hidden",
      failed: "Hiding the channel failed, please try again later",
    },
    favorite: {
      added: "The subscription has been added to your favorites",
      removed: "The subscription has been removed from your favorites",
    },
    up_next: {
      title: "Up next",
      autoplay: "Autoplay",
      next: "Next",
      empty: "No other videos from this channel yet.",
    },
    countdown: {
      label: "Next video",
      remaining: "Next video in {seconds}s",
      play_now: "Play now",
    },
    filters: {
      label: "Filters",
      platform: "Platform",
      date: "Date",
      duration: "Duration",
      all_dates: "All dates",
      all_durations: "All durations",
      dates: {
        today: "Today",
        weekly: "This week",
        monthly: "Last 30 days",
        yearly: "Last 365 days",
        older: "Older",
      },
      durations: {
        less_than_10_minutes: "< 10 minutes",
        between_10_30_minutes: "Between 10 and 30 minutes",
        between_30_60_minutes: "Between 30 and 60 minutes",
        greater_than_1_hour: "> 60 minutes",
      },
    },
  },

  search: {
    title: "Search",
    placeholder: "Search for a video or a channel…",
    failed: "The search failed. Please try again in a moment.",
    min_chars: "Type at least {count} characters to start searching.",
    no_results: "No results for “{query}”.",
    views: "{count} views",
    subscribers: "{count} subscribers | {count} subscriber | {count} subscribers",
    filters: {
      type: "Result type",
      duration: "Duration",
      sort: "Sort",
    },
    types: {
      all: "All",
      videos: "Videos",
      channels: "Channels",
    },
    durations: {
      any: "Any duration",
      short: "< 4 min",
      medium: "4–20 min",
      long: "> 20 min",
    },
    sorts: {
      relevance: "Relevance",
      recent: "Recent",
      views: "Popular",
    },
  },
};
