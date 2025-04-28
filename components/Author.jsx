import React from "react";
import Image from "next/image";
import { DEFAULT_AVATAR } from "./DefaultAvatar";

const Author = ({ author }) => {
  // If author is null or undefined, provide default values
  if (!author) {
    author = {
      name: "Anonymous",
      bio: "No biography available",
      photo: { url: DEFAULT_AVATAR },
    };
  }
  return (
    <div className="text-center mt-20 mb-8 p-12 relative rounded-lg bg-black bg-opacity-20">
      <div className="absolute left-0 right-0 -top-14">
        <Image
          src={author.photo?.url || DEFAULT_AVATAR}
          alt={author.name || "Author"}
          unoptimized
          height={100}
          width={100}
          className="align-middle rounded-full"
        />
      </div>
      <h3 className="text-white my-4 text-xl font-bold">
        {author.name || "Anonymous"}
      </h3>
      <p className="text-white text-lg">
        {author.bio || "No biography available"}
      </p>
    </div>
  );
};

export default Author;
