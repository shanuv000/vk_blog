import React, { useState } from "react";
import Footer from "../components/footer/Footer";

const about = () => {
  const [showEmail, setShowEmail] = useState(false);
  return (
    <section className="bg-white dark:text-coolGray-100">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
        <h1 className="text-4xl font-bold leading-none sm:text-5xl">
          Welcome To <span className="dark:text-violet-400"> key2success</span>
        </h1>
        <p className="px-8 mt-8 mb-6 text-lg">
          key2success is a Professional blog Platform. Here we will provide you
          only interesting content, which you will like very much. We're
          dedicated to providing you the best of blog, with a focus on
          dependability and reading blogs. We're working to turn our passion for
          blog into a booming online website. We hope you enjoy our blog as much
          as we enjoy offering them to you.
        </p>
        <p className="px-8  mb-5 text-lg">
          I will keep posting more important posts on my Website for all of you.
          Please give your support and love.
        </p>{" "}
        <p className="px-8 text-lg bold mb-4 text-[22px] font-bold">
          Thanks For Visiting Our Site
        </p>
        <div className="flex flex-wrap justify-center">
          <button
            onClick={() => setShowEmail(!showEmail)}
            className=" px-8 py-3 flex flex-wrap m-2 text-lg font-semibold rounded dark:bg-violet-400 dark:text-blue-900 hover:bg-black"
          >
            <img
              //   className="mr-4"
              width={"40"}
              className="transition duration-150 ease-out hover:ease-in"
              src="https://img.icons8.com/fluency/48/000000/email-open.png"
            />
          </button>
          {showEmail && (
            <>
              <p
                onClick={() => window.open("mailto:shanuvatika@gmail.com")}
                className="dark:bg-violet-400 text-gray-900 px-8 py-3 m-2 text-lg font-semibold cursor-pointer hover:bg-black hover:text-blue-400 rounded hover:rounded-lg"
              >
                Send Mail
              </p>
              <button
                className=" px-8 py-3 flex flex-wrap m-2 text-lg font-semibold rounded dark:bg-violet-400 dark:text-blue-900 hover:bg-black"
                onClick={() => {
                  navigator.clipboard.writeText("shanuvatika@gmail.com");
                }}
              >
                <img
                  width={"25"}
                  src="https://img.icons8.com/color/48/000000/copy--v2.png"
                />
              </button>
            </>
          )}
          {/* <button className="px-8 py-3 m-2 text-lg border rounded dark:text-coolGray-50 dark:border-coolGray-700">
            Learn more
          </button> */}
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default about;
