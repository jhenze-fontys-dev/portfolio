# 🎨 Public

The `/public` directory hosts **static frontend assets** served directly by Express.

### Structure
- `/css` – Stylesheets
- `/js` – Frontend logic (vanilla JS or bundled)
- `/images` – Static image assets

### Purpose
This folder serves all client-side resources required by your views or SPA frontend.  
Express automatically serves files here via `app.use(express.static('public'))`.
