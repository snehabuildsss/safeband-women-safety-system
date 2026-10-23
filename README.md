# SafeBand — Women & Child Safety Monitoring System

SafeBand is a web-based safety monitoring prototype designed to demonstrate threat-risk assessment, voice-triggered alerts, and location tracking through an interactive dashboard.

🔗 **Live Demo:** [View SafeBand](https://safeband-women-safety-system.vercel.app/)

## Features

- **Threat Simulation:** Simulates struggle, scream, and combined-threat scenarios using configurable risk-scoring logic.
- **Voice Recognition:** Uses browser-based speech recognition to detect configured trigger phrases.
- **Location Tracking:** Retrieves browser geolocation with user permission and supports map-based location viewing.
- **Incident Management:** Displays and manages simulated safety incidents through the dashboard and incident history.
- **Interactive Dashboard:** Includes emergency contacts, device monitoring, and tracking interfaces.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Browser APIs:** Speech Recognition, Geolocation
- **Mapping:** Google Maps integration
- **Tools & Deployment:** Git, GitHub, Vercel

## How It Works

1. The user selects a threat scenario or triggers a configured voice phrase.
2. The application evaluates the event using its risk-scoring logic.
3. The interface displays the resulting threat level and incident information.
4. The tracking interface can retrieve the user's location when permission is granted.

## Run Locally

```bash
git clone https://github.com/snehabuildsss/safeband-women-safety-system.git
cd safeband-women-safety-system
npm install
npm run dev
```

Open the local URL displayed in your terminal.

## Project Limitations

SafeBand is currently a prototype. Threat scenarios use simulated inputs; a trained scream-detection model, physical wearable hardware, and real emergency calls/SMS are not implemented. Browser speech recognition depends on browser support and permissions. Google Maps may require API-key configuration.

## Future Improvements

- Integrate a real audio-classification model for scream detection.
- Connect wearable sensors and embedded hardware.
- Add secure backend services for persistent incident storage and emergency notifications.
- Implement automated testing and evaluate threat-detection performance.

## Author

**Sneha Sharma**

[GitHub](https://github.com/snehabuildsss)
