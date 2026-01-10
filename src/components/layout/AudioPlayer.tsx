import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

// Using a reliable free jazz loop from Internet Archive
const MUSIC_URL = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dee_Yan-Key/lullabies/Dee_Yan-Key_-_06_-_Lullaby.mp3';

export const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume / 100;
    audio.preload = 'auto';
    
    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
      setHasError(false);
    });
    
    audio.addEventListener('error', () => {
      console.error('Audio failed to load');
      setHasError(true);
      setIsLoaded(false);
    });

    audio.src = MUSIC_URL;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setHasError(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-lg">♪</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Evening Jazz Vibes
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {hasError ? 'Audio unavailable' : isLoaded ? 'Ready to play' : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Play/Pause Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              disabled={hasError || !isLoaded}
              className="h-10 w-10 rounded-full border-primary/50 hover:bg-primary/20 hover:border-primary disabled:opacity-50"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-primary" />
              ) : (
                <Play className="h-4 w-4 text-primary ml-0.5" />
              )}
            </Button>

            {/* Volume Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 hover:bg-primary/10"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-foreground" />
                )}
              </Button>
              <div className="hidden sm:block w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
