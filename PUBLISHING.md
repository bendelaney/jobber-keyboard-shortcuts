# Publishing the extensions

The **Publish extensions** GitHub Action
(`.github/workflows/publish-extensions.yml`) uploads new versions to the Chrome
Web Store and Firefox Add-ons (AMO) for you.

## How it works

- **Automatic:** when a push to `main` changes `"version"` in the extension
  manifests, the action builds both packages, uploads them, and submits them for
  review. Pushes that don't bump the version publish nothing, so you can batch
  several fixes into one release.
- **Manual:** GitHub > **Actions** > **Publish extensions** > **Run workflow**.
  It publishes the current version to both stores, or just one. Use it to retry
  a failed upload or for the first release after setting up credentials.
- **Store review still applies.** Each store reviews the submission (usually
  hours to a few days) before users get the update automatically.

Before uploading, the action checks that the version matches across both
manifests and `jobber-keyboard-shortcuts.js`, and that both `content.js` files
are in sync. If either check fails, nothing is uploaded.

The userscript loader doesn't need any of this. It pulls the latest code from
`main` on every page load.

## One-time setup

You need six repository secrets. Add each one at **GitHub > Settings > Secrets
and variables > Actions > New repository secret**:
https://github.com/bendelaney/jobber-keyboard-shortcuts/settings/secrets/actions

| Secret | Where it comes from |
|---|---|
| `CWS_CLIENT_ID` | Google Cloud OAuth client (Chrome step 3) |
| `CWS_CLIENT_SECRET` | Google Cloud OAuth client (Chrome step 3) |
| `CWS_REFRESH_TOKEN` | OAuth Playground (Chrome step 5) |
| `CWS_PUBLISHER_ID` | Chrome Web Store dashboard (Chrome step 6) |
| `AMO_JWT_ISSUER` | AMO API keys page (Firefox step 1) |
| `AMO_JWT_SECRET` | AMO API keys page (Firefox step 1) |

### Chrome Web Store

The action uses the Chrome Web Store API v2 (v1.1 was retired in October 2026)
with an OAuth refresh token. Sign in everywhere below with the Google account
that owns the extension. That account needs 2-step verification turned on.

1. **Create a project.** In the [Google Cloud Console](https://console.cloud.google.com/),
   create a project, e.g. "Jobber Shortcuts Publishing".
2. **Enable the API.** In that project, search for **Chrome Web Store API** and
   click **Enable**.
3. **Set up OAuth.** Go to **APIs & Services > OAuth consent screen**:
   - User type: **External**. Fill in the app name and your email for the two
     contact fields. Skip scopes.
   - Add your own email under **Test users**.
   - Then click **Publish app** to move it from "Testing" to "In production".
     **Don't skip this:** while it's in Testing, Google expires the refresh
     token after 7 days and uploads start failing. You don't need Google's
     verification for an app only you use; just click through the warning.

   Next go to **Credentials > Create credentials > OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URI: `https://developers.google.com/oauthplayground`
   - Save the **Client ID** and **Client secret**. These become
     `CWS_CLIENT_ID` and `CWS_CLIENT_SECRET`.
4. **Open the OAuth Playground** at https://developers.google.com/oauthplayground.
   Click the gear icon (top right), tick **Use your own OAuth credentials**, and
   paste in the client ID and secret.
5. **Get the refresh token.** In the left box, type the scope
   `https://www.googleapis.com/auth/chromewebstore` and click **Authorize APIs**.
   Approve the consent screen (click through the "unverified app" warning), then
   click **Exchange authorization code for tokens**. Copy the **Refresh token**.
   That's `CWS_REFRESH_TOKEN`.
6. **Find your publisher ID.** In the
   [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole),
   open your publisher's **Settings**. The publisher ID is listed there, and is
   also the ID in the dashboard's URL. That's `CWS_PUBLISHER_ID`. It's your
   account ID, not the extension ID.

### Firefox Add-ons

1. Sign in to AMO and open https://addons.mozilla.org/developers/addon/api/key/.
   Generate credentials. The **JWT issuer** is `AMO_JWT_ISSUER`, and the
   **JWT secret** is `AMO_JWT_SECRET`.

### Test it

Once all six secrets are added, run the action manually (Actions > Publish
extensions > Run workflow). Each store job either submits the current version
or fails with a clear message. "Missing secret" means a secret is missing or
misnamed. A failure saying the version already exists means that version was
already uploaded, so bump the version and try again.

## Releasing a new version

1. Make the change in `jobber-keyboard-shortcuts.js` (and the same change in
   `jobber-keyboard-shortcuts-manual-install.js`).
2. Bump the version in all five places listed in `.claude/CLAUDE.md`.
3. Run `./build-all.sh` and commit everything it touches.
4. Push to `main`. The action handles both stores.

## If something goes wrong

- **Chrome says the item is in review.** The store won't take a new upload
  while an earlier one is still under review. Wait for that review to finish,
  then rerun the action manually.
- **Refresh token stopped working.** Most likely the OAuth app is still in
  Testing mode (see Chrome step 3), or you revoked access. Repeat steps 3 to 5
  and update `CWS_REFRESH_TOKEN`.
- **Uploading by hand** still works:
  [Chrome dashboard](https://chrome.google.com/webstore/devconsole) (item
  `kapnepnhinjagclnnlgfpmpcnpkidlpo`, upload the `.zip`) and
  [AMO](https://addons.mozilla.org/developers/addon/jobber-keyboard-shortcuts/versions/submit/)
  (upload the `.xpi`, then the source `.zip` when prompted).
