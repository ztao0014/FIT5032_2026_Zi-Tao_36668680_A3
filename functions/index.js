/**
 * SilverBridge Health — Firebase Cloud Functions
 *
 * Two custom serverless functions:
 * 1. sendBookingConfirmation — Firestore trigger: sends email when a booking is created
 * 2. aggregateEventRatings — HTTP callable: aggregates ratings for all events
 *
 * Deployment: firebase deploy --only functions
 * (Requires Firebase Blaze plan for external network access)
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

// ---------------------------------------------------------------------------
// Cloud Function 1: Send booking confirmation email on new booking
// Trigger: Firestore onCreate on 'bookings' collection
// ---------------------------------------------------------------------------
exports.sendBookingConfirmation = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data()
    const bookingId = context.params.bookingId

    functions.logger.info('New booking created:', bookingId, 'Event:', booking.eventTitle)

    try {
      // In a production app, this would call an email service (SendGrid, Mailgun, etc.)
      // For now, we log the confirmation and store a notification
      const notification = {
        type: 'booking_confirmation',
        bookingId: bookingId,
        recipientEmail: booking.participantEmail || '',
        recipientName: booking.participantName || '',
        eventTitle: booking.eventTitle || '',
        eventDate: booking.eventDate || '',
        message: `Dear ${booking.participantName}, your booking for "${booking.eventTitle}" has been confirmed.`,
        sent: false, // Would be set to true after email API call
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      await db.collection('notifications').add(notification)

      functions.logger.info('Booking confirmation notification stored:', bookingId)
      return { success: true, bookingId }
    } catch (error) {
      functions.logger.error('Failed to process booking confirmation:', error)
      return { success: false, error: error.message }
    }
  })

// ---------------------------------------------------------------------------
// Cloud Function 2: Aggregate event ratings (HTTP callable)
// Called from the frontend to get aggregated rating data for all events
// ---------------------------------------------------------------------------
exports.aggregateEventRatings = functions.https.onCall(async (data, context) => {
  // Optional: check auth
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.')
  // }

  try {
    const ratingsSnapshot = await db.collection('ratings').get()

    const eventRatings = {}

    ratingsSnapshot.forEach(doc => {
      const rating = doc.data()
      const itemId = rating.itemId

      if (!eventRatings[itemId]) {
        eventRatings[itemId] = {
          itemId: itemId,
          totalRatings: 0,
          sumScores: 0,
          averageRating: 0,
          scores: [],
        }
      }

      eventRatings[itemId].totalRatings++
      eventRatings[itemId].sumScores += rating.score
      eventRatings[itemId].scores.push(rating.score)
    })

    // Calculate averages
    Object.values(eventRatings).forEach(item => {
      item.averageRating = Math.round((item.sumScores / item.totalRatings) * 10) / 10
    })

    const result = Object.values(eventRatings).sort((a, b) => b.totalRatings - a.totalRatings)

    functions.logger.info(`Aggregated ratings for ${result.length} events`)

    return {
      success: true,
      count: result.length,
      ratings: result,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    functions.logger.error('Failed to aggregate ratings:', error)
    throw new functions.https.HttpsError('internal', 'Failed to aggregate ratings', error.message)
  }
})

// ---------------------------------------------------------------------------
// Cloud Function 3 (bonus): Clean up old notifications (scheduled, runs daily)
// Demonstrates scheduled function capability
// ---------------------------------------------------------------------------
exports.cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30) // 30 days ago

    try {
      const oldNotifications = await db
        .collection('notifications')
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoff))
        .get()

      const batch = db.batch()
      oldNotifications.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      functions.logger.info(`Cleaned up ${oldNotifications.size} old notifications`)
      return { deleted: oldNotifications.size }
    } catch (error) {
      functions.logger.error('Cleanup failed:', error)
      return { deleted: 0, error: error.message }
    }
  })
