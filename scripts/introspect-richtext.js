#!/usr/bin/env node
const { GraphQLClient } = require("graphql-request");
const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;

if (!endpoint) {
  console.error("NEXT_PUBLIC_HYGRAPH_CDN_API is not set");
  process.exit(1);
}

const query = `{
  __schema {
    types {
      kind
      name
      possibleTypes {
        name
      }
    }
  }
}`;

(async () => {
  try {
    const client = new GraphQLClient(endpoint);
    const result = await client.request(query);
    const matches = result.__schema.types
      .filter(
        (type) => type.name && type.name.startsWith("PostContentRichText")
      )
      .map((type) => ({
        name: type.name,
        possibleTypes: (type.possibleTypes || []).map((t) => t.name),
      }));

    console.log(JSON.stringify(matches, null, 2));
  } catch (error) {
    console.error("Failed to introspect schema", error);
    process.exit(1);
  }
})();
