import { contentClient, gql } from "../../services/hygraph";

// Log for debugging purposes
console.log("Hygraph API initialized for comments");
export default async function comments(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // We're using the pre-configured contentClient from our hygraph.js file

  const query = gql`
    mutation createComment(
      $name: String!
      $email: String!
      $comment: String!
      $slug: String!
    ) {
      createComment(
        data: {
          name: $name
          email: $email
          comment: $comment
          post: { connect: { slug: $slug } }
        }
      ) {
        id
      }
    }
  `;

  try {
    console.log("Request body:", req.body);

    const { name, email, comment, slug } = req.body;
    if (!name || !email || !comment || !slug) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await contentClient.request(query, {
      name,
      email,
      comment,
      slug,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error submitting comment:", error);

    if (error.response) {
      return res.status(500).json({ error: error.response.errors });
    } else if (error.request) {
      return res
        .status(500)
        .json({ error: "Network error or no response from server" });
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
