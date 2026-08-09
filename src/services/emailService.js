/**
 * Email Service — EmailJS integration for sending emails with attachments.
 *
 * SETUP REQUIRED:
 * 1. Create a free account at https://www.emailjs.com/
 * 2. Create an Email Service (e.g., Gmail, Outlook)
 * 3. Create an Email Template with {{params}}
 * 4. Add your Service ID, Template ID, and Public Key to .env:
 *    VITE_EMAILJS_SERVICE_ID=your_service_id
 *    VITE_EMAILJS_TEMPLATE_ID=your_template_id
 *    VITE_EMAILJS_PUBLIC_KEY=your_public_key
 */

import emailjs from 'emailjs-com'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

/**
 * Convert a File object or base64 string to a format EmailJS can attach.
 * EmailJS supports attaching files via the template params as a URL or base64 data URI.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Send an email via EmailJS.
 * @param {Object} templateParams — Key-value pairs matching your EmailJS template variables
 * @param {File|String|null} attachment — A File object (from <input type="file">) or a base64 data URI string
 * @returns {Promise<Object>} EmailJS response
 */
export async function sendEmail(templateParams, attachment = null) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Missing environment variables.')
    throw new Error('Email service is not configured. Please set VITE_EMAILJS_* environment variables.')
  }

  const params = { ...templateParams }

  // Auto-add timestamp if not provided
  if (!params.time) {
    params.time = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })
  }

  // Handle file attachment
  if (attachment) {
    if (attachment instanceof File) {
      params.attachment = await fileToBase64(attachment)
      params.attachment_name = attachment.name
    } else if (typeof attachment === 'string') {
      // Assume it's already a base64 data URI or URL
      params.attachment = attachment
    }
  }

  const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
  return response
}

/**
 * Send a booking confirmation email.
 * @param {Object} booking — Booking data including participantName, participantEmail, eventTitle, eventDate
 * @param {File|null} attachment — Optional PDF attachment (e.g., event info sheet)
 */
export async function sendBookingConfirmation(booking, attachment = null) {
  return sendEmail(
    {
      to_name: booking.participantName,
      to_email: booking.participantEmail,
      subject: `Booking Confirmed: ${booking.eventTitle}`,
      message: `Dear ${booking.participantName},\n\nYour booking for "${booking.eventTitle}" on ${booking.eventDate || 'the selected date'} has been confirmed.\n\nThank you for choosing SilverBridge Health!\n\n- The SilverBridge Health Team`,
      event_title: booking.eventTitle,
      event_date: booking.eventDate || '',
      participant_name: booking.participantName,
    },
    attachment,
  )
}

/**
 * Send a bulk email to multiple recipients.
 * @param {Array<string>} recipients — Array of email addresses
 * @param {string} subject — Email subject line
 * @param {string} message — Email body text
 * @param {File|null} attachment — Optional attachment
 */
export async function sendBulkEmail(recipients, subject, message, attachment = null) {
  const results = []
  for (const email of recipients) {
    try {
      const res = await sendEmail(
        {
          to_email: email,
          to_name: '',
          subject,
          message,
        },
        attachment,
      )
      results.push({ email, status: 'sent', response: res })
    } catch (err) {
      results.push({ email, status: 'failed', error: err.message })
    }
  }
  return results
}
