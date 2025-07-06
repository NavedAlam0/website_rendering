# Local Testing Guide

## Prerequisites
- Node.js installed
- GitHub repository set up
- GitHub Personal Access Token

## Step 1: Set up Environment Variables

Create a `.env` file in your project root:
```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name

# Server Configuration
PORT=4000
```

## Step 2: Test Backend Only

### Start the backend server:
```bash
npm start
```

### Test API endpoints:
```bash
# Test video generation
curl -X POST http://localhost:4000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.example.com"}'

# Check job status (replace JOB_ID with actual job ID)
curl http://localhost:4000/api/job/JOB_ID

# Download video (replace JOB_ID with actual job ID)
curl http://localhost:4000/api/download/JOB_ID
```

## Step 3: Set up Frontend

### Install frontend dependencies:
```bash
cd frontend
npm install
```

### Create frontend environment file:
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:4000
```

### Start frontend:
```bash
npm start
```

## Step 4: Test Complete System

### Test Flow:
1. **Open frontend:** http://localhost:3000
2. **Enter URL:** https://www.example.com
3. **Click Generate Video**
4. **Monitor progress** in real-time
5. **Download video** when complete

### Test Multiple Videos:
1. **Open multiple browser tabs**
2. **Generate videos simultaneously**
3. **Check GitHub Actions** for parallel processing

## Step 5: Test GitHub Actions Integration

### Verify GitHub Actions:
1. **Check Actions tab** in your GitHub repository
2. **Monitor workflow runs**
3. **Verify video downloads** from releases

### Test Fallback Mode:
1. **Remove GitHub token** from .env
2. **Restart backend**
3. **Test video generation** (should use local rendering)

## Step 6: Debug Common Issues

### Backend Issues:
```bash
# Check if server is running
curl http://localhost:4000/

# Check logs
npm start

# Test with different URLs
curl -X POST http://localhost:4000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.google.com"}'
```

### Frontend Issues:
```bash
# Check if React app is running
curl http://localhost:3000/

# Check browser console for errors
# Check network tab for API calls
```

### GitHub Actions Issues:
- Check Actions tab in repository
- Verify workflow file exists
- Check token permissions
- Monitor workflow logs

## Step 7: Performance Testing

### Test Single Video:
- Time from request to completion
- Monitor memory usage
- Check video quality

### Test Multiple Videos:
- Generate 3-5 videos simultaneously
- Monitor GitHub Actions parallel processing
- Check system performance

### Test Different Websites:
- Simple websites (example.com)
- Complex websites (github.com, google.com)
- Websites with anti-bot protection

## Expected Results

### Successful Test:
✅ **Backend starts** without errors  
✅ **Frontend loads** at http://localhost:3000  
✅ **Video generation** starts when URL submitted  
✅ **Progress updates** in real-time  
✅ **GitHub Actions** workflow triggers  
✅ **Video downloads** successfully  
✅ **Multiple videos** process in parallel  

### Common Issues & Solutions:

#### Issue: "GitHub token invalid"
**Solution:** Check token permissions and repository access

#### Issue: "Workflow not triggering"
**Solution:** Verify workflow file exists in `.github/workflows/`

#### Issue: "Frontend can't connect to backend"
**Solution:** Check CORS settings and API URL

#### Issue: "Video generation fails"
**Solution:** Check GitHub Actions logs for errors

## Ready for Production

Once local testing passes:
1. ✅ **Push to GitHub**
2. ✅ **Deploy backend** to Railway/Render
3. ✅ **Deploy frontend** to Vercel/Netlify
4. ✅ **Update environment variables**
5. ✅ **Test production system**

Your system is ready for production deployment! 🚀 