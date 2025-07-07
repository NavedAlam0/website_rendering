require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const GitHubService = require('./githubService');

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

// Initialize GitHub service
let githubService;
try {
    githubService = new GitHubService();
    console.log('GitHub service initialized successfully');
} catch (error) {
    console.error('Failed to initialize GitHub service:', error.message);
    console.log('Falling back to local rendering...');
    githubService = null;
}

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

        // Start video generation
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
app.get('/api/job/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    
    // If using GitHub Actions, check the workflow status
    if (githubService && job.status === 'processing') {
        try {
            const workflowStatus = await githubService.checkWorkflowStatus(jobId);
            
            if (workflowStatus.status === 'completed' && workflowStatus.conclusion === 'success') {
                job.status = 'completed';
                job.progress = 100;
                job.completedAt = new Date();
                jobs.set(jobId, job);
            } else if (workflowStatus.status === 'failed' || workflowStatus.conclusion === 'failure') {
                job.status = 'failed';
                job.error = 'GitHub Actions workflow failed';
                jobs.set(jobId, job);
            }
        } catch (error) {
            console.error('Error checking workflow status:', error);
        }
    }
    
    res.json(job);
});

// Download video
app.get('/api/download/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    console.log(`[DOWNLOAD] Requested jobId: ${jobId}`);
    if (!job || job.status !== 'completed') {
        console.log(`[DOWNLOAD] Job not found or not completed: ${jobId}`);
        return res.status(404).json({ error: 'Video not ready or job not found' });
    }
    // If videoPath is a URL, redirect to it
    if (job.videoPath && job.videoPath.startsWith('http')) {
        console.log(`[DOWNLOAD] Redirecting to public video URL: ${job.videoPath}`);
        return res.redirect(job.videoPath);
    }
    // Otherwise, serve local file (legacy)
    const videoPath = path.join(__dirname, job.videoPath);
    if (!fs.existsSync(videoPath)) {
        console.log(`[DOWNLOAD] Local video file not found: ${videoPath}`);
        return res.status(404).json({ error: 'Video file not found' });
    }
    console.log(`[DOWNLOAD] Serving local file: ${videoPath}`);
    res.download(videoPath, `website-video-${jobId}.mp4`);
});

// Video generation function
async function generateVideo(jobId, url) {
    try {
        const job = jobs.get(jobId);
        if (githubService) {
            // Use GitHub Actions
            console.log(`Starting GitHub Actions video generation for job ${jobId} with URL: ${url}`);
            await githubService.triggerVideoRender(url, jobId, 300);
            // Do not update progress or wait for completion here.
            // The webhook will update the job when the video is ready.
        } else {
            // Fallback to local rendering (original code)
            console.log(`Starting local video generation for job ${jobId} with URL: ${url}`);
            
            // Use local video generator
            const VideoGenerator = require('./backend/videoGenerator');
            const videoGenerator = new VideoGenerator();
            const videoPath = await videoGenerator.generateVideo(url, jobId, 300);
            
            job.status = 'completed';
            job.videoPath = videoPath.replace(__dirname + path.sep, '');
            job.completedAt = new Date();
            jobs.set(jobId, job);
            
            console.log(`Video generated successfully locally for job ${jobId}`);
        }
    } catch (error) {
        console.error(`Error generating video for job ${jobId}:`, error);
        const job = jobs.get(jobId);
        job.status = 'failed';
        job.error = error.message;
        jobs.set(jobId, job);
    }
}

app.post('/api/video-complete', (req, res) => {
    const { jobId, videoUrl } = req.body;
    console.log('--- Webhook called ---');
    console.log('Received payload:', req.body);

    if (!jobId || !videoUrl) {
        console.log('Missing jobId or videoUrl');
        return res.status(400).json({ error: 'Missing jobId or videoUrl' });
    }
    const job = jobs.get(jobId);
    if (!job) {
        console.log(`Job not found for jobId: ${jobId}`);
        return res.status(404).json({ error: 'Job not found' });
    }
    job.status = 'completed';
    job.progress = 100;
    job.videoPath = videoUrl;
    job.completedAt = new Date();
    jobs.set(jobId, job);
    console.log(`Webhook: Video for job ${jobId} is complete!`);
    console.log('Updated job:', job);
    res.json({ success: true });
});

app.post('/api/process', async (req, res) => {
  try {
    const { url, start, end } = req.body;
    const duration = end - start;

    // Trigger GitHub Actions workflow with url and duration
    // (You need to use the GitHub API to dispatch the workflow)
    // Example:
    // await triggerGithubWorkflow({ url, duration });

    res.json({ message: 'Workflow triggered', url, duration });
  } catch (err) {
    res.status(500).json({ error: 'Processing failed.' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (githubService) {
        console.log('GitHub Actions integration enabled');
    } else {
        console.log('Using local video rendering (fallback mode)');
    }
}); 