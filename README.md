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


## v11 changes

### Registration number

New registrations receive a simple numeric Registration No:
001, 002, 003, ...

The backend remains compatible with legacy `SWIM-0003` rows when calculating
the next number, so an older test row will not cause number reuse.

The participant UI also accepts both `registrationNo` and the legacy
`registrationId` status key, preventing a blank success-screen number while
the deployment is being updated.

### Event-level records

`Event Entries` contains one row per selected event. The backend creates these
rows on every new registration.

Use the one-time Apps Script function `backfillEventEntries()` after updating
Code.gs to populate event rows for registrations made with the earlier version.

### UPI deep link

The payment screen now has a `Pay using UPI` button. It creates a standard
`upi://pay` URI using:
- VPA: `tusharson@oksbi`
- Payee name: `Nashik Swims`
- Exact calculated amount
- Currency: INR
- Competition name as the transaction note

On a phone, the operating system/browser may present the available UPI app(s)
that can handle the link. Desktop browsers will normally not have a UPI app
handler.


## v12

The UPI deep-link button has been removed for now.

The payment flow now remains:
- QR code
- Alternative UPI ID `tusharson@oksbi`
- Copy UPI ID
- Payment screenshot attachment
- Optional UPI transaction ID
- Submit registration

No automatic UPI-app redirect is used.


## v13: operational data model + submit animation

### Spreadsheet model

- `Registrations`: one row per participant registration.
- `Nashik Swims`: one row per selected event. This is the primary pool-day
  operational sheet.
- `Event Entries`: compatibility mirror for the event-level rows.

A participant selecting 10 events produces:
- 1 row in `Registrations`
- 10 rows in `Nashik Swims`
- 10 mirrored rows in `Event Entries`

### Existing data migration

Run the Apps Script function `migrateToV13Model()` ONCE.

It creates `Nashik Swims Legacy Backup`, preserves the existing test data,
converts legacy IDs such as `SWIM-0004` to `004`, creates the parent
registration rows, creates event-level rows, and rebuilds `Nashik Swims` as
the event-level table.

### Submission animation

When the final Submit button is pressed, a responsive pool animation appears
with a swimmer moving from left to right, animated strokes, bubbles, and waves.
It remains visible while the registration is being uploaded/confirmed and
closes automatically on success or error.

### UPI

The UPI deeplink remains intentionally removed. QR and manual UPI ID remain.


# v14 — clean data model

## Important: deploy the new Code.gs version

The previous backend had multiple helper/migration paths mixed together. That
made it easy for the deployed version and the spreadsheet structure to drift.

v14 uses one clear production model:

### `Registrations`
One row per participant registration.

### `Nashik Swims`
One row per selected event.

Example:

Registration 005 selects two events:

`Registrations`
- 005 | Tushar | 2 events | ₹400

`Nashik Swims`
- 005-01 | 005 | Tushar | 50m Freestyle
- 005-02 | 005 | Tushar | 50m Backstroke

## Existing data

Run `migrateLegacyNashikSwims()` once after replacing Code.gs. It backs up the
old Nashik Swims tab, converts old IDs such as SWIM-0004 to 004, creates
registration rows, and rebuilds Nashik Swims as the event-level table.

## Future competitions

Add new entries under `CONFIG.COMPETITIONS`. Each competition has its own
event list and fee. Registration numbering restarts per competition.

## Submission animation

The final Submit button shows a looping swimmer moving through a pool lane,
with waves and bubbles, until the backend confirms success or reports an error.

## UPI

The automatic UPI deeplink remains removed. The QR code and manual UPI ID
remain on the payment step.
