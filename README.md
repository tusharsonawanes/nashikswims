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


## v8 changes

- The browser-generated `SWIM-XXXXXXXX` registration ID is now authoritative and is the exact ID written to the Sheet and used as the Google Drive registration folder name.
- Each registration gets its own private Drive folder under `Swimming Challenge 2026`.
- DOB proof and payment screenshot are stored inside that registration folder.
- The Sheet stores a direct Registration Folder link.
- Competition configuration is data-driven so additional competitions can be added later with their own fee and events.
- The frontend and Apps Script both use the same competition ID and event definitions.


# v9 data model

## Simple registration number

The server now assigns a simple numeric Registration No per competition:

- 001
- 002
- 003
- ...

The same number is shown to the participant, stored in the `Nashik Swims`
registration table, used as the Google Drive registration-folder name, and
used as the prefix for uploaded files.

The sequence restarts for each future competition.

## Sheet structure

### Nashik Swims

One row per participant registration.

Key fields:
- Registration No
- Competition
- Name
- DOB
- Gender
- WhatsApp
- Event Count
- Total Fee
- Payment references
- DOB proof
- Payment screenshot
- Registration folder
- Payment status

### Event Entries

One row per selected event.

For example, a participant selecting four events creates four rows:

| Registration No | Name | Event |
|---|---|---|
| 027 | Tushar Sonawane | 50m Freestyle |
| 027 | Tushar Sonawane | 50m Backstroke |
| 027 | Tushar Sonawane | 50m Breaststroke |
| 027 | Tushar Sonawane | 50m Butterfly |

The event table already has columns for Heat, Lane, Result and Rank,
so it can later become the operational race-management table.

## Drive structure

For the current competition:

Swimming Challenge 2026/
  001/
    001_DOB_Proof
    001_Payment
  002/
    002_DOB_Proof
    002_Payment

Each registration folder remains private.

## Apps Script deployment

Because the existing web-app URL is already confirmed anonymously accessible,
the frontend can use a tiny read-only JSONP status call after its opaque POST.
Only the registration number, status and total fee are returned.
No participant details or Drive URLs are exposed through the status endpoint.


## v10 event-selection fix

The backend now accepts both:
- `eventIds` (stable event IDs)
- `events` (human-readable event names)

The frontend sends both. This prevents a temporary frontend/backend version
mismatch or browser cache from turning a valid event selection into
"At least one event must be selected."

A visible Apps Script helper `testSwimmingConfiguration()` was also added.
It creates/verifies the registration sheet, event-entry sheet and competition
Drive folder without submitting a participant.
