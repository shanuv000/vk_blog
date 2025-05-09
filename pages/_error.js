import React from "react";
import Link from "next/link";
import Head from "next/head";

function Error({ statusCode }) {
  return (
    <>
      <Head>
        <title>
          {statusCode ? `${statusCode} Error` : "Error"} | urTechy Blogs
        </title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-urtechy-red mb-4">
          {statusCode ? `${statusCode}` : "Error"}
        </h1>
        <p className="text-xl mb-8">
          {statusCode
            ? statusCode === 404
              ? "We couldn't find the page you're looking for."
              : "An error occurred on the server."
            : "An error occurred on the client."}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-urtechy-red text-white rounded-lg hover:bg-urtechy-orange transition-colors duration-300"
        >
          Return to Home
        </Link>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
