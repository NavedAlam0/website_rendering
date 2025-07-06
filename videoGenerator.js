const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execAsync = promisify(exec);

class VideoGenerator {
  constructor() {
    this.compositionId = 'WebsiteVideo';
    this.outputDir = path.join(__dirname, 'videos');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateVideo(url, jobId, duration = 300) {
    try {
      console.log(`Starting video generation for URL: ${url}`);
      
      const outputPath = path.join(this.outputDir, `video-${jobId}.mp4`);
      
      // Create a temporary props file with the URL
      const propsPath = path.join(this.outputDir, `props-${jobId}.json`);
      const props = {
        url: url,
        duration: duration
      };
      
      fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
      console.log(`Created props file: ${propsPath}`);
      
      // Use remotion CLI to render the video with props file
      const command = `npx remotion render src/index.tsx ${this.compositionId} "${outputPath}" --props="${propsPath}"`;
      
      console.log(`Executing command: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: __dirname,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      if (stderr) {
        console.log('Remotion stderr:', stderr);
      }
      
      console.log('Remotion stdout:', stdout);
      
      // Clean up the temporary props file
      try {
        fs.unlinkSync(propsPath);
        console.log(`Cleaned up props file: ${propsPath}`);
      } catch (cleanupError) {
        console.log(`Warning: Could not clean up props file: ${cleanupError.message}`);
      }
      
      console.log(`RenderMedia finished, checking file: ${outputPath}`);
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`Video file exists. Size: ${stats.size} bytes`);
        if (stats.size === 0) {
          console.error('Video file is empty!');
        }
      } else {
        console.error('Video file was not created!');
      }
      console.log(`Video generated successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error generating video:', error);
      if (error.stdout) {
        console.error('Command stdout:', error.stdout);
      }
      if (error.stderr) {
        console.error('Command stderr:', error.stderr);
      }
      throw error;
    }
  }
}

module.exports = VideoGenerator; 