# Swimming Challenge — Mobile Registration UI

A mobile-first static registration prototype designed for GitLab Pages.

## Included

- Apple-inspired responsive UI
- Light / dark theme toggle
- Swimming-inspired visual treatment
- Stage 1: Name, DOB, DOB proof upload, Gender, WhatsApp number
- Stage 2: 50m Freestyle, 50m Backstroke, 50m Breaststroke, 50m Butterfly
- Live event count and ₹200/event calculation
- Stage 3 payment flow with supplied QR code, alternative UPI ID, screenshot chooser, transaction ID field, and final submission
- Basic client-side validation
- No external libraries or paid services

## GitLab Pages

Push these files to a GitLab repository. The included `.gitlab-ci.yml` deploys the static site to GitLab Pages from the default branch.

## Next backend step

The GitLab frontend is connected to the supplied Google Apps Script `/exec` endpoint. Final submission sends participant data and the two file uploads to Apps Script.

The next implementation can connect the form to:
- Google Apps Script
- Google Sheets
- Google Drive for DOB proof / payment screenshots
- QR payment instructions
- final confirmation + registration ID


## Configured backend

The frontend is connected to the supplied Google Apps Script web-app endpoint.

The public GitLab site uses a hidden HTML form POST to an invisible iframe rather than a cross-origin `fetch()` call. Apps Script processes the registration, writes to the Google Sheet, saves the files to Google Drive, and sends the result back to the page via `postMessage`.

Keep the Google Sheet and Drive folders private. Do not commit Google credentials or OAuth tokens to GitLab.
