import React from "react";
import Head from "next/head";
import { Tweet } from "react-twitter-widgets";
import InstagramEmbed from "react-instagram-embed";

const contact = () => {
  <Head></Head>;
  return (
    <div className="px-8">
      <InstagramEmbed
        url="https://www.instagram.com/p/CY6c880A5ou"
        clientAccessToken="677336189940107|339ead3f2fd2f8f9e269bc636298cba6"
        maxWidth={320}
        hideCaption={false}
        containerTagName="div"
        protocol=""
        injectScript
        onLoading={() => {}}
        onSuccess={() => {}}
        onAfterRender={() => {}}
        onFailure={() => {}}
      />
    </div>
  );
};

export default contact;
