import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { FC, ReactNode } from 'react';
import { BOT_API_URL, botApi } from '../services/botApi';

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  requester?: string;
  avatarSeed?: number;
  thumbnail?: string | null;
  url?: string | null;
}

// Memory cache for music artwork to prevent repeated network queries
const artworkCache = new Map<string, { artwork: string; artist?: string }>();

export async function fetchMusicArtwork(title: string, artist?: string): Promise<{ artwork: string; artist?: string } | null> {
  const query = `${title} ${artist && artist !== 'Unknown Artist' && artist !== 'YouTube' && artist !== 'SoundCloud' ? artist : ''}`.trim();
  if (artworkCache.has(query)) {
    return artworkCache.get(query)!;
  }
  
  try {
    const cleanTerm = title
      .replace(/\(.*?\)|\[.*?\]|\b(official|video|audio|lyrics|radio|sc)\b/gi, '')
      .replace(/[|]/g, ' ')
      .trim();
    if (!cleanTerm) return null;
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTerm)}&entity=song&limit=1`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const artwork = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null;
        if (artwork) {
          const result = { artwork, artist: item.artistName };
          artworkCache.set(query, result);
          return result;
        }
      }
    }
  } catch (_) {}
  return null;
}

export function cleanSongMetadata(raw: any): Song {
  if (!raw) {
    return {
      id: `def_${Date.now()}`,
      title: 'Siaran Radio Live',
      artist: 'WABOT 2.0 Streaming Engine',
      duration: 'LIVE',
      requester: 'Auto DJ'
    };
  }

  let title = (raw.title || 'Live Stream Track').trim();
  let artist = (raw.artist || 'Unknown Artist').trim();
  let thumbnail = raw.thumbnail || raw.coverUrl || null;
  const url = raw.url || null;

  // 1. YouTube ID thumbnail extraction
  if (!thumbnail && url) {
    const ytMatch = url.match(/(?:watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      thumbnail = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
  }

  // 2. High-res SoundCloud artwork upgrade
  if (thumbnail && thumbnail.includes('-large.')) {
    thumbnail = thumbnail.replace('-large.', '-t500x500.');
  }

  // 3. Smart title & artist parser if artist is Unknown
  if ((!artist || artist === 'Unknown Artist' || artist === 'Unknown' || artist === 'YouTube' || artist === 'SoundCloud') && title) {
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    } else if (title.includes(' | ')) {
      const parts = title.split(' | ');
      title = parts[0].trim();
      artist = parts[1].trim();
    }
  }

  // 4. Format duration
  let durationStr = 'LIVE';
  if (raw.durationFormatted) {
    durationStr = raw.durationFormatted;
  } else if (typeof raw.duration === 'number') {
    const m = Math.floor(raw.duration / 60);
    const s = String(raw.duration % 60).padStart(2, '0');
    durationStr = `${m}:${s}`;
  } else if (typeof raw.duration === 'string') {
    durationStr = raw.duration;
  }

  // 5. Clean & format requester
  let requester = raw.requestedBy || raw.requester || raw.who || 'Auto DJ';
  if (typeof requester === 'string') {
    if (requester.includes('@s.whatsapp.net')) {
      const num = requester.replace('@s.whatsapp.net', '');
      requester = num.length > 8 ? `+${num.slice(0, 3)} ${num.slice(3, 6)}-****-${num.slice(-3)}` : num;
    } else if (/^\d{10,15}$/.test(requester)) {
      requester = `+${requester.slice(0, 3)} ${requester.slice(3, 6)}-****-${requester.slice(-3)}`;
    }
  }

  return {
    id: raw.id || `song_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    artist,
    duration: durationStr,
    requester,
    thumbnail,
    url
  };
}

