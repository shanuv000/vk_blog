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
          <title>Only Blog</title>
          <link
            rel="icon"
            href="https://firebasestorage.googleapis.com/v0/b/shanu-chess.appspot.com/o/logo%2Fblog-logo%2Fmain-logo-transparent.png?alt=media&token=94294bb8-3404-44ce-81ab-b2f36ae1988e"
          />

          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
          </Script>
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
  title: "News",
  keywords: "news",
  description:
    "Get latest news about celebrity, marvel characters and what is happenong arond the world",
};
export default MyDocument;
