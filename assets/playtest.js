// Playtest invite requests on /playtest/.
//
// Same approach as feedback.js: the page has its own form and posts the answers to a Google Form owned by
// spacesuitxr@gmail.com (responses go to a Google Sheet). Google Forms sends no CORS headers, so the POST is
// "no-cors" and its result cannot be read: a network failure is reported, anything else is treated as sent.
//
// Until GOOGLE_FORM.action is filled in (SETUP.md, section 2), the form falls back to opening an email to
// FALLBACK_EMAIL with the same answers, so requests can come in from day one.

const GOOGLE_FORM = {
  // e.g. "https://docs.google.com/forms/d/e/<form id>/formResponse"
  action: "https://docs.google.com/forms/d/e/1FAIpQLSdIGR12klaC-juWBEEVqy5PxymH4tjFPuxzz7iiaS7oiligIA/formResponse",
  // The entry.<number> name of each question, read from the form's pre-filled link (SETUP.md).
  entries: {
    name: "entry.872067904",
    email: "entry.1388505321",
    headset: "entry.1862521014",
    cad: "entry.639794350",
    design: "entry.2079261032",
    heard: "entry.169114130",
  },
};

const FALLBACK_EMAIL = "spacesuitxr@gmail.com";

const LABELS = {
  name: "Name",
  email: "Email",
  headset: "Headset",
  cad: "CAD experience",
  design: "What they'd design",
  heard: "Heard about it from",
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
  const subject = "SpaceSuit CAD playtest request: " + (a.name || a.email || "tester");
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
  const form = document.getElementById("invite");
  if (!form) return;
  const status = document.getElementById("invite-status");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const a = answers(form);

    if (!GOOGLE_FORM.action) {
      window.location.href = mailtoUrl(a);
      show(status, "ok",
        "Your email app should open with your request filled in. If it doesn't, send it to " +
        '<a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + "</a>.");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    try {
      await send(a);
      form.reset();
      show(status, "ok", "<b>Thanks, your request is in.</b> We'll email you a private install link.");
    } catch (err) {
      show(status, "err",
        "It didn't send; check your connection and try again, or " +
        '<a href="' + mailtoUrl(a) + '">send it by email</a> instead.');
    } finally {
      button.disabled = false;
      button.textContent = "Request an invite";
    }
  });
});
