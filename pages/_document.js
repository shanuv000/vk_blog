import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon - consolidated for better performance */}
          <link
            rel="icon"
            type="image/x-icon"
            href="/iconified/logo4.ico"
            sizes="any"
          />
          <link rel="apple-touch-icon" href="/iconified/logo4.ico" />

          {/* Removed PWA manifest for better performance */}
          <meta name="theme-color" content="#FF4500" />

          {/* Critical resource preconnections for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />

          {/* Google Fonts - Optimized loading with preload for critical font */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            as="style"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
            media="print"
            onLoad="this.media='all'"
          />
          <noscript>
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
              rel="stylesheet"
            />
          </noscript>

          <link rel="preconnect" href="https://ap-south-1.cdn.hygraph.com" />
          <link rel="preconnect" href="https://media.graphassets.com" />

          {/* DNS prefetch for analytics and ads (lower priority) */}
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.clarity.ms" />
          <link rel="dns-prefetch" href="https://pl28428839.effectivegatecpm.com" />
          <link rel="dns-prefetch" href="https://openairtowhardworking.com" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.defaultProps = {
  keywords: "news",
  description:
    "Get latest news about celebrity, marvel characters and what is happening arond the world",
};

export default MyDocument;
