import '../styles/globals.css';
import 'video.js/dist/video-js.css';
import { I18nProvider } from '../components/I18nProvider';

export default function App({ Component, pageProps, router }) {
  return (
    <I18nProvider initialLocale={router?.defaultLocale ?? 'en'}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
