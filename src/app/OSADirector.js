import { 
  createVideoJob, 
  transitionJob, 
  updateJob, 
  JobStatus 
} from './VideoJob.js';
import { createVoiceProvider } from '../providers/VoiceProvider.js';
import { RemotionRenderer } from './RemotionRenderer.js';
import { verifyVideoArtifact } from './VideoVerifier.js';

/**
 * OSA Video Director - Main Pipeline Orchestrator
 * 
 * Takes a video request and orchestrates the full pipeline:
 * 1. Planning (parse prompt, create scenes)
 * 2. Asset preparation
 * 3. Voice generation (if enabled)
 * 4. Composition
 * 5. Rendering
 * 6. Verification
 */

export class OSADirector {
  constructor(options = {}) {
    this.jobs = new Map();
    this.outputDir = options.outputDir || './outputs';
    this.renderer = new RemotionRenderer({
      outputDir: this.outputDir
    });
    
    // Load OSA character bible and motion language from references
    this.characterBible = this.loadCharacterBible();
    this.motionLanguage = this.loadMotionLanguage();
  }

  loadCharacterBible() {
    // In production, load from ./skills/directing-osa-videos/references/osa-character-bible.md
    return {
      name: 'OSA',
      description: 'Antropomorficzna, wyraźnie owadzia, potężnie zbudowana osa o charakterze premium cyberpunk mascot',
      silhouetteLock: {
        broadShoulders: true,
        muscularTorso: true,
        narrowWaist: true,
        athleticLegs: true,
        twoAntennae: true,
        twoWings: true,
        twoArms: true,
        twoLegs: true
      },
      colors: {
        primary: '#FFD700', // Yellow
        secondary: '#000000', // Black
        accent: '#FFA500' // Orange
      }
    };
  }

  loadMotionLanguage() {
    // In production, load from ./skills/directing-osa-videos/references/osa-motion-language.md
    return {
      movementStyle: 'controlled power',
      gestures: 'short, decisive',
      wingMotion: 'aerodynamic with motion blur',
      expressions: ['focused', 'confident', 'analytical', 'combat-ready']
    };
  }

  /**
   * Create and execute a video job from a prompt
   */
  async createVideo(prompt, options = {}) {
    const job = createVideoJob(prompt, options);
    this.jobs.set(job.id, job);

    try {
      // Phase 1: Planning
      job.status = JobStatus.PLANNING;
      this.jobs.set(job.id, job);
      
      const plan = await this.planVideo(job);
      job.plan = plan;
      job.scenes = plan.scenes;
      
      // Phase 2: Prepare Assets
      job.status = JobStatus.PREPARING_ASSETS;
      this.jobs.set(job.id, job);
      
      const assets = await this.prepareAssets(job);
      job.assets = assets;
      
      // Phase 3: Generate Voice (if enabled)
      if (job.voice?.enabled) {
        job.status = JobStatus.GENERATING_VOICE;
        this.jobs.set(job.id, job);
        
        const narration = await this.generateVoice(job);
        job.narration = narration;
      }
      
      // Phase 4: Compose
      job.status = JobStatus.COMPOSING;
      this.jobs.set(job.id, job);
      
      const composition = await this.composeVideo(job);
      job.composition = composition;
      
      // Phase 5: Render
      job.status = JobStatus.RENDERING;
      this.jobs.set(job.id, job);
      
      const outputPath = `${this.outputDir}/${job.id}.mp4`;
      const renderResult = await this.renderer.render(composition, outputPath);
      job.render = renderResult;
      job.artifacts.push(outputPath);
      
      // Phase 6: Verify
      job.status = JobStatus.VERIFYING;
      this.jobs.set(job.id, job);
      
      const verification = await verifyVideoArtifact(
        outputPath, 
        job.format, 
        job.durationTarget
      );
      job.verification = verification;
      
      if (verification.passed) {
        job.status = JobStatus.COMPLETED;
      } else {
        job.status = JobStatus.FAILED;
        job.error = `Verification failed: ${verification.errors.join('; ')}`;
      }
      
      this.jobs.set(job.id, job);
      return job;
      
    } catch (error) {
      console.error('Pipeline error:', error);
      job.status = JobStatus.FAILED;
      job.error = error.message;
      this.jobs.set(job.id, job);
      return job;
    }
  }

