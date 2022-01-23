import React from "react";
import Head from "next/head";
import { Tweet } from "react-twitter-widgets";

const contact = () => {
  <Head></Head>;
  return (
    <div className="px-8">
      <Tweet tweetId="511181794914627584" />
    </div>
  );
};

export default contact;
