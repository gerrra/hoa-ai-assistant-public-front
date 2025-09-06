# HOA AI Assistant - Public Frontend

Public React/Vite frontend for HOA AI Assistant - allows residents to ask questions about HOA documents.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Production Build

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

### Docker

```bash
docker build -t hoa-public-front .
docker run -p 80:80 hoa-public-front
```

## Environment Variables

- `.env.development` - Development settings
- `.env.production` - Production settings

Key variable: `VITE_API_BASE_URL` - Backend API URL

## Features

- Ask questions about HOA documents
- Clean, responsive UI
- Real-time AI-powered answers
