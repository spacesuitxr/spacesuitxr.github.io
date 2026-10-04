# spacesuitxr.com: setup

A static site with no build step: plain HTML, one stylesheet and one script. Every file in this repo is published as-is.

| Path | Page |
|---|---|
| `/` | Home: the one-sentence promise, what the alpha does, links |
| `/alpha/` | The page SpaceSuit View's **About > Send feedback** opens: feedback form, quick start, controls, limitations |
| `/privacy/` | The privacy statement for the app and the site |
| `/guide/SpaceSuit-View-Guide.pdf` | The 8-page guide (source: QuestSplat `content/guide/`) |

Preview locally:

```
python -m http.server 8765 --directory C:/SpaceSuitXR/spacesuitxr.com
```

## 1. The Google Form (feedback goes here)

Until this is done, the form opens a filled-in email to spacesuitxr@gmail.com instead, so it already works.

1. Signed in as **spacesuitxr@gmail.com**, create a form at forms.google.com named "SpaceSuit View feedback".
2. Add seven questions, in this order. Make every one **Short answer** (Details: **Paragraph**) and **not required**:
   the page checks what's required, and a Google multiple-choice question would reject any wording that doesn't
   match exactly.
   1. Report
   2. Headset
   3. App version
   4. Scene
   5. Scene size
   6. Details
   7. Contact
3. Settings: turn **off** "Collect email addresses" and "Limit to 1 response" (both would require a Google sign-in,
   which breaks posting from the page).
4. Responses > **Link to Sheets**, so reports land in a spreadsheet.
5. Get the field ids: menu (⋮) > **Get pre-filled link**, type `x` in every field, select **Get link** and copy it.
   It looks like `https://docs.google.com/forms/d/e/<FORM_ID>/viewform?usp=pp_url&entry.123=x&entry.456=x...`
6. In `assets/feedback.js`, set:
   - `action` to `https://docs.google.com/forms/d/e/<FORM_ID>/formResponse` (`formResponse`, not `viewform`);
   - each `entries` value to its `entry.<number>`, in the question order above.
7. Test from the deployed page, then check that the row appears in the Sheet.

## 2. GitHub Pages

1. Signed in as **spacesuitxr** on GitHub, create a public repository named `spacesuitxr.github.io`.
2. Push this folder to it:
   ```
   git remote add origin https://github.com/spacesuitxr/spacesuitxr.github.io.git
   git push -u origin main
   ```
3. Repository **Settings > Pages**: Source "Deploy from a branch", branch `main`, folder `/ (root)`.
   The `CNAME` file already says `spacesuitxr.com`.
4. Recommended first: account **Settings > Pages > Add a domain** to verify `spacesuitxr.com`. GitHub shows a TXT
   record to add at Porkbun. Verifying stops anyone else from claiming the domain on GitHub.

## 3. DNS at Porkbun

Domain management for spacesuitxr.com > **DNS**. Delete Porkbun's default parking records (the ALIAS/CNAME to
`pixie.porkbun.com`), then add:

| Type | Host | Answer |
|---|---|---|
| A | (blank) | 185.199.108.153 |
| A | (blank) | 185.199.109.153 |
| A | (blank) | 185.199.110.153 |
| A | (blank) | 185.199.111.153 |
| AAAA | (blank) | 2606:50c0:8000::153 |
| AAAA | (blank) | 2606:50c0:8001::153 |
| AAAA | (blank) | 2606:50c0:8002::153 |
| AAAA | (blank) | 2606:50c0:8003::153 |
| CNAME | www | spacesuitxr.github.io |

Then, back in the repository's Pages settings, wait for the DNS check to pass and tick **Enforce HTTPS**. The
certificate can take up to an hour. Check https://spacesuitxr.com/alpha/ in the Quest Browser.

## Keeping it true

- The limitations and quick start mirror QuestSplat's `tasks/alpha-known-limitations.md` and
  `tasks/alpha-quick-start.md`, and the privacy page mirrors `tasks/privacy-facts.md`. Update the site when those
  change, and never state more than the committed evidence.
- After a new guide PDF is rendered in QuestSplat, copy it to `guide/`.
- Never commit keys: this folder sits next to `C:\SpaceSuitXR\keys`, which must stay outside every repository.
