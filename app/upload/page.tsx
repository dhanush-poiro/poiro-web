import BriefCTASection from '@/components/BriefCTASection';
import Link from 'next/link';
import Image from 'next/image';

export default function UploadPage() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>
      {/* Back nav */}
      <div style={{
        position: 'fixed',
        top: 28,
        left: 'clamp(16px, 4vw, 48px)',
        zIndex: 9999,
      }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 8,
          background: 'rgba(25,25,30,0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.72)',
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
        }}>
          <Image src="/assets/logo.png" alt="Poiro" width={60} height={20} style={{ height: 16, width: 'auto' }} />
        </Link>
      </div>

      <BriefCTASection />
    </main>
  );
}
