# Swimming Challenge — Connected v7

This version removes the Firefox-fragile JSONP status polling.

## Flow

GitLab Pages -> anonymous Apps Script POST -> Google Sheet + Google Drive.

The browser sends the registration with a CORS-safe form-encoded POST using
`mode: "no-cors"` and does not read the cross-origin response. A random,
client-generated `SWIM-XXXXXXXX` registration ID is sent with the request and
is therefore also shown immediately on the success screen.

The Apps Script backend recalculates the fee at ₹200 per valid event, validates
the four allowed events, saves DOB proof and payment screenshot to Drive, and
appends the registration to the `Nashik Swims` tab.

## Apps Script

Replace Code.gs with `apps-script/Code.gs`, save it, run `setupSwimmingChallenge`
once if required, then update the existing Web App deployment to the new version.
Keep:

- Execute as: Me
- Who has access: Anyone / anonymous

The `/exec` URL configured in `app.js` is the current user-provided deployment.

## GitLab Pages

Publish:

- index.html
- styles.css
- app.js
- .gitlab-ci.yml
- assets/payment-qr.png

Keep the Google Sheet and Drive folder Restricted/private.
