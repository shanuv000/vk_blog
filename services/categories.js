import { graphQLClient } from "./graphql-client";

export const getCategories = async () => {
  const query = `
    query GetCategories {
      categories(where: { show: true }, orderBy: name_DESC) {
        name
        slug
      }
    }
  `;

  try {
    const result = await graphQLClient.request(query);
    return result.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
