import React from "react";
import Link from "next/link";

const Terms = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800">
        Terms and Conditions
      </h1>
      <p className="mb-6 text-gray-700">
        Welcome to OnlyBlogs! These terms and conditions outline the rules and
        regulations for the use of OnlyBlogs's Website, located at{" "}
        <a
          href="https://onlyblog.vercel.app/"
          className="text-blue-600 underline"
        >
          https://onlyblog.vercel.app/
        </a>
        .
      </p>
      <p className="mb-6 text-gray-700">
        By accessing this website we assume you accept these terms and
        conditions. Do not continue to use OnlyBlogs if you do not agree to take
        all of the terms and conditions stated on this page.
      </p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">Cookies</h2>
      <p className="mb-6 text-gray-700">
        We employ the use of cookies. By accessing OnlyBlogs, you agreed to use
        cookies in agreement with the OnlyBlogs's Privacy Policy.
      </p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">License</h2>
      <p className="mb-6 text-gray-700">
        Unless otherwise stated, OnlyBlogs and/or its licensors own the
        intellectual property rights for all material on OnlyBlogs. All
        intellectual property rights are reserved. You may access this from
        OnlyBlogs for your own personal use subjected to restrictions set in
        these terms and conditions.
      </p>
      <ul className="list-disc ml-8 mb-6 text-gray-700">
        <li>Republish material from OnlyBlogs</li>
        <li>Sell, rent or sub-license material from OnlyBlogs</li>
        <li>Reproduce, duplicate or copy material from OnlyBlogs</li>
        <li>Redistribute content from OnlyBlogs</li>
      </ul>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">
        User Comments
      </h2>
      <p className="mb-6 text-gray-700">
        This Agreement shall begin on the date hereof. Parts of this website
        offer an opportunity for users to post and exchange opinions and
        information in certain areas of the website. OnlyBlogs does not filter,
        edit, publish or review Comments prior to their presence on the website.
        Comments do not reflect the views and opinions of OnlyBlogs, its agents
        and/or affiliates. Comments reflect the views and opinions of the person
        who post their views and opinions.
      </p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">
        Hyperlinking to our Content
      </h2>
      <p className="mb-6 text-gray-700">
        The following organizations may link to our Website without prior
        written approval:
      </p>
      <ul className="list-disc ml-8 mb-6 text-gray-700">
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
      </ul>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">
        Content Liability
      </h2>
      <p className="mb-6 text-gray-700">
        We shall not be held responsible for any content that appears on your
        Website. You agree to protect and defend us against all claims that
        arise on your Website. No link(s) should appear on any Website that may
        be interpreted as libelous, obscene or criminal, or which infringes,
        otherwise violates, or advocates the infringement or other violation of,
        any third party rights.
      </p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">
        Reservation of Rights
      </h2>
      <p className="mb-6 text-gray-700">
        We reserve the right to request that you remove all links or any
        particular link to our Website. You approve to immediately remove all
        links to our Website upon request. We also reserve the right to amend
        these terms and conditions and it’s linking policy at any time. By
        continuously linking to our Website, you agree to be bound to and follow
        these linking terms and conditions.
      </p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">
        Removal of links from our website
      </h2>
      <p className="mb-6 text-gray-700">
        If you find any link on our Website that is offensive for any reason,
        you are free to contact and inform us at any moment. We will consider
        requests to remove links but we are not obligated to do so or to respond
        to you directly.
      </p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">Disclaimer</h2>
      <p className="mb-6 text-gray-700">
        To the maximum extent permitted by applicable law, we exclude all
        representations, warranties and conditions relating to our website and
        the use of this website. Nothing in this disclaimer will:
      </p>
      <ul className="list-disc ml-8 mb-6 text-gray-700">
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
      </ul>
      <p className="mb-6 text-gray-700">
        The limitations and prohibitions of liability set in this Section and
        elsewhere in this disclaimer: (a) are subject to the preceding
        paragraph; and (b) govern all liabilities arising under the disclaimer,
        including liabilities arising in contract, in tort and for breach of
        statutory duty.
      </p>
      <p className="mb-6 text-gray-700">
        As long as the website and the information and services on the website
        are provided free of charge, we will not be liable for any loss or
        damage of any nature.
      </p>
      <p className="mb-6 text-gray-700">
        For any further information, you can contact us at:{" "}
        <a
          href="mailto:shanuvatika@gmail.com"
          className="text-blue-600 underline"
        >
          shanuvatika@gmail.com
        </a>
        .
      </p>
    </div>
  );
};

export default Terms;
