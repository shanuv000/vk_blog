/**
 * Hygraph to Telegram Webhook Handler
 *
 * This webhook receives all Hygraph CMS events and sends notifications to Telegram.
 * Supports: Post, Category, Author, Comment, and all other content model updates.
 *
 * Events tracked:
 * - create: New content created
 * - update: Content updated
 * - delete: Content deleted
 * - publish: Content published
 * - unpublish: Content unpublished
 */

/**
 * Format operation type with emoji
 */
const getOperationEmoji = (operation) => {
  const emojiMap = {
    create: "🆕",
    update: "✏️",
    delete: "🗑️",
    publish: "🚀",
    unpublish: "📦",
  };
  return emojiMap[operation] || "📝";
};

/**
 * Format content type with emoji
 */
const getContentTypeEmoji = (typename) => {
  const emojiMap = {
    Post: "📰",
    Category: "📁",
    Author: "👤",
    Comment: "💬",
    Asset: "🖼️",
  };
  return emojiMap[typename] || "📄";
};

/**
 * Get user-friendly operation name
 */
const getOperationName = (operation) => {
  const nameMap = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    publish: "Published",
    unpublish: "Unpublished",
  };
  return nameMap[operation] || operation;
};

/**
 * Format Hygraph event into a Telegram message
 */
const formatHygraphMessage = (operation, data) => {
  const { __typename, id, slug, title, name } = data;

  // Create message header
  let message = `╔═══════════════════════════╗\n`;
  message += `║   *🚀 URTECHY CMS UPDATE*   ║\n`;
  message += `╚═══════════════════════════╝\n\n`;

  // Operation and content type
  message += `${getOperationEmoji(operation)} *${getOperationName(
    operation
  )}* - ${getContentTypeEmoji(__typename)} ${__typename}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Content details
  if (title) {
    message += `📌 *Title:* ${title}\n`;
  }
  if (name) {
    message += `📌 *Name:* ${name}\n`;
  }
  if (slug) {
    message += `🔗 *Slug:* \`${slug}\`\n`;
  }
  message += `🆔 *ID:* \`${id}\`\n`;

  // Add direct link for Posts
  if (
    __typename === "Post" &&
    slug &&
    (operation === "publish" || operation === "update")
  ) {
    message += `\n🌐 *View Post:*\n`;
    message += `[blog.urtechy.com/post/${slug}](https://blog.urtechy.com/post/${slug})\n`;
  }

  // Add timestamp
  message += `\n⏰ *Time:* ${new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  })}\n`;

  // Add environment info
  const env = process.env.NODE_ENV || "development";
  message += `🔧 *Environment:* ${env}\n`;

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  message += `\n✨ _Hygraph CMS Notification_ ✨`;

  return message;
};

/**
 * Send message to Telegram
 */
const sendToTelegram = async (message) => {
  // Use the Hygraph-specific Telegram bot token from environment variables
  const botToken = process.env.HYGRAPH_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error(
      "HYGRAPH_TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured in environment variables"
    );
  }

  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(telegramApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
      disable_web_page_preview: false, // Show preview for post links
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Telegram API error: ${errorData.description || "Unknown error"}`
    );
  }

  return await response.json();
};

/**
 * Main webhook handler
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    // Validate webhook secret
    const { secret } = req.query;
    if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
      console.warn("⚠️ Invalid webhook secret attempted");
      return res.status(401).json({
        success: false,
        error: "Invalid webhook secret",
      });
    }

    // Parse webhook payload
    const { operation, data } = req.body;

    if (!operation || !data) {
      return res.status(400).json({
        success: false,
        error: "Invalid webhook payload. Expected operation and data fields.",
      });
    }

    console.log(
      `📥 Hygraph webhook received: ${operation} - ${data.__typename} (${data.id})`
    );

    // Format and send Telegram notification
    const telegramMessage = formatHygraphMessage(operation, data);
    const telegramResult = await sendToTelegram(telegramMessage);

    console.log(`✅ Telegram notification sent successfully`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Webhook processed and Telegram notification sent",
      data: {
        operation,
        contentType: data.__typename,
        contentId: data.id,
        telegramMessageId: telegramResult.result.message_id,
      },
    });
  } catch (error) {
    console.error("❌ Error in Hygraph-Telegram webhook:", error);

    // Return error response
    return res.status(500).json({
      success: false,
      error: "Failed to process webhook",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};
