// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { GraphQLClient, gql } from "graphql-request";
const graphQlApi = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
/** *************************************************************
 * Any file inside the folder pages/api is mapped to /api/* and  *
 * will be treated as an API endpoint instead of a page.         *
 *************************************************************** */

// export a default function for API route to work
const graphQlToken = process.env.GRAPHCMS_TOKEN;
export default async function comments(req, res) {
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
  const result = await graphQLClient.request(query, req.body);
  return res.status(200).send(result);
}
