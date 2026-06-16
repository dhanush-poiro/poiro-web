// Static media manifest — replaces the /api/masonry serverless function.
// Update this file whenever files are added/removed from the gallery folders.
//
// `poster`      — first-frame webp (generated via ffmpeg into /public/posters/…)
//                 shown instantly while the video buffers. Regenerate when a
//                 video changes:
//                 ffmpeg -i in.mp4 -frames:v 1 -vf "scale=640:-2" -c:v libwebp -quality 78 out.webp
// `aspectRatio` — intrinsic width/height. Optional; images default to 1 (square),
//                 videos default to 9/16 portrait display. Set it only when an
//                 image is not square.

export type MediaType = "image" | "video";
export interface MediaItem {
  src: string;
  type: MediaType;
  poster?: string;
  aspectRatio?: number;
}

const MANIFEST: Record<string, MediaItem[]> = {
  "short-form": [
    { src: "/short-form/Social%20Ugc%20-%20Efpy.mp4",                            type: "video", poster: "/posters/short-form/Social%20Ugc%20-%20Efpy.webp",                            aspectRatio: 1.5   },
    { src: "/short-form/Social%20Video%20-%20Chumbak%20Collection%20Launch.mp4", type: "video", poster: "/posters/short-form/Social%20Video%20-%20Chumbak%20Collection%20Launch.webp", aspectRatio: 1.5   },
    { src: "/short-form/Social%20Video%20-%20Greenfields%20Event%20Promo.mp4",   type: "video", poster: "/posters/short-form/Social%20Video%20-%20Greenfields%20Event%20Promo.webp",   aspectRatio: 1.5   },
    { src: "/short-form/Social%20Video%20-%20Greenfields%20Geo%20Targeting.mp4", type: "video", poster: "/posters/short-form/Social%20Video%20-%20Greenfields%20Geo%20Targeting.webp", aspectRatio: 1.5   },
    { src: "/short-form/Social%20Video%20-%20Kopi%20Kenangan.mp4",               type: "video", poster: "/posters/short-form/Social%20Video%20-%20Kopi%20Kenangan.webp",               aspectRatio: 1.0   },
    { src: "/short-form/Social%20Video%20-%20Richeese.mp4",                      type: "video", poster: "/posters/short-form/Social%20Video%20-%20Richeese.webp",                      aspectRatio: 1.778 },
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
    { src: "/ugc-affiliate/Product%20Ad%20-%20Parachute.mp4",                       type: "video", poster: "/posters/ugc-affiliate/Product%20Ad%20-%20Parachute.webp",                       aspectRatio: 1.0 },
    { src: "/ugc-affiliate/Product%20Ad%20-%20Raja%20Ampat%20Lagoon.mp4",           type: "video", poster: "/posters/ugc-affiliate/Product%20Ad%20-%20Raja%20Ampat%20Lagoon.webp",           aspectRatio: 1.5 },
    { src: "/ugc-affiliate/Social%20UGC%20-%20Efpy.mp4",                            type: "video", poster: "/posters/ugc-affiliate/Social%20UGC%20-%20Efpy.webp",                            aspectRatio: 1.5 },
    { src: "/ugc-affiliate/Social%20Video%20-%20Greenfields%20Geo%20Targeting.mp4", type: "video", poster: "/posters/ugc-affiliate/Social%20Video%20-%20Greenfields%20Geo%20Targeting.webp", aspectRatio: 1.5 },
  ],
  "tvc-animatics": [
    { src: "/tvc-animatics/Advanced%20Animatics%20-%20Mitu%20Baby.mp4",                         type: "video", poster: "/posters/tvc-animatics/Advanced%20Animatics%20-%20Mitu%20Baby.webp",                         aspectRatio: 1.778 },
    { src: "/tvc-animatics/Advanced%20Animatics%20-%20NYU.mp4",                                 type: "video", poster: "/posters/tvc-animatics/Advanced%20Animatics%20-%20NYU.webp",                                 aspectRatio: 1.778 },
    { src: "/tvc-animatics/Animated%20Commercial%20-%20Cap%20Gajah.mp4",                        type: "video", poster: "/posters/tvc-animatics/Animated%20Commercial%20-%20Cap%20Gajah.webp",                        aspectRatio: 1.778 },
    { src: "/tvc-animatics/Live%20Action%20Commercial%20%28preview%20version%29%20-%20HIT.mp4", type: "video", poster: "/posters/tvc-animatics/Live%20Action%20Commercial%20%28preview%20version%29%20-%20HIT.webp", aspectRatio: 1.778 },
    { src: "/tvc-animatics/Product%20Ad%20-%20Stella%20Electric.mp4",                           type: "video", poster: "/posters/tvc-animatics/Product%20Ad%20-%20Stella%20Electric.webp",                           aspectRatio: 1.778 },
  ],
};

export function getMediaForFolder(folder: string): MediaItem[] {
  return MANIFEST[folder] ?? [];
}
