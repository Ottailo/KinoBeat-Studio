import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KinoBeat Studio - Autonomous Generative AI Video & Infinite Canvas',
  description: 'Open-source, local-first Generative AI Video & Infinite Canvas Studio uniting multi-model orchestration, cinematic camera math, and Remotion audio-reactive timelines.',
  keywords: [
    'Generative AI Video',
    'Remotion',
    'React Flow',
    'Infinite Canvas',
    'Higgsfield',
    'Flux Video',
    'Kling AI',
    'Audio Reactive Timeline',
  ],
  authors: [{ name: 'Ottailo' }],
  openGraph: {
    title: 'KinoBeat Studio - Autonomous Generative AI Video & Infinite Canvas',
    description: 'Local-first AI video studio with camera motion math and audio-reactive kinetic timelines.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090a0f] text-slate-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
