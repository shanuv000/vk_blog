import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {" "}
          <title>{"key2success"}</title>
          <link rel="icon" href="/logo10.svg" />
          {/* google adsense */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
        (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-5634941748977646",
            enable_page_level_ads: true
            });
            `,
            }}
          />
          {/* Other google verification */}
          <meta
            name="google-site-verification"
            content="OtU3I9K9VQouEQU7IVbz1zVxsnFktZDt2dn2FSwWqZA"
          />
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "7170f247a2af4a0e82ca4cb11d29dbb9"}'
          ></script>
          {/* <!-- End Cloudflare Web Analytics --> */}
          {/* Other google verification */}
          {/* facebook follow button */}
          {/* <script
            type="text/javascript"
            src="https://platform-api.sharethis.com/js/sharethis.js#property=61f871a15f957c0019a78a1f&product=inline-follow-buttons"
            async="async"
          ></script> */}
          {/* facebook follow button */}
        </Head>{" "}
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
