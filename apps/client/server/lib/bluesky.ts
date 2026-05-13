import { AtpAgent } from "@atproto/api";

let _agent: AtpAgent | null;

export const useBluesky = () => {
  if (!_agent) {
    _agent = new AtpAgent({
      service: "https://public.api.bsky.app",
    });
  }

  return _agent;
};
