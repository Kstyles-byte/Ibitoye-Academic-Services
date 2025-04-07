import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Load global CSS */}
        <link rel="stylesheet" href="/app/web/fonts.css" />
        
        {/* Inline font styles to ensure they load even if CSS files are blocked */}
        <style dangerouslySetInnerHTML={{ 
          __html: `
            @font-face {
              font-family: 'Ionicons';
              src: url('/static/media/Ionicons.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
          ` 
        }} />
        
        {/* Preload the font file */}
        <link 
          rel="preload" 
          href="/static/media/Ionicons.ttf" 
          as="font" 
          type="font/ttf" 
          crossOrigin="anonymous" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 