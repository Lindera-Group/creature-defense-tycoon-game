interface WaveAnnouncementProps {
  text: string;
}

export function WaveAnnouncement({ text }: WaveAnnouncementProps) {
  if (!text) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className="text-white text-5xl font-bold drop-shadow-lg animate-pulse">
        {text}
      </div>
    </div>
  );
}
