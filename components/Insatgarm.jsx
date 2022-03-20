import React from "react";
import InstagramEmbed from "react-instagram-embed";

const Insatgarm = () => {
  const clientAccessToken = "1038213280237143|32417a123db39472d95eee30f37d9001";
  return (
    <>
      <h1>Shanu</h1>
      <InstagramEmbed
        url="https://instagr.am/p/Zw9o4/"
        clientAccessToken={clientAccessToken}
        maxWidth={320}
        height={800}
        hideCaption={false}
        containerTagName="div"
        protocol=""
        injectScript
        onLoading={() => {}}
        onSuccess={() => {}}
        onAfterRender={() => {}}
        onFailure={() => {}}
      />
    </>
  );
};

export default Insatgarm;
