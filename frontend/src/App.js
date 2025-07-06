import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // API base URL - change this to your deployed backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const generateVideo = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setStatus('generating');
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setJobId(data.jobId);
        setStatus('processing');
        // Start polling for status
        pollStatus(data.jobId);
      } else {
        setError(data.error || 'Failed to start video generation');
        setStatus('idle');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStatus('idle');
    }
  };

  const pollStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/job/${jobId}`);
        const data = await response.json();

        setProgress(data.progress || 0);

        if (data.status === 'completed') {
          setStatus('completed');
          setDownloadUrl(`${API_BASE_URL}/api/download/${jobId}`);
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setError(data.error || 'Video generation failed');
          setStatus('failed');
          clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to check status');
        setStatus('failed');
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 10 minutes (timeout)
    setTimeout(() => {
      clearInterval(interval);
      if (status === 'processing') {
        setError('Video generation timed out');
        setStatus('failed');
      }
    }, 600000);
  };

  const resetForm = () => {
    setUrl('');
    setJobId(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setDownloadUrl(null);
  };

  const handleDownload = () => {
    console.log('[FRONTEND] Download button clicked for jobId:', jobId);
    // You can also log the actual URL being used:
    console.log('[FRONTEND] Downloading from:', `${API_BASE_URL}/api/download/${jobId}`);
    // The default behavior is to let the <a> tag handle the download
  };

  useEffect(() => {
    if (status === 'completed' && jobId) {
      console.log('[FRONTEND] Job completed:', jobId);
      console.log('[FRONTEND] Download URL:', `${API_BASE_URL}/api/download/${jobId}`);
    }
  }, [status, jobId]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Website Video Generator</h1>
        <p>Generate videos from any website using GitHub Actions</p>
      </header>

      <main className="App-main">
        <div className="form-container">
          <div className="input-group">
            <label htmlFor="url">Website URL:</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={status === 'generating' || status === 'processing'}
            />
          </div>

          <button
            onClick={generateVideo}
            disabled={status === 'generating' || status === 'processing' || !url}
            className="generate-btn"
          >
            {status === 'generating' ? 'Starting...' : 
             status === 'processing' ? 'Processing...' : 'Generate Video'}
          </button>

          {error && (
            <div className="error">
              <p>❌ {error}</p>
              <button onClick={resetForm} className="reset-btn">Try Again</button>
            </div>
          )}

          {status === 'processing' && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p>Progress: {progress}%</p>
              <p className="note">This may take 2-5 minutes. Video is being rendered in GitHub Actions.</p>
            </div>
          )}

          {status === 'completed' && (
            <div className="success">
              <p>✅ Video generated successfully!</p>
              <a
                href={`${API_BASE_URL}/api/download/${jobId}`}
                download={`website-video-${jobId}.mp4`}
                className="download-btn"
                onClick={handleDownload}
              >
                Download Video
              </a>
              <button onClick={resetForm} className="reset-btn">Generate Another Video</button>
            </div>
          )}
        </div>

        <div className="info">
          <h3>How it works:</h3>
          <ol>
            <li>Enter any website URL</li>
            <li>Click "Generate Video"</li>
            <li>GitHub Actions renders the video in the cloud</li>
            <li>Download your video when ready</li>
          </ol>
          
          <h3>Features:</h3>
          <ul>
            <li>✅ Live website capture with Remotion IFrame</li>
            <li>✅ Scalable cloud rendering via GitHub Actions</li>
            <li>✅ Real-time progress tracking</li>
            <li>✅ Parallel video processing</li>
            <li>✅ High-quality MP4 output</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App; 