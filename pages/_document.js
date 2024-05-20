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
          <link
            rel="icon"
            href="https://firebasestorage.googleapis.com/v0/b/shanu-chess.appspot.com/o/logo%2Fblog-logo%2Fmain-logo-transparent.png?alt=media&token=94294bb8-3404-44ce-81ab-b2f36ae1988e"
          />

          {/* Ensure scripts are added correctly */}
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
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// Move default title to layout.js or page.js
// This allows dynamic title updates
MyDocument.defaultProps = {
  // title: "News", // Remove this from defaultProps
  keywords: "news",
  description:
    "Get latest news about celebrity, marvel characters and what is happening arond the world",
};

export default MyDocument;
