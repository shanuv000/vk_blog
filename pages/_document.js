import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* Favicon */}
          <link
            rel="shortcut icon"
            href="/iconified/logo4.ico"
            type="image/x-icon"
          />
          <link rel="apple-touch-icon" href="/iconified/logo4.ico" />
          <link rel="icon" type="image/x-icon" href="/iconified/logo4.ico" />

          {/* Web App Manifest */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#FF4500" />

          {/* Google Analytics script */}
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <Script
            id="google-analytics"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
              `,
            }}
          />

          {/* Microsoft Clarity script */}
          <Script
            id="clarity-script"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "o2yidwokf0");
              `,
            }}
          />
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
