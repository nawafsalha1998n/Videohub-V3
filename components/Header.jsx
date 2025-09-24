import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" legacyBehavior>
        <a className={styles.logoContainer}>
          <Image src="/logo.png" alt="Videohub Logo" width={50} height={50} />
          <span className={styles.logoText}>Videohub</span>
        </a>
      </Link>
      <Link href="/upload" legacyBehavior>
        <a className={styles.uploadButton}>
          Upload Video
        </a>
      </Link>
    </header>
  );
};

export default Header;
