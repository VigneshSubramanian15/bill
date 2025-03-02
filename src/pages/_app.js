import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return <>
    <Head>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#00A63E" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Component {...pageProps} />;
  </>

}
