import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';

const password = 'dz12';

export default function UploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (inputPassword === password) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Wrong password');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a video file first.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading...');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Use NEXT_PUBLIC_ env vars for client-side access
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
      formData.append('resource_type', 'video');

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
        xhr.open('POST', url);

        xhr.upload.onprogress = function (evt) {
          if (evt.lengthComputable) {
            const percentComplete = Math.round((evt.loaded / evt.total) * 100);
            setProgress(percentComplete);
          }
        };

        xhr.onload = async function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              // insert metadata into DB using serverless API route
              const res = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, publicId: data.public_id }),
              });

              if (!res.ok) {
                const err = await res.json();
                reject(new Error(err?.error || 'Database insertion failed'));
                return;
              }

              resolve();
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error('Cloudinary upload failed: ' + xhr.statusText));
          }
        };

        xhr.onerror = function () {
          reject(new Error('Network error during upload'));
        };

        xhr.send(formData);
      });

      setMessage('Video uploaded successfully!');
      setFile(null);
      setTitle('');
      setProgress(0);
    } catch (err) {
      setMessage('Upload error: ' + (err.message || String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Upload - VideoHub</title>
        </Head>
        <main className={styles.main}>
          <h2>Please enter the password to access the upload page.</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Password"
              className={styles.input}
            />
            <button type="submit" className={styles.uploadButton}>
              Enter
            </button>
          </form>
          {message && <p style={{ color: 'red' }}>{message}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Upload - VideoHub</title>
      </Head>
      <main className={styles.main}>
        <Header />
        <h1>Upload</h1>
        <form onSubmit={handleUpload}>
          <label>Title</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
          />
          <label>Video file</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 12, background: '#eee', borderRadius: 6 }}>
              <div
                style={{
                  height: 12,
                  width: `${progress}%`,
                  transition: 'width 200ms linear',
                }}
              />
            </div>
            <small>{progress}%</small>
          </div>

          <button type="submit" className={styles.uploadButton} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {message && <p style={{ color: isUploading ? 'white' : 'red' }}>{message}</p>}
      </main>
    </div>
  );
}
