# Collective Savers Backend

Core Cloud Functions for the Collective Savers MVP.

## Setup

1.  **Firebase**: Initialize a Firebase project with Firestore and Cloud Functions.
2.  **Dependencies**: Run `npm install` in the `functions` directory.
3.  **Environment Variables**:
    Set the following secrets in Firebase Functions:
    - `STRIPE_SECRET_KEY`
    - `SENDGRID_API_KEY`
    
    Using Firebase CLI:
    ```bash
    firebase functions:secrets:set STRIPE_SECRET_KEY
    firebase functions:secrets:set SENDGRID_API_KEY
    ```

## Functions

- `joinWave`: POST endpoint for users to join an active wave. Creates a manual capture PaymentIntent.
- `lockWave`: POST endpoint to finalize a wave. Captures all payments at the calculated final price and creates orders.
- `cronWaveFailure`: Scheduled task that runs every 5 minutes to cancel expired waves and their authorizations.
- `markOrderShipped`: POST endpoint for suppliers to record tracking information and notify customers.

## Security Rules

Firestore rules are provided in `firestore.rules`. Ensure they are deployed to protect user data.
