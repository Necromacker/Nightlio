# 🚀 Quick Start - Get Nightlio Running

## Prerequisites

- Node.js v18 or higher
- npm or yarn

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/shirsakm/nightlio.git
cd nightlio

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

That's it! Open http://localhost:5173 in your browser.

## What You Get

- 🌐 **Web Interface**: http://localhost:5173
- ⚡ **Fast Development**: Hot module replacement with Vite
- 🎨 **Modern UI**: Beautiful, responsive design

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist` directory and can be deployed to any static hosting service.

## Next Steps

1. **Customize the application** to your needs
2. **Connect to your backend API** if needed (update `src/services/api.js`)
3. **Deploy** to your preferred hosting service (Vercel, Netlify, GitHub Pages, etc.)

## Troubleshooting

### Port already in use?

Change the port in `vite.config.js`:

```js
server: {
  host: true,
  port: 3000, // Change to your preferred port
}
```

### Need help?

- 🐛 [Create an Issue](https://github.com/shirsakm/nightlio/issues)

---

**Tip**: Start building your mood tracking habit! 🌙
