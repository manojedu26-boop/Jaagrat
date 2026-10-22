const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

/**
 * Cloud Function triggered on every new fatigue event.
 * If alertLevel === 3 (Critical repeated microsleeps or unacknowledged alarm),
 * it immediately dispatches an urgent SMS alert to the Fleet Owner via Fast2SMS.
 */
exports.onCriticalFatigueEvent = functions.firestore
  .document("fatigue_events/{eventId}")
  .onCreate(async (snap, context) => {
    const event = snap.data();

    // Only process Level 3 critical escalations
    if (event.alertLevel !== 3) {
      return null;
    }

    try {
      const fleetId = event.fleetId;
      if (!fleetId) {
        console.warn("Event missing fleetId:", context.params.eventId);
        return null;
      }

      // Fetch Fleet Owner record
      const fleetDoc = await admin.firestore().collection("fleets").doc(fleetId).get();
      if (!fleetDoc.exists) {
        console.warn("Fleet profile not found for ID:", fleetId);
        return null;
      }

      const ownerPhone = fleetDoc.data().ownerPhone;
      if (!ownerPhone) {
        console.warn("No owner phone configured for fleet:", fleetId);
        return null;
      }

      // Format location link
      let locationText = "Location unavailable";
      if (event.location && event.location.latitude && event.location.longitude) {
        locationText = `https://maps.google.com/?q=${event.location.latitude},${event.location.longitude}`;
      }

      const speed = event.speedKmH ? `${Math.round(event.speedKmH)} km/h` : "N/A";
      const message = `[JAAGRAT ALERT] CRITICAL: Vehicle ${event.vehicleId} driver showed 3 repeat microsleeps at speed ${speed}. Near: ${locationText}. Call driver immediately!`;

      // Fast2SMS API integration (DLT-compliant quick transaction route for India)
      const apiKey = process.env.FAST2SMS_API_KEY || functions.config().fast2sms?.key;

      if (!apiKey) {
        console.log("Mock SMS Dispatch (API Key not set):", message);
        return snap.ref.update({
          ownerNotified: true,
          mock: true,
          notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "v3",
          sender_id: "JAGRAT",
          message: message,
          language: "english",
          flash: 0,
          numbers: ownerPhone,
        },
        {
          headers: {
            authorization: apiKey,
          },
        }
      );

      console.log("Fast2SMS Response:", response.data);

      return snap.ref.update({
        ownerNotified: true,
        notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Critical Alert SMS Dispatch Error:", error);
      return snap.ref.update({
        ownerNotified: false,
        error: error.message,
      });
    }
  });
