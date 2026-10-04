// Feedback form on /alpha/.
//
// The page has its own form; on submit it posts the answers to a Google Form owned by
// spacesuitxr@gmail.com, whose responses go to a Google Sheet. Google Forms accepts a plain POST to
// .../formResponse but sends no CORS headers, so the request is "no-cors" and its result cannot be
// read: a network failure is reported, anything else is treated as sent.
//
// Until GOOGLE_FORM.action is filled in (see SETUP.md), the form falls back to opening an email to
// FALLBACK_EMAIL with the same answers, so the in-app "Send feedback" button works from day one.

const GOOGLE_FORM = {
  // e.g. "https://docs.google.com/forms/d/e/<form id>/formResponse"
  action: "https://docs.google.com/forms/d/e/1FAIpQLSfbkOEj-P07GhPJEtjNfYr9FGnzAH3jYsqqFH_hZgk7UD2y6Q/formResponse",
  // The entry.<number> name of each question, read from the form's pre-filled link (SETUP.md).
  entries: {
    kind: "entry.1234782818",
    headset: "entry.1856537078",
    version: "entry.2113854210",
    scene: "entry.704731956",
    size: "entry.2103048249",
    details: "entry.930076155",
    contact: "entry.373773156",
  },
};

const FALLBACK_EMAIL = "spacesuitxr@gmail.com";

const LABELS = {
  kind: "Report",
  headset: "Headset",
  version: "App version",
  scene: "Scene",
  size: "Scene size",
  details: "What happened",
  contact: "Contact",
};

function answers(form) {
  const data = new FormData(form);
  const out = {};
  for (const key of Object.keys(LABELS)) out[key] = (data.get(key) || "").toString().trim();
  return out;
}

function show(status, kind, html) {
  status.className = "status " + kind;
  status.innerHTML = html;
  status.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function mailtoUrl(a) {
  const subject = "SpaceSuit View feedback: " + (a.kind || "report");
  const body = Object.keys(LABELS)
    .map((k) => LABELS[k] + ": " + (a[k] || "-"))
    .join("\n");
  return "mailto:" + FALLBACK_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

async function send(a) {
  const params = new URLSearchParams();
  for (const [key, entry] of Object.entries(GOOGLE_FORM.entries)) {
    if (entry && a[key]) params.append(entry, a[key]);
  }
  await fetch(GOOGLE_FORM.action, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedback");
  if (!form) return;
  const status = document.getElementById("feedback-status");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const a = answers(form);

    if (!GOOGLE_FORM.action) {
      window.location.href = mailtoUrl(a);
      show(status, "ok",
        "Your email app should open with your report filled in. If it doesn't, send it to " +
        '<a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + "</a>.");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    try {
      await send(a);
      form.reset();
      show(status, "ok", "<b>Thank you, it's sent.</b> We read every report.");
    } catch (err) {
      show(status, "err",
        "It didn't send; check the headset's connection and try again, or " +
        '<a href="' + mailtoUrl(a) + '">send it by email</a> instead.');
    } finally {
      button.disabled = false;
      button.textContent = "Send feedback";
    }
  });
});
