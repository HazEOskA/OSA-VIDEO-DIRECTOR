import express from 'express';
import cors from 'cors';
import { getDirector } from './app/OSADirector.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the UI
app.get('/', (req, res) => {
  res.sendFile(new URL('../public/index.html', import.meta.url).pathname);
});

// API: Create video job
app.post('/api/jobs', async (req, res) => {
  try {
    const { prompt, format, voice, captions, durationTarget, language } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const director = getDirector();
    
    const options = {
      format: format || '16:9',
      voice: voice || { enabled: false },
      captions: captions || 'off',
      durationTarget: durationTarget || 30,
      language: language || 'en'
    };
    
    // Start job execution (async, don't await)
    const jobPromise = director.createVideo(prompt, options);
    
    // Return initial job state immediately
    const jobId = jobPromise.then(j => j.id);
    
    res.json({
      status: 'CREATED',
      message: 'Job created and processing started',
      jobId: await jobId
    });
    
    // Continue processing in background
    jobPromise.catch(err => {
      console.error('Background job failed:', err);
    });
    
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get job status
app.get('/api/jobs/:jobId', (req, res) => {
  try {
    const director = getDirector();
    const job = director.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: List all jobs
app.get('/api/jobs', (req, res) => {
  try {
    const director = getDirector();
    const jobs = director.listJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Demo endpoint - runs the Truman Show AI demo
app.post('/api/demo', async (req, res) => {
  try {
    const director = getDirector();
    
    const demoRequest = {
      prompt: "Create a cinematic technology presentation about Truman Show AI. Explain that it is a persistent artificial civilisation with approximately fifty thousand residents, subjective agent knowledge, memory, companies, markets, institutions, deterministic history and replay. End with: Claim is not proof. Proof must be replayable.",
      format: '16:9',
      durationTarget: 30,
      language: 'en',
      voice: {
        enabled: false,
        provider: 'mock'
      },
      captions: 'cinematic'
    };
    
    console.log('Starting demo job...');
    const job = await director.createVideo(demoRequest.prompt, demoRequest);
    
    res.json({
      success: true,
      job: job
    });
    
  } catch (error) {
    console.error('Demo failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'OSA Video Director',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`OSA Video Director server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

export default app;
