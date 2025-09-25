import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import dynamic from 'next/dynamic';
import { useTranslation } from '../components/I18nProvider';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const VideoPlayer = dynamic(() => import('../components/VideoPlayer'), { ssr: false });

export default function Home() {
  const { t } = useTranslation();
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
        console.error('Supabase fetch error:', error);
        return;
      }
      if (mounted) setVideos(data || []);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleVideoClick = (video) => setActiveVideo(video);
  const closeVideoModal = () => setActiveVideo(null);

  const getThumbnail = (video) => `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto:best/${video.public_id}.jpg`;
  const getVideoSrc = (video) => `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best/${video.public_id}`;

  return (
    <div className={styles.container}>
      <Head>
        <title>VideoHub - Your Video Gallery</title>
        <meta name="description" content="A modern video sharing site" />
      </Head>
      <main className={styles.main}>
        <Header />
        <h1>{t('latestVideos')}</h1>

        <div className={styles.grid}>
          {videos.map((video) => (
            <div key={video.id} className={styles.card} onClick={() => handleVideoClick(video)}>
              <h2 className={styles.videoTitle}>{video.title ?? t('untitled')}</h2>
              <div className={styles.thumbWrap}>
                <Image src={getThumbnail(video)} alt={video.title ?? t('untitled')} width={320} height={180} className={styles.thumbnail} />
              </div>
            </div>
          ))}
        </div>

        {activeVideo && (
          <div className={styles.modal} onClick={closeVideoModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button onClick={closeVideoModal} className={styles.closeBtn}>×</button>
              <h2>{activeVideo.title ?? t('untitled')}</h2>
              <VideoPlayer src={getVideoSrc(activeVideo)} poster={getThumbnail(activeVideo)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
