import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ScrollCardSplitSection from "@/components/ScrollCardSplitSection";
import StorytellingSection from "@/components/StorytellingSection";
import LayerByLayer from "@/components/LayerByLayer";
import OperatingSystemSection from "@/components/OperatingSystemSection";
import WhyPoiroscopeSection from "@/components/WhyPoiroscopeSection";
import GetStartedSection from "@/components/GetStartedSection";
import MasonryGallerySection from "@/components/MasonryGallerySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Sticky so Hero stays pinned while About card slides over it */}
      <div style={{ position: 'sticky', top: 0, height: '100dvh', zIndex: 0, overflow: 'hidden' }}>
        <Hero />
      </div>
      <AboutSection />
      <ScrollCardSplitSection />
      <StorytellingSection />
      <LayerByLayer />
      <OperatingSystemSection />
      <WhyPoiroscopeSection />
      <GetStartedSection />
      <MasonryGallerySection />
      <Footer />
    </>
  );
}
