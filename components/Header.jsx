import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useTranslation } from './I18nProvider';
import { useRouter } from 'next/router';

const Header = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locales = router?.locales || ['en','ar','fa','es','fr','de'];

  return (
    <header className={styles.header}>
      <Link href="/" legacyBehavior>
        <a className={styles.logoContainer}>
          <Image src="/logo.PNG" alt={t('logoAlt')} width={160} height={40} className={styles.logoImage} />
        </a>
      </Link>

      <nav className={styles.rightNav}>
        <div className={styles.langSwitcher}>
          {locales.map((l) => (
            <Link key={l} href={router.asPath} locale={l} legacyBehavior>
              <a className={styles.langLink}>{l.toUpperCase()}</a>
            </Link>
          ))}
        </div>

        <Link href="/upload" legacyBehavior>
          <a className={styles.uploadButton}>{t('uploadVideo')}</a>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
