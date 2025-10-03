# Anelia Designs | Akshaya Constructions — Live Demo & Source

_A design-minded construction studio meets clean engineering — this repo contains the public landing site used to showcase portfolios, packages, and capture leads._

<p align="center">
   <img src="assets/animated-logo.svg" alt="Anelia animated logo" width="420" />
</p>

Welcome! This repository is a handcrafted, performance-minded static site built to demonstrate modern web design for a boutique construction + interiors studio. The README below is intentionally playful, precise, and practical — just like the website.

## ✨ Key Features (short)

- Pixel-perfect responsive layout with performance-first choices.
- Accessible forms (lead capture + contact) integrated with Web3Forms for secure email delivery.
- True infinite projects carousel with touch/drag + wheel support and seamless looping.
- Modular CSS and vanilla JS — easy to customize without framework lock-in.
- Tiny animated previews embedded in this repo to explain features visually.

<p align="center">
   <img src="assets/animated-carousel.svg" alt="Animated carousel preview" width="560" />
</p>

### What makes this README unique

- Live animated artwork included as SVGs in `/assets` (logo, carousel, form). They are light, editable, and give the README motion without heavy GIFs.
- Clear instructions for local dev, plus quick tips to adapt the lead-capture forms safely.
- A tiny design-system mindset: variables in `style.css` are used throughout for quick brand changes.

## 🛠 Stack & Patterns

- Vanilla HTML/CSS/JS — intentionally minimal dependency footprint.
- Progressive enhancement: features work without JS (forms degrade gracefully), but JS adds polish (carousel, modals).
- Forms handled by Web3Forms (serverless) — update `access_key` values in the HTML to connect to your account.

## 📦 Folder Structure

```
anelia-designs-fixed-dropdowns/
├── index.html
├── style.css
├── app.js
├── backup.js
├── dup.js
├── assets/
│   ├── logo.jpg
│   ├── hero_background.mp4
│   ├── ... (project images)
```

## 🧪 Run locally (fast)

```powershell
git clone <repo>
cd anelia-designs-fixed-dropdowns
python -m http.server 8000
# then open http://localhost:8000
```

Pro tip: Use a device toolbar in DevTools to test touch/drag behavior for the carousel.

## ✨ Customization

- **Branding**: Update `assets/logo.jpg` and hero video/image as needed.
- **Packages & Services**: Edit the relevant sections in `index.html` for your offerings.
- **Contact/Lead Forms**: Web3Forms keys are set in the HTML. Change to your own keys for production.
- **Fonts**: Uses Raleway, PT Serif, and Zalando Sans SemiExpanded (add font file to `fonts/` if needed).

## 💡 Accessibility & Best Practices

- All forms use proper labels and ARIA attributes.
- Keyboard navigation and focus styles are enabled.
- Color contrast and font sizes are tuned for readability.

## 🎞️ Visual Previews (animated)

Logo animation (SVG)

<p align="center"><img src="assets/animated-logo.svg" width="420" alt="animated logo"/></p>

Carousel concept (SVG)

<p align="center"><img src="assets/animated-carousel.svg" width="560" alt="animated carousel"/></p>

Form & submit micro-UX

<p align="center"><img src="assets/animated-form.svg" width="480" alt="animated form"/></p>

## 📬 Contact & Support

- **Email**: sales@aneliadesign.com
- **Phone**: +91 91088 67676
- **Social**: Instagram — [@aneliadesign](https://www.instagram.com/aneliadesign)

Need help customizing the forms or integrating with your own Web3Forms account? Open an issue and include your `access_key` placeholder and desired email template.

## 🏆 Credits & license

Built with care by [Harsha Vallamkonda](https://www.linkedin.com/in/harsha-vallamkonda-706a09190/).

Licensed for use and modification. If you publish this template, please retain credit in `README.md`.

---

_Made with motion, restraint, and a little architect's obsession for detail._
