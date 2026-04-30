import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ScrollCardSplitSection from "@/components/ScrollCardSplitSection";
import StorytellingSection from "@/components/StorytellingSection";
import LayerByLayer from "@/components/LayerByLayer";
import OperatingSystemSection from "@/components/OperatingSystemSection";
import VideoScrub from "@/components/VideoScrub";
import MasonryGallerySection from "@/components/MasonryGallerySection";
import BriefCTASection from "@/components/BriefCTASection";
import Footer from "@/components/Footer";

// Toggle to show/hide the "Here's what happens to your brief" section
const SHOW_BRIEF_SECTION = false;

export default function Home() {
  return (
    <>
      {/* Sticky so Hero stays pinned while About card slides over it */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 0, overflow: 'hidden' }}>
        <Hero />
      </div>
      <AboutSection />
      <ScrollCardSplitSection />
      <StorytellingSection />
      <LayerByLayer />
      <OperatingSystemSection />
      {SHOW_BRIEF_SECTION && <VideoScrub />}
      <MasonryGallerySection />
      <BriefCTASection />
      <Footer />
    </>
  );
}
