import { useState } from 'react';
import Head from 'next/head';
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
      setMessage('Incorrect password. Please try again.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage('Please select a file and enter a title.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_cloudinary_upload_preset'); // Change this to your Cloudinary upload preset
    formData.append('resource_type', 'video');
    
    // Custom logic to handle upload to Cloudinary and insert to Supabase
    // This part requires a serverless function or backend API
    // The current code is for demonstration, and you'll need a full backend
    // to handle this process securely.

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Cloudinary upload failed.');
      }

      const data = await response.json();
      
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          publicId: data.public_id,
        }),
      });

      if (res.ok) {
        setMessage('Video uploaded successfully!');
        setFile(null);
        setTitle('');
        setProgress(0);
      } else {
        throw new Error('Database insertion failed.');
      }
      
    } catch (error) {
      setMessage(`Upload error: ${error.message}`);
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
              placeholder="Enter password"
              style={{ padding: '10px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button
              type="submit"
              className={styles.uploadButton}
            >
              Submit
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
      <Header />

      <main className={styles.main}>
        <h1>Upload a Video</h1>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setProgress(0);
            }}
            style={{ color: 'white' }}
          />
          {isUploading && (
            <div style={{ width: '100%', backgroundColor: '#555', borderRadius: '5px' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '20px',
                  backgroundColor: '#ff4500',
                  borderRadius: '5px',
                  transition: 'width 0.3s ease-in-out'
                }}
              ></div>
            </div>
          )}
          <button
            type="submit"
            className={styles.uploadButton}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {message && <p style={{ color: isUploading ? 'white' : 'red' }}>{message}</p>}
      </main>
    </div>
  );
}
