import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import { useTranslation } from '../components/I18nProvider';

const password = 'dz12';

export default function UploadPage() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  // The original upload logic relies on Cloudinary and the existing API route /api/videos.
  // We keep the same behavior: when a file is selected and form submitted, it uploads to Cloudinary (client-side)
  // and then calls /api/videos to insert a record in Supabase (server-side). This file preserves that logic.

  const handlePassword = (e) => {
    e.preventDefault();
    if (inputPassword === password) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Wrong password');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('No file selected');
    try {
      setIsUploading(true);
      setMessage('');
      setProgress(0);

      // Use existing Cloudinary unsigned upload preset from env (kept by original project)
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '');
      formData.append('context', `title=${title}`);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const p = Math.round((event.loaded / event.total) * 100);
          setProgress(p);
        }
      };
      xhr.onload = async () => {
        if (xhr.status === 200) {
          const resp = JSON.parse(xhr.responseText);
          // call server-side API to insert into Supabase
          await fetch('/api/videos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, publicId: resp.public_id }),
          });
          setMessage(t('uploadSuccess'));
        } else {
          setMessage(t('uploadError'));
        }
        setIsUploading(false);
      };
      xhr.onerror = () => {
        setMessage(t('uploadError'));
        setIsUploading(false);
      };
      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setMessage(t('uploadError'));
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Head><title>{t('uploadVideo')}</title></Head>
        <main className={styles.main}>
          <Header />
          <h1>{t('uploadVideo')}</h1>
          <form onSubmit={handlePassword} className={styles.form}>
            <label>Password:</label>
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} />
            <button type="submit">Enter</button>
            {message && <p style={{ color: 'red' }}>{message}</p>}
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head><title>{t('uploadVideo')}</title></Head>
      <main className={styles.main}>
        <Header />
        <h1>{t('uploadVideo')}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{t('title')}:</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>{t('chooseFile')}:</label>
            <input type="file" onChange={handleFileChange} accept="video/*" />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{ width: progress + '%' }}></div>
            </div>
            <small>{progress}%</small>
          </div>

          <button type="submit" className={styles.uploadButton} disabled={isUploading}>
            {isUploading ? t('uploading') : t('upload')}
          </button>
          {message && <p style={{ color: isUploading ? 'white' : 'red' }}>{message}</p>}
        </form>
      </main>
    </div>
  );
}
