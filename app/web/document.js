// This is a custom Next.js Document component for proper font loading
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Load Ionicons font directly in the document head */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Ionicons';
              src: url(/_next/static/media/Ionicons.ttf) format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 