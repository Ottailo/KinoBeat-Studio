import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KinoBeat Studio // Autonomous Generative AI Video & Audio-Reactive NLE',
  description: 'Industrial-grade generative AI video workstation uniting 6-DOF cinema camera kinematics, multi-model DiT orchestration, and Remotion audio-reactive NLE timeline.',
  keywords: [
    'Generative AI Video',
    'NLE Video Editor',
    'Remotion',
    'React Flow',
    'Infinite Canvas',
    'Wan 2.1',
    'Flux Video',
    'Kling AI',
    'Camera Kinematics',
    'Audio-Reactive Timeline',
  ],
  authors: [{ name: 'Ottailo' }],
  openGraph: {
    title: 'KinoBeat Studio // Autonomous Generative AI Video Workstation',
    description: 'Local-first generative video workstation with 6-DOF cinema camera math and audio-reactive NLE editing.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#121317] text-[#FFFFFF] overflow-hidden selection:bg-[#FF5500]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
