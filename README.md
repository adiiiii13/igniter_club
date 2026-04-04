<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-r183-000000?style=for-the-badge&logo=three.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white" />
</p>

# 🔥 Igniter Club — GMIT

> **Where Innovation Begins.** The official website for Igniter Club at GMIT — a premium, interactive web experience built to showcase the club's mission of building tomorrow's tech leaders through hackathons, creative collaboration, and hands-on innovation.

---

## ✨ Features

- **🎬 Parallax Intro** — A cinematic full-screen parallax welcome experience powered by GSAP ScrollSmoother & ScrollTrigger
- **🎞️ Scroll-Scrubbed Background** — Canvas-based frame-by-frame animation that responds to scroll position for an immersive visual effect
- **🧊 Interactive 3D Models** — Zoom, rotate, and explore 3D models rendered with React Three Fiber & Drei
- **📄 Multi-Page Navigation** — Seamless client-side routing via React Router DOM
- **🌙 Dark Theme** — A premium glassmorphism-inspired dark UI with custom gradients and noise textures
- **💫 Micro-Animations** — Smooth entrance & hover animations powered by Framer Motion
- **📱 Fully Responsive** — Looks great on every screen size

---

## 🗺️ Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Intro** | Cinematic parallax welcome screen |
| `/home` | **Landing** | Hero, About, Events & Join sections |
| `/communities` | **Communities** | Club community groups & teams |
| `/bikini-special` | **Bikini Special** | Special event page with 3D model showcase |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Bundler** | Vite 6 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 11 + GSAP |
| **3D Rendering** | Three.js (r183) + React Three Fiber + Drei |
| **Routing** | React Router DOM 7 |

---

## 📂 Project Structure

```
igniter_club/
├── public/
│   ├── intro/              # Parallax intro HTML assets
│   ├── model/              # 3D model files & textures
│   └── model2/             # Additional 3D model assets
├── src/
│   ├── components/
│   │   ├── AboutSection.jsx
│   │   ├── BackgroundScrubber.jsx
│   │   ├── EventsSection.jsx
│   │   ├── Footer.jsx
│   │   ├── HeroSection.jsx
│   │   ├── JoinSection.jsx
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── IntroPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── CommunitiesPage.jsx
│   │   └── BikiniSpecialPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── frame/                  # Scroll-scrub animation frames
├── Parallax-website-main/  # GSAP parallax intro source
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/adiiiii13/igniter_club.git

# Navigate into the project
cd igniter_club

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Avatar Upload Setup (Cloudinary)

For student profile image upload, add these variables to `.env.local`:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Notes:
- Use an **unsigned upload preset**.
- Do **not** put Cloudinary API secret in frontend env files.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## 🎨 Design Philosophy

The site follows a **dark luxury aesthetic** with:

- **Glassmorphism** — Frosted-glass panels with backdrop blur effects
- **Flame gradient palette** — Custom `ignite-*` color tokens (warm oranges, ambers, and reds)
- **Noise texture overlay** — Subtle grain for a premium tactile feel
- **Cinematic scroll experience** — Frame-by-frame canvas scrubbing tied to scroll position
- **Fluid typography** — Responsive type scale from mobile to desktop using Outfit & Inter fonts

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for **Igniter Club — GMIT** internal use. All rights reserved.

---

<p align="center">
  Built with 🔥 by <strong>Igniter Club, GMIT</strong>
</p>
