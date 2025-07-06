# GitHub Actions Setup Guide

## Overview
This project uses GitHub Actions for video rendering, providing scalable and cost-effective video generation.

## Setup Steps

### 1. Create GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `write:packages` (Upload packages to GitHub Package Registry)

### 2. Set Environment Variables
Create a `.env` file in your project root:
```env
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
PORT=4000
```

### 3. Push to GitHub
1. Push your code to a GitHub repository
2. Ensure the `.github/workflows/render-video.yml` file is in your repository

### 4. Install Dependencies
```bash
npm install
```

## How It Works

### Flow:
1. **User Request** → Express Server
2. **Server** → GitHub API → Triggers workflow
3. **GitHub Actions** → Renders video using Remotion
4. **Actions** → Creates release with video
5. **Server** → Downloads video → Serves to user

### Benefits:
- ✅ **Scalable** - Multiple videos render in parallel
- ✅ **Cost-effective** - Uses GitHub's free computing resources
- ✅ **Reliable** - GitHub's infrastructure
- ✅ **Fallback** - Falls back to local rendering if GitHub unavailable

## API Endpoints

### Generate Video
```bash
POST /api/generate-video
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Check Status
```bash
GET /api/job/{jobId}
```

### Download Video
```bash
GET /api/download/{jobId}
```

## Troubleshooting

### Common Issues:
1. **GitHub Token Invalid** - Check token permissions
2. **Repository Not Found** - Verify GITHUB_OWNER and GITHUB_REPO
3. **Workflow Not Triggering** - Check workflow file exists in `.github/workflows/`

### Fallback Mode:
If GitHub Actions is unavailable, the system automatically falls back to local rendering.

## Monitoring

Check GitHub Actions tab in your repository to monitor video rendering jobs. 