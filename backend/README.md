# Website to Video Generator

A simple Node.js application that converts websites into videos using Remotion.

## Features

- 🌐 Input any website URL
- 🎥 Generate videos from websites
- 📊 Real-time progress tracking
- 💾 Download generated videos
- 🎨 Beautiful, modern UI

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000`

3. Enter a website URL and click "Generate Video"

4. Wait for the video to be generated and download it when ready

## API Endpoints

- `POST /api/generate-video` - Start video generation
- `GET /api/job/:jobId` - Check job status
- `GET /api/download/:jobId` - Download generated video

## Project Structure

```
website_ren/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── public/
│   └── index.html     # Frontend interface
├── videos/            # Generated videos (created automatically)
├── uploads/           # Temporary files (created automatically)
└── README.md          # This file
```

## How It Works

1. User enters a website URL
2. Server creates a job and starts video generation
3. Frontend polls for job status and shows progress
4. When complete, user can download the video

## Current Implementation

This project now uses **Remotion's `<IFrame />` component** to generate real videos from websites! The system:

1. **Uses `<IFrame />`** to load websites inside video compositions
2. **Captures website content** using Puppeteer for reliable rendering
3. **Generates actual MP4 videos** from the captured content
4. **Includes smooth animations** and zoom effects

## Features Added

✅ **Remotion Integration**: Uses `<IFrame />` component for website rendering
✅ **Real Video Generation**: Creates actual MP4 videos from websites
✅ **Puppeteer Capture**: Reliable website screenshot capture
✅ **Smooth Animations**: Zoom effects and transitions
✅ **TypeScript Support**: Full type safety for Remotion components

## Project Structure

```
website_ren/
├── server.js              # Main Express server
├── videoGenerator.js      # Video generation service
├── src/
│   ├── WebsiteVideo.tsx   # Remotion composition with IFrame
│   └── index.ts          # Remotion entry point
├── public/
│   └── index.html        # Frontend interface
├── videos/               # Generated videos
├── remotion.config.ts    # Remotion configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## License

MIT License 