import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head> <title>{"key2success"}</title>
        <link rel="icon" href="/logo10.svg" />
    {/* google adsense */}
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" />
    <script dangerouslySetInnerHTML={{
        __html: `
        (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-5634941748977646",
            enable_page_level_ads: true
            });
            `,
            }} />
</Head> <body>
          <Main />
          <NextScript />
        </body>
        </Html>
      
    )
  }
}

export default MyDocument