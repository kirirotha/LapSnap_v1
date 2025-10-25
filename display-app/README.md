# SnapLaps Display App

A clean, simple display application for showing recent lap times.

## Features

- **Dashboard**: Placeholder for future analytics and statistics
- **Recent Laps**: Real-time table showing athlete names, plate numbers, and lap times
- Auto-refreshes every 5 seconds

## Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your API URL:
```
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Production Build

1. Update `.env` with your production API URL:
```
VITE_API_URL=https://your-api-domain.com/api
```

2. Build the app:
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

3. Preview the production build locally:
```bash
npm run preview
```

## Deployment

The `dist/` folder contains static files that can be deployed to any web server or hosting service:

- **Netlify**: Drag and drop the `dist` folder or connect your git repository
- **Vercel**: Connect your repository or use the Vercel CLI
- **GitHub Pages**: Push the `dist` folder contents to a `gh-pages` branch
- **Traditional Hosting**: Upload the `dist` folder contents via FTP/SFTP
- **AWS S3**: Upload to an S3 bucket configured for static website hosting
- **Cloudflare Pages**: Connect your repository or use direct upload

### Environment Variables for Deployment

Make sure to set the `VITE_API_URL` environment variable in your hosting platform's settings to point to your production API.

**Note**: Vite environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

## API Requirements

The app expects the following API endpoint:

- `GET /api/laps` - Returns an array of lap objects with:
  - `id`: number
  - `athleteId`: number (optional)
  - `plateNumber`: string (optional)
  - `lapTime`: number (in milliseconds)
  - `timestamp`: string
  - `athletes`: object with `firstName` and `lastName` (optional)

## Tech Stack

- React 19
- TypeScript
- Vite
- Axios
