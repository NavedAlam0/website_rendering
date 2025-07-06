const axios = require('axios');
const fs = require('fs');
const path = require('path');

class GitHubService {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.workflowId = 'render-video.yml';
    
    if (!this.token || !this.owner || !this.repo) {
      throw new Error('Missing required environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
    }
    
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  async triggerVideoRender(url, jobId, duration = 300) {
    try {
      console.log(`Triggering GitHub Actions workflow for job ${jobId}`);
      
      const response = await this.api.post(
        `/repos/${this.owner}/${this.repo}/actions/workflows/${this.workflowId}/dispatches`,
        {
          ref: 'main', // or your default branch
          inputs: {
            url: url,
            jobId: jobId,
            duration: duration.toString()
          }
        }
      );
      
      console.log(`Workflow triggered successfully for job ${jobId}`);
      return { success: true, jobId };
      
    } catch (error) {
      console.error('Error triggering workflow:', error.response?.data || error.message);
      throw new Error(`Failed to trigger workflow: ${error.message}`);
    }
  }

  async checkWorkflowStatus(jobId) {
    try {
      // Get the latest workflow run for this job
      const response = await this.api.get(
        `/repos/${this.owner}/${this.repo}/actions/runs`,
        {
          params: {
            workflow_id: this.workflowId,
            per_page: 10
          }
        }
      );
      
      // Find the run that matches our jobId
      const run = response.data.workflow_runs.find(run => 
        run.inputs?.jobId === jobId
      );
      
      if (!run) {
        return { status: 'not_found' };
      }
      
      return {
        status: run.status,
        conclusion: run.conclusion,
        runId: run.id,
        createdAt: run.created_at,
        updatedAt: run.updated_at
      };
      
    } catch (error) {
      console.error('Error checking workflow status:', error.response?.data || error.message);
      throw new Error(`Failed to check workflow status: ${error.message}`);
    }
  }

  async downloadVideo(jobId, outputPath) {
    try {
      console.log(`Downloading video for job ${jobId}`);
      
      // Get the release for this job
      const releaseResponse = await this.api.get(
        `/repos/${this.owner}/${this.repo}/releases/tags/video-${jobId}`
      );
      
      const release = releaseResponse.data;
      
      // Find the video asset
      const videoAsset = release.assets.find(asset => 
        asset.name === `video-${jobId}.mp4`
      );
      
      if (!videoAsset) {
        throw new Error(`Video asset not found for job ${jobId}`);
      }
      
      // Download the video
      const videoResponse = await axios.get(videoAsset.browser_download_url, {
        responseType: 'stream'
      });
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save the video
      const writer = fs.createWriteStream(outputPath);
      videoResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Video downloaded successfully: ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', reject);
      });
      
    } catch (error) {
      console.error('Error downloading video:', error.response?.data || error.message);
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  async waitForVideoCompletion(jobId, maxWaitTime = 300000) { // 5 minutes
    const startTime = Date.now();
    const checkInterval = 10000; // 10 seconds
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkWorkflowStatus(jobId);
      
      if (status.status === 'completed') {
        if (status.conclusion === 'success') {
          return { success: true, status };
        } else {
          throw new Error(`Workflow failed with conclusion: ${status.conclusion}`);
        }
      } else if (status.status === 'failed') {
        throw new Error('Workflow failed');
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    throw new Error('Timeout waiting for video completion');
  }
}

module.exports = GitHubService; 