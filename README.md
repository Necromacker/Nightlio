<div align="center">

<img src="https://raw.githubusercontent.com/shirsakm/nightlio/refs/heads/dev/public/logo.png" height="60px" />
<h1>Nightlio</h1>

[![GitHub license](https://img.shields.io/github/license/shirsakm/nightlio?style=flat-square)](https://github.com/shirsakm/nightlio/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/shirsakm/nightlio?style=flat-square)](https://github.com/shirsakm/nightlio/stargazers)

**Privacy-first mood tracker and daily journal frontend.** <br />
**A beautiful React application for tracking your mood and journaling your thoughts.**

</div>

![Preview](https://github.com/user-attachments/assets/77f52abc-b4f8-439d-9bb2-772e3996256c)

## Why Nightlio?

Nightlio is a feature-complete, open-source mood tracking and journaling application. It's fully web-based and responsive for use on both desktop and mobile. No ads, no subscriptions, and absolutely no data mining.

### Key Features

- **Rich Journaling with Markdown:** Write detailed notes for every entry using Markdown for formatting, lists, and links.
- **Track Your Mood & Find Patterns:** Log your daily mood on a simple 5-point scale and use customizable tags (e.g., 'Sleep', 'Productivity') to discover what influences your state of mind.
- **Insightful Analytics:** View your mood history on a calendar, see your average mood over time, and track your journaling streak to stay motivated.
- **Gamified Achievements:** Stay consistent with built-in achievements that unlock as you build your journaling habit.
- **Modern React UI:** Built with React 19 and Vite for a fast, responsive experience.

<div align="center">🌙</div>

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shirsakm/nightlio.git
cd nightlio

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist` directory.

<div align="center">🌙</div>

## Development

### Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts (Theme, Config)
├── hooks/          # Custom React hooks
├── services/       # API service layer
├── utils/          # Utility functions
└── views/          # Main view components
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **Recharts** - Charting library
- **React Markdown** - Markdown rendering

<div align="center">🌙</div>

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
