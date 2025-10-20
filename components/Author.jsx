import React from "react";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { DEFAULT_AVATAR } from "./DefaultAvatar";
import { getOptimizedImageUrl } from "../lib/image-config";

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
        {author.photo?.url ? (
          <Image
            src={getOptimizedImageUrl(author.photo.url, "avatar")}
            alt={author.name || "Author"}
            height={100}
            width={100}
            quality={70}
            sizes="100px"
            className="align-middle rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-200 rounded-full h-[100px] w-[100px] mx-auto">
            <FaUser className="text-gray-500" size={50} />
          </div>
        )}
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
