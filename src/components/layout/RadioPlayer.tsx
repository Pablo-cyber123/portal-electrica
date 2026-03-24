"use client"

import { useState, useRef, useEffect } from 'react';
import { Play, Square, Volume2, VolumeX, Radio } from 'lucide-react';

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Directly hitting the Radio Garden stream API for this specific channel
  const streamUrl = "https://radio.garden/api/ara/content/listen/jodjwTO2/channel.mp3";

  useEffect(() => {
    // Only initialize audio when needed
    if (isPlaying && !audioRef.current) {
      const audio = new Audio(streamUrl);
      audio.volume = volume;
      audio.muted = isMuted;
      
      audio.addEventListener('waiting', () => setIsLoading(true));
      audio.addEventListener('playing', () => setIsLoading(false));
      
      audioRef.current = audio;
      audio.play().catch(e => {
        console.error("Error playing audio:", e);
        setIsPlaying(false);
      });
    } else if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
    
    return () => {
      // Don't fully destroy on unmount to keep playing across fast navigation, 
      // but typically we'd clean up if this was a strict single-page component.
    };
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-oxfordGrey-900 border border-oxfordGrey-700/50 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-sm w-full relative overflow-hidden group">
      {/* Animated background glow when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-utsGreen-500/10 blur-xl rounded-2xl animate-pulse pointer-events-none" />
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <button 
            onClick={togglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
              isPlaying 
                ? 'bg-utsGreen-600 hover:bg-utsGreen-500' 
                : 'bg-utsGreen-500 hover:bg-utsGreen-400'
            }`}
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>
          
          {/* Animated concentric rings when playing */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-full border border-utsGreen-400 animate-ping opacity-20 pointer-events-none" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Radio className={`w-4 h-4 ${isPlaying ? 'text-utsGreen-400 animate-pulse' : 'text-oxfordGrey-400'}`} />
            <h4 className="font-bold text-white text-sm">Tu Radio UTS</h4>
          </div>
          <p className="text-xs text-oxfordGrey-400 line-clamp-1">
            {isPlaying ? 'Transmitiendo en vivo...' : 'Emisora institucional'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10 px-1">
        <button onClick={toggleMute} className="text-oxfordGrey-400 hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="flex-1 h-1.5 bg-oxfordGrey-700 rounded-lg appearance-none cursor-pointer accent-utsGreen-500 hover:accent-utsGreen-400"
        />
      </div>
      
      {/* Floating mini icon representing radio garden */}
      <a 
        href="https://radio.garden/listen/tu-radio-uts/jodjwTO2?hl=es" 
        target="_blank" 
        rel="noreferrer"
        className="absolute bottom-3 right-3 text-[10px] text-oxfordGrey-500 hover:text-utsGreen-400 transition-colors flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full"
        title="Abrir en Radio Garden"
      >
        Radio Garden
      </a>
    </div>
  );
}
