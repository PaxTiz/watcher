export type Device = {
  browser: string | null;
  os: string | null;
  type: "desktop" | "mobile" | "tablet";
};

const BROWSERS: Array<[RegExp, string]> = [
  [/Edg(A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser\//, "Samsung Internet"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: Array<[RegExp, string]> = [
  [/iPad/, "iPadOS"],
  [/iPhone|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux/, "Linux"],
];

export const parseUserAgent = (user_agent: string | null): Device => {
  if (!user_agent) {
    return { browser: null, os: null, type: "desktop" };
  }

  const browser = BROWSERS.find(([pattern]) => pattern.test(user_agent))?.[1] ?? null;
  const os = SYSTEMS.find(([pattern]) => pattern.test(user_agent))?.[1] ?? null;

  let type: Device["type"] = "desktop";
  if (
    /iPad|Tablet/.test(user_agent) ||
    (/Android/.test(user_agent) && !/Mobile/.test(user_agent))
  ) {
    type = "tablet";
  } else if (/Mobi|iPhone|iPod/.test(user_agent)) {
    type = "mobile";
  }

  return { browser, os, type };
};