export interface RadioState {
  currentSong: Song | null;
  isPlaying: boolean;
  isStreamIdle: boolean;
  volume: number;
  listeners: number;
  isLiveConnected: boolean;
  queue: Song[];
  history: Song[];
  togglePlay: () => void;
  setVolume: (v: number) => void;
  requestSong: (query: string) => Promise<{ success: boolean; message: string }>;
  getAudioData: () => Uint8Array | null;
}

const RadioContext = createContext<RadioState | null>(null);

const DEFAULT_CURRENT: Song = {
  id: 'live_0',
  title: 'Siaran Radio Live',
  artist: 'WABOT 2.0 Streaming Engine',
  duration: 'LIVE',
  requester: 'Bot Auto-DJ',
  avatarSeed: 1
};

export const RadioProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStreamIdle, setIsStreamIdle] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [listeners, setListeners] = useState(1);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persistent user listening intent ref for seamless auto-reconnect across queue idle/restart
  const isListeningSessionActive = useRef(false);

  // Web Audio API refs for real-time frequency analysis & beat sync
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [currentSong, setCurrentSong] = useState<Song | null>(DEFAULT_CURRENT);
  const [queue, setQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);

  const updateSongWithArtwork = (song: Song) => {
    setCurrentSong(song);
    if (!song.thumbnail && song.title) {
      fetchMusicArtwork(song.title, song.artist).then((res) => {
        if (res?.artwork) {
          setCurrentSong((prev) => {
            if (prev && prev.id === song.id) {
              return {
                ...prev,
                thumbnail: res.artwork,
                artist: (prev.artist === 'Unknown Artist' || prev.artist === 'Unknown' || prev.artist === 'SoundCloud' || prev.artist === 'YouTube') && res.artist ? res.artist : prev.artist
              };
            }
            return prev;
          });
        }
      });
    }
  };

  const initAudioNodes = () => {
    if (!audioRef.current) return;
    if (audioCtxRef.current) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins
      analyser.smoothingTimeConstant = 0.78;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
    } catch (e) {
      console.warn('[RadioContext] AudioContext initialization skipped:', e);
    }
  };

  const getAudioData = (): Uint8Array | null => {
    if (!analyserRef.current || !isPlaying || isStreamIdle) return null;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data;
  };

  const reconnectLiveAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    initAudioNodes();

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    const streamUrl = `${BOT_API_URL || ''}/stream?t=${Date.now()}`;
    audioRef.current.src = streamUrl;
    audioRef.current.volume = volume;

    audioRef.current.onended = () => {
      if (isListeningSessionActive.current) {
        setIsStreamIdle(true);
      }
    };

    audioRef.current.onerror = (e) => {
      console.warn('[RadioStream] Stream interrupted/waiting:', e);
      if (isListeningSessionActive.current) {
        setIsStreamIdle(true);
      } else {
        setIsPlaying(false);
      }
    };

    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setIsStreamIdle(false);
    }).catch((err) => {
      console.warn('[RadioAutoReconnect] Audio play error:', err);
    });
  };

  // Periodically fetch live status & queue from VPS bot
  useEffect(() => {
    let mounted = true;

    async function fetchRadioState() {
      try {
        const [status, liveQueue] = await Promise.all([
          botApi.getStatus(),
          botApi.getLiveQueue()
        ]);

        if (mounted) {
          if (status) {
            setIsLiveConnected(true);
            setListeners(status.listeners || status.metrics?.connectedUsers || 1);
            if (status.nowPlaying) {
              const cleaned = cleanSongMetadata(status.nowPlaying);
              updateSongWithArtwork(cleaned);

              // Auto-resume if user wants to be listening but stream was idle or stopped
              if (isListeningSessionActive.current && (!isPlaying || isStreamIdle || audioRef.current?.paused || audioRef.current?.ended)) {
                reconnectLiveAudio();
              }
            } else {
              if (isListeningSessionActive.current) {
                setIsStreamIdle(true);
              }
            }

            if (Array.isArray(status.history) && status.history.length > 0) {
              setHistory(status.history.map((h: any) => cleanSongMetadata(h)));
            }
          }

          if (Array.isArray(liveQueue) && liveQueue.length > 0) {
            setQueue(liveQueue.map((item: any) => cleanSongMetadata(item)));
          } else if (Array.isArray(status?.queue)) {
            setQueue(status.queue.map((item: any) => cleanSongMetadata(item)));
          }
        }
      } catch (err) {
        if (mounted) setIsLiveConnected(false);
      }
    }

    fetchRadioState();
    const interval = setInterval(fetchRadioState, 3500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isPlaying, isStreamIdle]);

  // Connect to Live SSE stream from bot backend with named events support
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource(`${BOT_API_URL}/events`);
      
      evtSource.onopen = () => {
        setIsLiveConnected(true);
      };

      // 1. track:start named event — fires the millisecond a new song starts playing on VPS
      const onTrackStart = (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data);
          const trackData = d.data || d;
          const cleaned = cleanSongMetadata(trackData);
          updateSongWithArtwork(cleaned);
          setIsStreamIdle(false);

          // Instant auto-reconnect without delay!
          if (isListeningSessionActive.current) {
            console.log('[RadioSSE] track:start received, auto-resuming playback instantly');
            reconnectLiveAudio();
          }
        } catch (_) {}
      };
      evtSource.addEventListener('track:start', onTrackStart);

      // 2. radio:idle named event — queue finished, radio idle
      const onRadioIdle = () => {
        console.log('[RadioSSE] radio:idle received, entering standby auto-reconnect state');
        setIsStreamIdle(true);
      };
      evtSource.addEventListener('radio:idle', onRadioIdle);

      // 3. queue:update named event
      const onQueueUpdate = (e: MessageEvent) => {
        try {
          const q = JSON.parse(e.data);
          if (Array.isArray(q)) {
            setQueue(q.map((item: any) => cleanSongMetadata(item)));
          }
        } catch (_) {}
      };
      evtSource.addEventListener('queue:update', onQueueUpdate);

      // 4. listeners:update named event
      const onListenersUpdate = (e: MessageEvent) => {
        try {
          const l = JSON.parse(e.data);
          setListeners(l.count || l || 1);
        } catch (_) {}
      };
      evtSource.addEventListener('listeners:update', onListenersUpdate);

      // 5. standard message fallback
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'now_playing' && data.payload) {
            const cleaned = cleanSongMetadata(data.payload);
            updateSongWithArtwork(cleaned);
            if (isListeningSessionActive.current) {
              reconnectLiveAudio();
            }
          }
          if (data.type === 'listeners') {
            setListeners(data.payload || 1);
          }
          if (data.type === 'queue_update' && Array.isArray(data.payload)) {
            setQueue(data.payload.map((q: any) => cleanSongMetadata(q)));
          }
        } catch (_) {}
      };
    } catch {
      setIsLiveConnected(false);
    }

    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying || isListeningSessionActive.current) {
      isListeningSessionActive.current = false;
      setIsStreamIdle(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      setIsPlaying(false);
    } else {
      isListeningSessionActive.current = true;
      setIsStreamIdle(false);
      reconnectLiveAudio();
    }
  };

  const handleSetVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const requestSong = async (query: string): Promise<{ success: boolean; message: string }> => {
    if (!query.trim()) return { success: false, message: 'Judul lagu tidak boleh kosong.' };
    const res = await botApi.requestSong(query);
    const newTrack: Song = {
      id: `req_${Date.now()}`,
      title: query,
      artist: 'Requested Track',
      duration: '03:45',
      requester: 'Web Guest'
    };
    setQueue((prev) => [...prev, newTrack]);
    return res;
  };

  return (
    <RadioContext.Provider
      value={{
        currentSong,
        isPlaying,
        isStreamIdle,
        volume,
        listeners,
        isLiveConnected,
        queue,
        history,
        togglePlay,
        setVolume: handleSetVolume,
        requestSong,
        getAudioData
      }}
    >
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
};
