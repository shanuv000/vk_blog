import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Terms = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <motion.h1
        className="text-4xl font-extrabold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Terms and Conditions
      </motion.h1>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Welcome to urTechy Blogs! These terms and conditions outline the rules
        and regulations for the use of urTechy Blogs's Website, located at{" "}
        <a href="https://blog.urtechy.com/" className="text-blue-600 underline">
          https://blog.urtechy.com/
        </a>
        .
      </motion.p>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        By accessing this website we assume you accept these terms and
        conditions. Do not continue to use urTechy Blogs if you do not agree to
        take all of the terms and conditions stated on this page.
      </motion.p>

      <motion.h2
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Cookies
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        We employ the use of cookies. By accessing urTechy Blogs, you agreed to
        use cookies in agreement with the urTechy Blogs's Privacy Policy.
      </motion.p>

      <motion.h2
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        License
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Unless otherwise stated, urTechy Blogs and/or its licensors own the
        intellectual property rights for all material on urTechy Blogs. All
        intellectual property rights are reserved. You may access this from
        urTechy Blogs for your own personal use subjected to restrictions set in
        these terms and conditions.
      </motion.p>

      <motion.ul
        className="list-disc ml-8 mb-6 text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <li>Republish material from urTechy Blogs</li>
        <li>Sell, rent or sub-license material from urTechy Blogs</li>
        <li>Reproduce, duplicate or copy material from urTechy Blogs</li>
        <li>Redistribute content from urTechy Blogs</li>
      </motion.ul>

      <motion.h2
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        User Comments
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
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
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        Hyperlinking to our Content
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        The following organizations may link to our Website without prior
        written approval:
      </motion.p>

      <motion.ul
        className="list-disc ml-8 mb-6 text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
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
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        Content Liability
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      >
        We shall not be held responsible for any content that appears on your
        Website. You agree to protect and defend us against all claims that
        arise on your Website. No link(s) should appear on any Website that may
        be interpreted as libelous, obscene or criminal, or which infringes,
        otherwise violates, or advocates the infringement or other violation of,
        any third party rights.
      </motion.p>

      <motion.h2
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        Reservation of Rights
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.6 }}
      >
        We reserve the right to request that you remove all links or any
        particular link to our Website. You approve to immediately remove all
        links to our Website upon request. We also reserve the right to amend
        these terms and conditions and it’s linking policy at any time. By
        continuously linking to our Website, you agree to be bound to and follow
        these linking terms and conditions.
      </motion.p>

      <motion.h2
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.7 }}
      >
        Removal of links from our website
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.8 }}
      >
        If you find any link on our Website that is offensive for any reason,
        you are free to contact and inform us at any moment. We will consider
        requests to remove links but we are not obligated to do so or to respond
        to you directly.
      </motion.p>

      <motion.h2
        className="text-3xl font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.9 }}
      >
        Disclaimer
      </motion.h2>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        To the maximum extent permitted by applicable law, we exclude all
        representations, warranties and conditions relating to our website and
        the use of this website. Nothing in this disclaimer will:
      </motion.p>

      <motion.ul
        className="list-disc ml-8 mb-6 text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.1 }}
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
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2.2 }}
      >
        The limitations and prohibitions of liability set in this Section and
        elsewhere in this disclaimer: (a) are subject to the preceding
        paragraph; and (b) govern all liabilities arising under the disclaimer,
        including liabilities arising in contract, in tort and for breach of
        statutory duty.
      </motion.p>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2.3 }}
      >
        As long as the website and the information and services on the website
        are provided free of charge, we will not be liable for any loss or
        damage of any nature.
      </motion.p>

      <motion.p
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2.4 }}
      >
        For any further information, you can contact us at:{" "}
        <a
          href="mailto:shanuvatika@gmail.com"
          className="text-blue-600 underline"
        >
          shanuvatika@gmail.com
        </a>
        .
      </motion.p>
    </div>
  );
};

export default Terms;
