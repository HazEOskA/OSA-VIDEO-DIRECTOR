import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getDirector } from './app/OSADirector.js';

const execFileAsync = promisify(execFile);
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/outputs', express.static('outputs'));

app.get('/', (req, res) => {
  res.sendFile(new URL('../public/index.html', import.meta.url).pathname);
});

app.get('/api/runtime/health', async (req, res) => {
  try {
    const { stdout } = await execFileAsync(
      'python3',
      ['scripts/runtime_health.py'],
      {
        cwd: process.cwd(),
        env: process.env,
        timeout: 30000,
        maxBuffer: 1024 * 1024
      }
    );
    const payload = JSON.parse(stdout.trim());
    res.status(payload.status === 'ok' ? 200 : 503).json(payload);
  } catch (error) {
    let payload = null;
    if (error.stdout) {
      try {
        payload = JSON.parse(String(error.stdout).trim());
      } catch {
        payload = null;
      }
    }
    res.status(503).json(payload || {
      status: 'degraded',
      service: 'OSA Video Director Agent Workspace',
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OSA Video Director',
    version: '1.1.0-preview',
    workspace: '/api/runtime/health'
  });
});

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

    const job = await director.createVideo(prompt, options);
    res.json({
      status: job.status,
      message: 'Job processed by OSA Video Director preview',
      jobId: job.id,
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

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

app.get('/api/jobs', (req, res) => {
  try {
    const director = getDirector();
    res.json(director.listJobs());
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/demo', async (req, res) => {
  try {
    const director = getDirector();
    const demoRequest = {
      prompt: 'Create a cinematic technology presentation about OSA Video Director. Show an agentic post-production runtime that plans, routes, executes, verifies real artifacts and repairs failures. End with: Claim is not proof. Proof must be replayable.',
      format: '16:9',
      durationTarget: 30,
      language: 'en',
      voice: { enabled: false, provider: 'mock' },
      captions: 'cinematic'
    };

    const job = await director.createVideo(demoRequest.prompt, demoRequest);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Demo failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OSA Video Director agent workspace running on port ${PORT}`);
});

export default app;
