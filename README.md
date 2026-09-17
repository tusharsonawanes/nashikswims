# Swimming Challenge — Mobile Registration UI

A mobile-first static registration prototype designed for GitLab Pages.

## Included

- Apple-inspired responsive UI
- Light / dark theme toggle
- Swimming-inspired visual treatment
- Stage 1: Name, DOB, DOB proof upload, Gender, WhatsApp number
- Stage 2: 50m Freestyle, 50m Backstroke, 50m Breaststroke, 50m Butterfly
- Live event count and ₹200/event calculation
- Stage 3 payment flow with supplied QR code, alternative UPI ID, screenshot chooser, Send Screenshot UI, and transaction ID field
- Basic client-side validation
- No external libraries or paid services

## GitLab Pages

Push these files to a GitLab repository. The included `.gitlab-ci.yml` deploys the static site to GitLab Pages from the default branch.

## Next backend step

The current payment screenshot is selected and validated in the browser; it is not persisted to Google Drive yet.

The next implementation can connect the form to:
- Google Apps Script
- Google Sheets
- Google Drive for DOB proof / payment screenshots
- QR payment instructions
- final confirmation + registration ID
