import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import Header from '../components/Header';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getStaticProps() {
  const { data: videos, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return { props: { videos: [] } };
  }

  return {
    props: { videos },
    revalidate: 60, // Re-generate page every 60 seconds
  };
}

export default function Home({ videos }) {
  const [activeVideo, setActiveVideo] = useState(null);

  const handleVideoClick = (video) => {
    setActiveVideo(video);
  };

  const closeVideoModal = () => {
    setActiveVideo(null);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>VideoHub - Your Videos</title>
        <meta name="description" content="A modern video platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1>Latest Videos</h1>
        <div className={styles.grid}>
          {videos.map((video) => (
            <div key={video.id} className={styles.card} onClick={() => handleVideoClick(video)}>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <Image
                  src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/c_fill,g_auto,w_500,h_280/e_colorize:100,co_rgb:000000/v${video.public_id.replace(/\.[^/.]+$/, "")}.jpg`}
                  alt={video.title}
                  layout="fill"
                  objectFit="cover"
                  unoptimized={true}
                />
              </div>
              <h2 className={styles.videoTitle}>{video.title}</h2>
            </div>
          ))}
        </div>
      </main>

      {activeVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }} onClick={closeVideoModal}>
          <div style={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <video controls width="100%" height="auto" key={activeVideo.id}>
              <source src={`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/fl_progressive:steep,q_auto:best/${activeVideo.public_id}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <h3 style={{ color: 'white', textAlign: 'center', marginTop: '10px' }}>{activeVideo.title}</h3>
            <button
              onClick={closeVideoModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                color: 'white',
                cursor: 'pointer'
              }}
            >&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}
