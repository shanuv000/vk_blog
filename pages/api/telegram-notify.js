/**
 * Telegram Notification API Route
 *
 * This API route handles sending notifications to Telegram when a contact form is submitted.
 * The API keys are kept secure on the server side and never exposed to the client.
 */

/**
 * Format the contact form data into a readable Telegram message
 * @param {Object} formData - The contact form data
 * @returns {string} Formatted message for Telegram
 */
const formatContactMessage = (formData) => {
  const { firstName, lastName, email, phone, subject, message } = formData;

  // Create stylish header with URTECHY BLOGS
  let telegramMessage = `╔═══════════════════════════╗\n`;
  telegramMessage += `║   *🚀 URTECHY BLOGS �*   ║\n`;
  telegramMessage += `╚═══════════════════════════╝\n\n`;

  telegramMessage += `�🔔 *New Contact Form Submission*\n`;
  telegramMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  telegramMessage += `👤 *Name:* ${firstName} ${lastName}\n`;
  telegramMessage += `📧 *Email:* ${email}\n`;

  if (phone) {
    telegramMessage += `📱 *Phone:* ${phone}\n`;
  }

  if (subject) {
    telegramMessage += `📋 *Subject:* ${subject}\n`;
  }

  telegramMessage += `\n💬 *Message:*\n`;
  telegramMessage += `┌─────────────────────────┐\n`;
  telegramMessage += `${message}\n`;
  telegramMessage += `└─────────────────────────┘\n`;

  telegramMessage += `\n⏰ *Received:* ${new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  })}`;

  telegramMessage += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  telegramMessage += `\n✨ _blog.urtechy.com_ ✨`;

  return telegramMessage;
};

/**
 * Send a message to Telegram using the Bot API
 * @param {string} message - The message to send
 * @returns {Promise<Object>} Response from Telegram API
 */
const sendToTelegram = async (message) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error(
      "Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local"
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
 * API Route Handler
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // Validate request body
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide firstName, lastName, email, and message.",
      });
    }

    // Format the message
    const telegramMessage = formatContactMessage(req.body);

    // Send to Telegram
    const result = await sendToTelegram(telegramMessage);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Telegram notification sent successfully",
      telegramResponse: result,
    });
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Error in telegram-notify API:", error);
    }

    // Return error response
    return res.status(500).json({
      success: false,
      error: "Failed to send Telegram notification",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}
