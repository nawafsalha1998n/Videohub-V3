import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Initialize player
    playerRef.current = videojs(videoElement, {
      controls: true,
      fluid: true,
      responsive: true,
      preload: 'auto',
      sources: [{ src, type: 'video/mp4' }],
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" poster={poster} />
    </div>
  );
}
