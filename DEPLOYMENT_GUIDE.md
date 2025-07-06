# Complete Deployment Guide

## Overview
This guide will help you deploy the complete Website Video Generator system with frontend and backend.

## Architecture
```
Frontend (Vercel/Netlify) → Backend API (Railway/Render) → GitHub Actions → Video
```

## Step 1: Deploy Backend API

### Option A: Railway (Recommended)
1. **Push backend to GitHub:**
   ```bash
   # In your backend directory
   git add .
   git commit -m "Add GitHub Actions integration"
   git push origin main
   ```

2. **Deploy to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the repository
   - Railway will auto-detect Node.js

3. **Set Environment Variables in Railway:**
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_OWNER=your_github_username
   GITHUB_REPO=your_repository_name
   PORT=4000
   ```

4. **Get your API URL:**
   - Railway will provide a URL like: `https://your-app.railway.app`

### Option B: Render
1. **Deploy to Render:**
   - Go to [Render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`

2. **Set Environment Variables in Render:**
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_OWNER=your_github_username
   GITHUB_REPO=your_repository_name
   PORT=4000
   ```

## Step 2: Deploy Frontend

### Option A: Vercel (Recommended)
1. **Create frontend directory:**
   ```bash
   mkdir frontend
   cd frontend
   # Copy the frontend files we created
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Set build command: `npm run build`
   - Set output directory: `build`

3. **Set Environment Variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

### Option B: Netlify
1. **Deploy to Netlify:**
   - Go to [Netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/build`

2. **Set Environment Variables in Netlify:**
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

## Step 3: Test the Complete System

### Test Frontend → Backend → GitHub Actions
1. **Open your frontend URL**
2. **Enter a website URL** (e.g., `https://www.example.com`)
3. **Click "Generate Video"**
4. **Monitor progress** in real-time
5. **Download the video** when complete

### Test Multiple Videos
1. **Open multiple browser tabs**
2. **Generate videos simultaneously**
3. **Verify parallel processing** in GitHub Actions

## Step 4: Custom Domain (Optional)

### Frontend Domain
1. **Vercel/Netlify:** Add custom domain in dashboard
2. **Update DNS:** Point domain to Vercel/Netlify

### Backend Domain
1. **Railway/Render:** Add custom domain in dashboard
2. **Update frontend:** Change `REACT_APP_API_URL` to new domain

## Step 5: Monitoring & Analytics

### GitHub Actions Monitoring
- Check Actions tab in your repository
- Monitor workflow runs and failures
- Set up notifications for failures

### Backend Monitoring
- Railway/Render provide built-in monitoring
- Set up alerts for errors
- Monitor API response times

### Frontend Analytics
- Add Google Analytics to track usage
- Monitor user interactions
- Track video generation success rates

## Environment Variables Summary

### Backend (.env or Railway/Render)
```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
PORT=4000
```

### Frontend (Vercel/Netlify)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## Cost Estimation

### Free Tier Limits
- **GitHub Actions:** 2,000 minutes/month (public repos)
- **Railway:** $5/month after free tier
- **Vercel:** Free tier available
- **Netlify:** Free tier available

### Typical Usage
- **10 videos/day:** ~$5-10/month total
- **50 videos/day:** ~$15-25/month total
- **100+ videos/day:** Consider paid plans

## Troubleshooting

### Common Issues
1. **CORS errors:** Ensure backend allows frontend domain
2. **GitHub token issues:** Check token permissions
3. **Video generation fails:** Check GitHub Actions logs
4. **Frontend can't connect:** Verify API URL

### Debug Steps
1. **Check backend logs** in Railway/Render
2. **Check GitHub Actions** in repository
3. **Test API directly** with curl/Postman
4. **Check browser console** for frontend errors

## Security Considerations

### API Security
- Add rate limiting to prevent abuse
- Implement API key authentication
- Add request validation
- Monitor for suspicious activity

### GitHub Token Security
- Use minimal required permissions
- Rotate tokens regularly
- Monitor token usage
- Set up alerts for unusual activity

## Scaling Considerations

### High Traffic
- Implement queue system for video requests
- Add caching for completed videos
- Use CDN for video delivery
- Consider multiple backend instances

### Cost Optimization
- Monitor GitHub Actions usage
- Optimize video rendering parameters
- Implement video compression
- Cache frequently requested videos

Your complete system is now ready for production use! 🚀 