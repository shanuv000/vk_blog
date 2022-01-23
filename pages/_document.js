import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx, post) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* <Seo post={post} /> */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          {/* twitter */}
          {/* Twitter */} <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@shanuv00000" />
          <meta name="twitter:creator" content="@shanuv0000" />
          <meta property="og:url" content="https://www.keytosuccess.me/" />
          <meta property="og:title" content={"Hello Dear"} />
          <meta
            property="og:description"
            content={"Hi I am Vaibhav. How are you."}
          />
          <meta
            property="og:image"
            content={"https://media.graphcms.com/THBI3lFRTGyS8byEd5n4"}
          />
          {/* twitter */}
          <title>VK BLOG</title>
          <link rel="icon" href="/dear.png" />
          <meta
            name="viewport"
            content="width=device-width,minimum-scale=1, initial-scale=1"
          />
        </Head>
        ;<Head></Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
