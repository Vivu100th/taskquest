# Frontend Customization Guide

## 1. Changing Colors (Theme)
All colors are defined in `frontend/src/app/globals.css` as CSS variables using **OKLCH** color space (for better vibrancy and accessibility).

### Key Variables
| Variable | Usage | Current Value (Example) |
|----------|-------|-------------------------|
| `--primary` | Main buttons, active elements | `oklch(0.6 0.15 300)` (Purple) |
| `--background` | Page background | `oklch(0.98 0.01 240)` (Off-white) |
| `--pastel-pink` | Task background (Pink) | `oklch(0.9 0.05 350)` |
| `--pastel-mint` | Task background (Mint) | `oklch(0.9 0.05 160)` |

### How to Change
1. Open `frontend/src/app/globals.css`.
2. Locate the `:root` block (Light Mode) or `.dark` block (Dark Mode).
3. Edit the `oklch(...)` values.
   - Use a tool like [oklch.com](https://oklch.com/) to pick new colors.

## 2. In-App Customization (User Feature)
To allow end-users to change themes (e.g. "Pink Mode"):
1. **Define a class** in `globals.css`:
   ```css
   .theme-pink {
     --primary: oklch(0.8 0.1 350); /* Pink Primary */
     --ring: oklch(0.8 0.1 350);
   }
   ```
2. **Toggle the class** on the `<body>` tag using React state or a Context Provider.

## 3. Fonts
To change the font:
1. Open `frontend/src/app/layout.tsx`.
2. Import your desired font from `next/font/google`.
3. Apply it to the `<body>` className.

## 4. Animations
To adjust animation speed:
- Edit `.animate-pulse-slow` in `globals.css`.
- Change `3s` to `5s` for slower, or `1s` for faster.
