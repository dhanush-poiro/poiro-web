// Static media manifest — replaces the /api/masonry serverless function.
// Update this file whenever files are added/removed from the gallery folders.

export type MediaType = "image" | "video";
export interface MediaItem { src: string; type: MediaType; }

const MANIFEST: Record<string, MediaItem[]> = {
  "short-form": [
    { src: "/short-form/Social%20Ugc%20-%20Efpy.mp4",                          type: "video" },
    { src: "/short-form/Social%20Video%20-%20Chumbak%20Collection%20Launch.mp4", type: "video" },
    { src: "/short-form/Social%20Video%20-%20Greenfields%20Event%20Promo.mp4",  type: "video" },
    { src: "/short-form/Social%20Video%20-%20Greenfields%20Geo%20Targeting.mp4", type: "video" },
    { src: "/short-form/Social%20Video%20-%20Kopi%20Kenangan.mp4",              type: "video" },
    { src: "/short-form/Social%20Video%20-%20Richeese.mp4",                     type: "video" },
  ],
  "statics": [
    { src: "/statics/Chumbak%202.webp", type: "image" },
    { src: "/statics/Chumbak%203.webp", type: "image" },
    { src: "/statics/Chumbak%204.webp", type: "image" },
    { src: "/statics/Chumbak%205.webp", type: "image" },
    { src: "/statics/Godrej%201.webp",  type: "image" },
    { src: "/statics/Godrej%202.webp",  type: "image" },
    { src: "/statics/Godrej%203.webp",  type: "image" },
    { src: "/statics/Godrej%204.webp",  type: "image" },
    { src: "/statics/Godrej%205.webp",  type: "image" },
  ],
  "ugc-affiliate": [
    { src: "/ugc-affiliate/Product%20Ad%20-%20Parachute.mp4",                  type: "video" },
    { src: "/ugc-affiliate/Product%20Ad%20-%20Raja%20Ampat%20Lagoon.mp4",      type: "video" },
    { src: "/ugc-affiliate/Social%20UGC%20-%20Efpy.mp4",                       type: "video" },
    { src: "/ugc-affiliate/Social%20Video%20-%20Greenfields%20Geo%20Targeting.mp4", type: "video" },
  ],
  "tvc-animatics": [
    { src: "/tvc-animatics/Advanced%20Animatics%20-%20Mitu%20Baby.mp4",                       type: "video" },
    { src: "/tvc-animatics/Advanced%20Animatics%20-%20NYU.mp4",                               type: "video" },
    { src: "/tvc-animatics/Animated%20Commercial%20-%20Cap%20Gajah.mp4",                      type: "video" },
    { src: "/tvc-animatics/Live%20Action%20Commercial%20%28preview%20version%29%20-%20HIT.mp4", type: "video" },
    { src: "/tvc-animatics/Product%20Ad%20-%20Stella%20Electric.mp4",                         type: "video" },
  ],
};

export function getMediaForFolder(folder: string): MediaItem[] {
  return MANIFEST[folder] ?? [];
}
