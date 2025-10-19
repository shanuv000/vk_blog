/**
 * Telegram Service
 *
 * This service handles sending notifications to Telegram via the bot API.
 * Used to notify about new contact form submissions.
 */

/**
 * Format the contact form data into a readable Telegram message
 * @param {Object} formData - The contact form data
 * @returns {string} Formatted message for Telegram
 */
export const formatContactMessage = (formData) => {
  const { firstName, lastName, email, phone, subject, message } = formData;

  let telegramMessage = `🔔 *New Contact Form Submission*\n\n`;
  telegramMessage += `👤 *Name:* ${firstName} ${lastName}\n`;
  telegramMessage += `📧 *Email:* ${email}\n`;

  if (phone) {
    telegramMessage += `📱 *Phone:* ${phone}\n`;
  }

  if (subject) {
    telegramMessage += `📋 *Subject:* ${subject}\n`;
  }

  telegramMessage += `\n💬 *Message:*\n${message}\n`;
  telegramMessage += `\n⏰ *Received:* ${new Date().toLocaleString()}`;

  return telegramMessage;
};

/**
 * Send a notification to Telegram
 * This function calls the Next.js API route which securely handles the Telegram API
 * @param {Object} formData - The contact form data to send
 * @returns {Promise<Object>} Response from the API
 */
export const sendTelegramNotification = async (formData) => {
  try {
    const response = await fetch("/api/telegram-notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to send Telegram notification"
      );
    }

    return await response.json();
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Error sending Telegram notification:", error);
    }
    throw error;
  }
};
