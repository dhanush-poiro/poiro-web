// Static media manifest — replaces the /api/masonry serverless function.
// Update this file whenever files are added/removed from the gallery folders.

export type MediaType = "image" | "video";
export interface MediaItem { src: string; type: MediaType; }

const MANIFEST: Record<string, MediaItem[]> = {
  "short-form": [
    { src: "/short-form/redpandacompress_00%20Chumbak%20Collection%20Launch%20Video.mp4",       type: "video" },
    { src: "/short-form/redpandacompress_00%20Greenfields%20Padel%20Event%20Promo%20Video.mp4", type: "video" },
    { src: "/short-form/redpandacompress_Astec%20Shoes%20Promo%20Video%20(2).mp4",              type: "video" },
    { src: "/short-form/redpandacompress_Chumbak_Christmas_StopMotionVideo.mp4",                type: "video" },
    { src: "/short-form/redpandacompress_Chumbak_Leopard.mp4",                                 type: "video" },
    { src: "/short-form/redpandacompress_Stella%20Electric%206s%20Vertical.mp4",               type: "video" },
    { src: "/short-form/redpandacompress_Voylla%20-%20Jewelry%20Video.mp4",                    type: "video" },
    { src: "/short-form/redpandacompress_recoffee.mp4",                                        type: "video" },
  ],
  "statics": [
    { src: "/statics/Chumbak%202.png", type: "image" },
    { src: "/statics/Chumbak%203.png", type: "image" },
    { src: "/statics/Chumbak%204.png", type: "image" },
    { src: "/statics/Chumbak%205.png", type: "image" },
    { src: "/statics/Godrej%201.png",  type: "image" },
    { src: "/statics/Godrej%202.png",  type: "image" },
    { src: "/statics/Godrej%203.png",  type: "image" },
    { src: "/statics/Godrej%204.png",  type: "image" },
    { src: "/statics/Godrej%205.png",  type: "image" },
  ],
  "ugc-affiliate": [
    { src: "/ugc-affiliate/redpandacompress_00%20Efpy%20UGC%20Product%20Promo%20Video.mp4",       type: "video" },
    { src: "/ugc-affiliate/redpandacompress_Generic%20UGC%20Product%20Promo%20Video.mp4",         type: "video" },
    { src: "/ugc-affiliate/redpandacompress_Maybelline%20Localisation%20Example%20Video.mp4",     type: "video" },
    { src: "/ugc-affiliate/redpandacompress_UGC-Initial%20version%20(1).mp4",                     type: "video" },
  ],
  "tvc-animatics": [
    { src: "/tvc-animatics/redpandacompress_260127%20Sentuhan%20Akhir%20Stella%20-%2015s%20-%20Reed%20Diffuser.mp4", type: "video" },
    { src: "/tvc-animatics/redpandacompress_Godrej%20HIT%20GK%20Xpress%20-%20Live%20Action%20TVC%20-%20v1.mp4",     type: "video" },
    { src: "/tvc-animatics/redpandacompress_Godrej%20Mitu%20Baby%20Ad%20Testing%20Video%20v1.mp4",                  type: "video" },
    { src: "/tvc-animatics/redpandacompress_Godrej%20NYU%20Trial%20Video%20v1.mp4",                                 type: "video" },
    { src: "/tvc-animatics/redpandacompress_Godrej_CapGajah_Animated%20Video.mp4",                                  type: "video" },
    { src: "/tvc-animatics/redpandacompress_Product%20Video%20-%20Stella%20Matic%2015s%20Horizontal%20(1).mp4",     type: "video" },
    { src: "/tvc-animatics/redpandacompress_Richeese%20ASMR%20Short%20Video%20(1).mp4",                             type: "video" },
  ],
};

export function getMediaForFolder(folder: string): MediaItem[] {
  return MANIFEST[folder] ?? [];
}
