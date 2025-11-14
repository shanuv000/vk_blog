import React from "react";

const Insatgarm = () => {
  const clientAccessToken = "1038213280237143|32417a123db39472d95eee30f37d9001";
  const url = "https://instagr.am/p/Zw9o4/";
  return (
    <>
      <div className="instagram-media" data-instgrm-permalink={url} />

      {/* <InstagramEmbed
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
      /> */}
    </>
  );
};

export default Insatgarm;