  /**
   * Plan video structure from prompt
   */
  async planVideo(job) {
    // Parse the prompt and create a structured plan
    // This is where the OSA directing skill logic would be applied
    
    const prompt = job.prompt.toLowerCase();
    
    // Extract format from prompt or use default
    let format = job.format;
    if (prompt.includes('9:16') || prompt.includes('vertical')) format = '9:16';
    if (prompt.includes('16:9') || prompt.includes('horizontal')) format = '16:9';
    if (prompt.includes('1:1') || prompt.includes('square')) format = '1:1';
    
    // Extract duration target
    const durationMatch = prompt.match(/(\d+)\s*-?\s*(second|sec|s)/i);
    const durationTarget = durationMatch ? parseInt(durationMatch[1]) : job.durationTarget;
    
    // Create scene structure based on Truman Show AI demo
    const scenes = this.createDemoScenes(job.prompt, format);
    
    return {
      title: 'Truman Show AI',
      mainMessage: 'Persistent artificial civilization with deterministic history',
      hook: 'Claim is not proof. Proof must be replayable.',
      narrator: {
        style: 'cinematic documentary',
        language: job.language || 'en',
        gender: 'male'
      },
      visualDirection: 'premium cyberpunk, ultra-dark, cinematic rim light',
      palette: this.characterBible.colors,
      emotionalArc: 'analytical -> revelatory -> conclusive',
      format: format,
      durationTarget: durationTarget,
      scenes: scenes
    };
  }

  createDemoScenes(prompt, format) {
    // Create 6 scenes for the Truman Show AI demo
    // Following OSA Character Bible and motion language
    
    const baseScene = {
      backgroundColor: '#0a0a0f',
      colors: {
        primary: '#0a0a0f',
        secondary: '#1a1a2e'
      }
    };

    return [
      {
        id: 'scene-1',
        title: 'TRUMAN SHOW AI',
        description: 'Persistent Artificial Civilization',
        durationInFrames: 150, // 5 seconds at 30fps
        captions: 'Truman Show AI',
        ...baseScene
      },
      {
        id: 'scene-2',
        title: '50,000 RESIDENTS',
        description: 'Subjective agents with memory and identity',
        durationInFrames: 150,
        captions: '~50,000 AI residents',
        visualElements: ['Agent networks', 'Memory systems'],
        ...baseScene
      },
      {
        id: 'scene-3',
        title: 'COMPANIES & MARKETS',
        description: 'Autonomous economic systems',
        durationInFrames: 150,
        captions: 'Self-sustaining economy',
        visualElements: ['Market dynamics', 'Institutions'],
        ...baseScene
      },
      {
        id: 'scene-4',
        title: 'DETERMINISTIC HISTORY',
        description: 'Every action recorded and replayable',
        durationInFrames: 150,
        captions: 'Deterministic timeline',
        visualElements: ['Event logs', 'State tracking'],
        ...baseScene
      },
      {
        id: 'scene-5',
        title: 'REPLAY CAPABILITY',
        description: 'Full state reconstruction at any point',
        durationInFrames: 150,
        captions: 'Replay any moment',
        visualElements: ['Time navigation', 'State restore'],
        ...baseScene
      },
      {
        id: 'scene-6',
        title: 'CLAIM ≠ PROOF',
        description: 'Proof must be replayable',
        durationInFrames: 150,
        captions: 'Claim is not proof. Proof must be replayable.',
        visualElements: ['Verification seal'],
        ...baseScene
      }
    ];
  }

  /**
   * Prepare assets for video
   */
  async prepareAssets(job) {
    // In V1, we use generated/text-based assets
    // Future versions can incorporate uploaded images/videos
    
    return {
      images: [],
      videos: [],
      audio: [],
      fonts: ['system-ui', '-apple-system', 'sans-serif']
    };
  }

  /**
   * Generate voice narration
   */
  async generateVoice(job) {
    const provider = createVoiceProvider(job.voice.provider || 'mock', {
      outputDir: this.outputDir
    });
    
    // Combine scene captions into narration script
    const script = job.scenes.map(s => s.captions).filter(Boolean).join('. ');
    
    const result = await provider.generate(script, {
      voice: job.voice.voice,
      instructions: job.voice.instructions
    });
    
    return {
      script: script,
      provider: result.provider,
      duration: result.duration,
      mock: result.mock
    };
  }

  /**
   * Compose video from scenes and assets
   */
  async composeVideo(job) {
    return {
      scenes: job.scenes,
      format: job.format,
      captions: job.captions,
      voiceEnabled: job.voice?.enabled || false
    };
  }

  /**
   * Get job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  /**
   * List all jobs
   */
  listJobs() {
    return Array.from(this.jobs.values());
  }
}

// Singleton instance
let directorInstance = null;

export function getDirector() {
  if (!directorInstance) {
    directorInstance = new OSADirector();
  }
  return directorInstance;
}
