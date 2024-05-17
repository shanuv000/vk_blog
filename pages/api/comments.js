import { GraphQLClient, gql } from "graphql-request";

const graphQlApi = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
const graphQlToken = process.env.GRAPHCMS_TOKEN;
console.log("GraphQL API:", graphQlApi);
console.log("GraphQL Token:", graphQlToken ? "Present" : "Missing");
export default async function comments(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const graphQLClient = new GraphQLClient(graphQlApi, {
    headers: { authorization: `Bearer ${graphQlToken}` },
  });

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

    const result = await graphQLClient.request(query, {
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
