const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const VideoGenerator = require('./videoGenerator');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(__dirname, 'videos');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
}

// Store video generation jobs
const jobs = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate video from website URL
app.post('/api/generate-video', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Generate unique job ID
        const jobId = uuidv4();
        
        // Create job entry
        jobs.set(jobId, {
            id: jobId,
            url: url,
            status: 'processing',
            progress: 0,
            createdAt: new Date(),
            videoPath: null
        });

        // Start video generation in background
        generateVideo(jobId, url);

        res.json({ 
            jobId, 
            message: 'Video generation started',
            status: 'processing'
        });

    } catch (error) {
        console.error('Error starting video generation:', error);
        res.status(500).json({ error: 'Failed to start video generation' });
    }
});

// Check job status
app.get('/api/job/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
});

// Download video
app.get('/api/download/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job || job.status !== 'completed') {
        return res.status(404).json({ error: 'Video not ready or job not found' });
    }
    
    const videoPath = path.join(__dirname, job.videoPath);
    
    if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ error: 'Video file not found' });
    }
    
    res.download(videoPath, `website-video-${jobId}.mp4`);
});

// Initialize video generator
const videoGenerator = new VideoGenerator();

// Video generation function
async function generateVideo(jobId, url) {
    try {
        const job = jobs.get(jobId);
        
        // Update progress
        job.progress = 10;
        jobs.set(jobId, job);
        
        // Generate video using Remotion with IFrame
        console.log(`Starting video generation for job ${jobId} with URL: ${url}`);
        
        job.progress = 30;
        jobs.set(jobId, job);
        
        // Use Puppeteer method for more reliable website capture
        const videoPath = await videoGenerator.generateVideo(url, jobId, 300);
        //const videoPath = await videoGenerator.generateVideoWithPuppeteer(url, jobId, 300);
        
        job.progress = 100;
        
        // Update job status
        job.status = 'completed';
        job.videoPath = videoPath.replace(__dirname + path.sep, ''); // Make path relative
        job.completedAt = new Date();
        jobs.set(jobId, job);
        
        console.log(`Video generated successfully for job ${jobId}`);
        
    } catch (error) {
        console.error(`Error generating video for job ${jobId}:`, error);
        const job = jobs.get(jobId);
        job.status = 'failed';
        job.error = error.message;
        jobs.set(jobId, job);
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 