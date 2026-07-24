export const VIDEO_CURRENT_REFRESH_SYMBOL = Symbol("__VIDEO_CURRENT_REFRESH_SYMBOL__");
export type VideoCurrentRefreshType = () => Promise<void>;

export const VIDE_ON_HIDE_SYMBOL = Symbol("__VIDEO_ON_HIDE_SYMBOL__");
export type VideoOnHideType = () => Promise<void>;
