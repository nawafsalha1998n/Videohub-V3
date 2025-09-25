import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" legacyBehavior>
        <a className={styles.logoContainer}>
          <Image src="/logo.PNG" alt="Videohub Logo" width={64} height={64} className={styles.logoImage} />
        </a>
      </Link>
      <Link href="/upload" legacyBehavior>
        <a className={styles.uploadButton}>
          تحميل فيديو
        </a>
      </Link>
    </header>
  );
};

export default Header;
