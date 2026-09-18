# Swimming Challenge — Connected v6

Mobile-first swimming challenge registration for GitLab Pages, connected to Google Apps Script, Google Sheets, and Google Drive.

## Why v5

The previous hidden-iframe + `postMessage()` response approach could surface `NS_ERROR_DOM_NETWORK_ERR` in Firefox because Apps Script Content Service responses are redirected through Google's `googleusercontent.com` endpoint.

This version does not attempt to read the cross-origin POST response. The GitLab page submits with a simple `fetch()` using `mode: "no-cors"`, then polls a read-only Apps Script JSONP status endpoint using a random submission token.

## Backend

`apps-script/Code.gs` is the complete backend to paste into the Google Apps Script project.

It writes to the private `Nashik Swims` sheet tab and saves DOB proof and payment screenshot files into the private Drive folder structure:

`Swimming Challenge 2026/Participant Documents`

The server recalculates the fee at ₹200 per valid event and generates `SWIM-0001`, `SWIM-0002`, etc.

## Deploy/update

After pasting `apps-script/Code.gs` into Apps Script:

1. Save.
2. Run `setupSwimmingChallenge` once if the Sheet/Drive setup needs creating/updating.
3. Deploy -> Manage deployments.
4. Edit the existing Web app deployment and create a new version.
5. Execute as: Me.
6. Who has access: Anyone.
7. Deploy/update.

The existing `/exec` URL can remain the same when the deployment is updated.

Then publish the root frontend files to GitLab Pages.

## Privacy

Keep the Google Sheet and Drive folders restricted/private. The GitLab site does not directly access either one.
