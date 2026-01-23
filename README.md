# Substance and Hype Portfolio Site

**Live Site:** https://portfolio.substanceandhype.com/

## Technology Stack

- **React** (v19) - UI framework for component-based architecture
- **TypeScript** - Type-safe JavaScript for robust code
- **Vite** (v7) - Fast build tool and development server
- **Three.js** - 3D graphics library for WebGL visualizations
- **React Compiler** - Babel plugin for optimized React rendering

## Features

- Interactive 3D backgrounds powered by Three.js
- Smooth scroll-based animations and transitions
- Lightbox component for media viewing
- Responsive design with custom CSS styling
- TypeScript for type safety throughout the codebase
- ESLint configured for code quality

## Project Structure

```
src/
├── components/
│   ├── Background.tsx      # 3D background component with Three.js
│   ├── Lightbox.tsx        # Image lightbox component
│   ├── ScrollManager.tsx   # Scroll event management and animations
│   ├── ThreeDee.tsx        # 3D graphics
│   └── helpers.tsx         # Utility functions
├── App.tsx                 # Main application component
├── main.tsx                # Entry point
└── assets/                 # Static assets and images
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sh-portfolio26
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

### Build

Create an optimized production build:
```bash
npm run build
```

### Lint

Check code quality with ESLint:
```bash
npm run lint
```

### Preview

Preview the production build locally:
```bash
npm run preview
```

## Configuration

- **TypeScript:** [tsconfig.json](tsconfig.json) - Compiler options
- **Vite:** [vite.config.ts](vite.config.ts) - Build and dev server configuration
- **ESLint:** [eslint.config.js](eslint.config.js) - Code quality rules
- **Port:** Configurable via `APP_PORT` environment variable (default: 3000)

## Key Dependencies

- `three` (v0.182) - 3D graphics library
- `react` & `react-dom` (v19.2) - React framework
- `normalize.css` (v8.0.1) - CSS reset and normalization

## Dev Dependencies

- `@vitejs/plugin-react` - React plugin for Vite
- `babel-plugin-react-compiler` - React compiler optimization
- `typescript-eslint` - TypeScript linting support
- Type definitions for React, Three.js, and Node.js

## Licensing

The software in this repository is licensed under the MIT License; see [LICENSE.TXT](LICENSE.TXT) for terms and conditions.

All non-software content (including images, photographs, screenshots, and prose) is © 2026 Kevin K. Lee or the respective copyright holders. Use of such content requires prior written permission from the copyright holder.
