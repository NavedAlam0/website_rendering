const axios = require('axios');

// Test configuration
const TEST_URL = 'https://www.example.com';
const BASE_URL = 'http://localhost:4000';

async function testVideoGeneration() {
  console.log('🚀 Testing Video Generation API...\n');

  try {
    // Step 1: Generate video
    console.log('1. Generating video...');
    const generateResponse = await axios.post(`${BASE_URL}/api/generate-video`, {
      url: TEST_URL
    });

    const { jobId } = generateResponse.data;
    console.log(`✅ Video generation started. Job ID: ${jobId}\n`);

    // Step 2: Check status
    console.log('2. Checking job status...');
    let status = 'processing';
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes with 10-second intervals

    while (status === 'processing' && attempts < maxAttempts) {
      const statusResponse = await axios.get(`${BASE_URL}/api/job/${jobId}`);
      status = statusResponse.data.status;
      
      console.log(`   Status: ${status} (Progress: ${statusResponse.data.progress}%)`);
      
      if (status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
      }
    }

    // Step 3: Download video if completed
    if (status === 'completed') {
      console.log('\n3. Downloading video...');
      const downloadResponse = await axios.get(`${BASE_URL}/api/download/${jobId}`, {
        responseType: 'stream'
      });
      
      console.log('✅ Video downloaded successfully!');
      console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
      console.log(`   Content-Length: ${downloadResponse.headers['content-length']} bytes`);
      
    } else if (status === 'failed') {
      console.log('❌ Video generation failed!');
      const statusResponse = await axios.get(`${BASE_URL}/api/job/${jobId}`);
      console.log(`   Error: ${statusResponse.data.error}`);
    } else {
      console.log('⏰ Timeout waiting for video completion');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testMultipleVideos() {
  console.log('🚀 Testing Multiple Video Generation...\n');

  const urls = [
    'https://www.example.com',
    'https://www.google.com',
    'https://www.github.com'
  ];

  const promises = urls.map(async (url, index) => {
    console.log(`Starting video ${index + 1} for ${url}...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/generate-video`, { url });
      return { url, jobId: response.data.jobId, success: true };
    } catch (error) {
      return { url, error: error.message, success: false };
    }
  });

  const results = await Promise.all(promises);
  
  console.log('\n📊 Results:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ Video ${index + 1}: ${result.url} (Job ID: ${result.jobId})`);
    } else {
      console.log(`❌ Video ${index + 1}: ${result.url} (Error: ${result.error})`);
    }
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  // Test single video generation
  await testVideoGeneration();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test multiple video generation
  await testMultipleVideos();
  
  console.log('\n🏁 Tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server with: npm start');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error); 