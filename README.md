# 💍 Manish & Dipty — Digital Wedding Invitation

An interactive, responsive digital wedding invitation web application built with vanilla web technologies, dynamic canvas animations, and automated RSVP tracking.

🔗 **Live Preview:** https://manish-weds-dipty.netlify.app/

📊 **RSVP Responses:**
(https://docs.google.com/spreadsheets/d/1q61EghAwVkNWMSJwz7qYcFAOH852ewvC79Ky3dobfE8/edit?usp=drive_web&ouid=106554714765592406699)

---

## ✨ Features

- **✉️ Interactive Envelope:** Tap-to-open smooth envelope stage with floating flower/leaf canvas shower.
- **✨ Scratch to Reveal:** Interactive HTML5 Canvas scratch card to reveal the event date.
- **⏳ Live Countdown:** Dynamic real-time timer counting down to the D-Day.
- **📍 Event Info & Directions:** Multi-event details (Mehndi, Haldi, Wedding) with direct Google Maps navigation buttons.
- **📸 Couple's Gallery:** Image slideshow and memory grid highlighting the couple's journey.
- **🎵 Cross-Platform Audio:** Cross-device audio player with initial tap-unlock logic (iOS/Android compatible).
- **💌 Live RSVP System:** Inline RSVP forms connected to Google Sheets for real-time tracking.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+ Vanilla)
- **Animations:** HTML5 Canvas API (Petal shower & Scratch Card), AOS (Animate On Scroll)
- **Backend / Database:** Google Apps Script + Google Sheets API (for RSVP collection)
- **Typography:** [Rouge Script](https://fonts.google.com/specimen/Rouge+Script), [Raleway](https://fonts.google.com/specimen/Raleway), [Lato](https://fonts.google.com/specimen/Lato)
- **Hosting & Deployment:** [Netlify](https://netlify.com)

---

## 📂 Project Structure

```text
.
├── css/
│   └── style.css          # Main styling & responsive layout
├── js/
│   ├── config.js         # Global configs (Wedding Date, Google Script URL)
│   └── main.js           # Envelope, Scratch canvas, Audio, and RSVP logic
├── assets/               # Images, audio files, and brand icons
├── index.html            # Primary application entry point
└── README.md             # Project documentation
