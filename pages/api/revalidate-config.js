// Configuration for the revalidation API
// This file exports middleware to configure the API route

export const config = {
  api: {
    // Enable parsing of larger request bodies
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
