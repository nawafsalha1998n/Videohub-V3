import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Header from '../components/Header';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }
      if (mounted) setVideos(data || []);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleVideoClick = (video) => setActiveVideo(video);
  const closeVideoModal = () => setActiveVideo(null);

  return (
    <div className={styles.container}>
      <Head>
        <title>VideoHub - Your Video Gallery</title>
        <meta name="description" content="A modern video sharing site" />
      </Head>
      <main className={styles.main}>
        <Header />
        <h1>Latest Videos</h1>
        <div className={styles.grid}>
          {videos.map((video) => (
            <div key={video.id} className={styles.card} onClick={() => handleVideoClick(video)}>
              <h2 className={styles.videoTitle}>{video.title ?? 'Untitled'}</h2>
              <video width="100%" height="auto" controls>
                <source
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best/${video.public_id}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>

        {activeVideo && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button onClick={closeVideoModal} style={{ float: 'right' }}>
                &times;
              </button>
              <h2>{activeVideo.title}</h2>
              <video controls width="100%">
                <source
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best/${activeVideo.public_id}`}
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
