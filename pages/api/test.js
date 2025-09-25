export default function handler(req, res) {
  return res.status(200).json({
    message: "Test API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasTwitterKey: !!process.env.TWITTER_API_KEY,
      hasTwitterSecret: !!process.env.TWITTER_API_SECRET,
    },
  });
}
