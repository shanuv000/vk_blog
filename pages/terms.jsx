import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const Terms = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  return (
    <>
      <Head>
        <title>Terms and Conditions | urTechy Blogs</title>
        <meta name="description" content="Terms and conditions for using urTechy Blogs website." />
      </Head>
      
      <motion.div 
        className="p-8 max-w-4xl mx-auto bg-secondary shadow-lg rounded-lg my-8 border border-secondary-light"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl font-extrabold mb-6 text-text-primary border-b border-primary pb-2"
            variants={itemVariants}
          >
            Terms and Conditions
          </motion.h1>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            Welcome to urTechy Blogs! These terms and conditions outline the rules
            and regulations for the use of urTechy Blogs's Website, located at{" "}
            <a href="https://blog.urtechy.com/" className="text-primary hover:text-primary-light transition-colors duration-200">
              https://blog.urtechy.com/
            </a>
            .
          </motion.p>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            By accessing this website we assume you accept these terms and
            conditions. Do not continue to use urTechy Blogs if you do not agree to
            take all of the terms and conditions stated on this page.
          </motion.p>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            Cookies
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            We employ the use of cookies. By accessing urTechy Blogs, you agreed to
            use cookies in agreement with the urTechy Blogs's Privacy Policy.
          </motion.p>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            License
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            Unless otherwise stated, urTechy Blogs and/or its licensors own the
            intellectual property rights for all material on urTechy Blogs. All
            intellectual property rights are reserved. You may access this from
            urTechy Blogs for your own personal use subjected to restrictions set in
            these terms and conditions.
          </motion.p>

          <motion.ul
            className="list-disc ml-8 mb-6 text-text-primary space-y-2"
            variants={itemVariants}
          >
            <li>Republish material from urTechy Blogs</li>
            <li>Sell, rent or sub-license material from urTechy Blogs</li>
            <li>Reproduce, duplicate or copy material from urTechy Blogs</li>
            <li>Redistribute content from urTechy Blogs</li>
          </motion.ul>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            User Comments
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            This Agreement shall begin on the date hereof. Parts of this website
            offer an opportunity for users to post and exchange opinions and
            information in certain areas of the website. urTechy Blogs does not
            filter, edit, publish or review Comments prior to their presence on the
            website. Comments do not reflect the views and opinions of urTechy
            Blogs, its agents and/or affiliates. Comments reflect the views and
            opinions of the person who post their views and opinions.
          </motion.p>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            Hyperlinking to our Content
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            The following organizations may link to our Website without prior
            written approval:
          </motion.p>

          <motion.ul
            className="list-disc ml-8 mb-6 text-text-primary space-y-2"
            variants={itemVariants}
          >
            <li>Government agencies;</li>
            <li>Search engines;</li>
            <li>News organizations;</li>
            <li>
              Online directory distributors may link to our Website in the same
              manner as they hyperlink to the Websites of other listed businesses;
              and
            </li>
            <li>
              System wide Accredited Businesses except soliciting non-profit
              organizations, charity shopping malls, and charity fundraising groups
              which may not hyperlink to our Web site.
            </li>
          </motion.ul>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            Content Liability
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            We shall not be held responsible for any content that appears on your
            Website. You agree to protect and defend us against all claims that
            arise on your Website. No link(s) should appear on any Website that may
            be interpreted as libelous, obscene or criminal, or which infringes,
            otherwise violates, or advocates the infringement or other violation of,
            any third party rights.
          </motion.p>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            Reservation of Rights
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            We reserve the right to request that you remove all links or any
            particular link to our Website. You approve to immediately remove all
            links to our Website upon request. We also reserve the right to amend
            these terms and conditions and it's linking policy at any time. By
            continuously linking to our Website, you agree to be bound to and follow
            these linking terms and conditions.
          </motion.p>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            Removal of links from our website
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            If you find any link on our Website that is offensive for any reason,
            you are free to contact and inform us at any moment. We will consider
            requests to remove links but we are not obligated to do so or to respond
            to you directly.
          </motion.p>

          <motion.h2
            className="text-2xl font-semibold mb-4 text-primary-light mt-8"
            variants={itemVariants}
          >
            Disclaimer
          </motion.h2>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            To the maximum extent permitted by applicable law, we exclude all
            representations, warranties and conditions relating to our website and
            the use of this website. Nothing in this disclaimer will:
          </motion.p>

          <motion.ul
            className="list-disc ml-8 mb-6 text-text-primary space-y-2"
            variants={itemVariants}
          >
            <li>
              limit or exclude our or your liability for death or personal injury;
            </li>
            <li>
              limit or exclude our or your liability for fraud or fraudulent
              misrepresentation;
            </li>
            <li>
              limit any of our or your liabilities in any way that is not permitted
              under applicable law; or
            </li>
            <li>
              exclude any of our or your liabilities that may not be excluded under
              applicable law.
            </li>
          </motion.ul>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            The limitations and prohibitions of liability set in this Section and
            elsewhere in this disclaimer: (a) are subject to the preceding
            paragraph; and (b) govern all liabilities arising under the disclaimer,
            including liabilities arising in contract, in tort and for breach of
            statutory duty.
          </motion.p>

          <motion.p
            className="mb-6 text-text-primary"
            variants={itemVariants}
          >
            As long as the website and the information and services on the website
            are provided free of charge, we will not be liable for any loss or
            damage of any nature.
          </motion.p>

          <motion.div
            className="mt-10 pt-6 border-t border-secondary-light"
            variants={itemVariants}
          >
            <p className="text-text-primary">
              For any further information, you can contact us at:{" "}
              <a
                href="mailto:urtechy000@gmail.com"
                className="text-primary hover:text-primary-light transition-colors duration-200"
              >
                urtechy000@gmail.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Terms;
