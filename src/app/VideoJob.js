import { v4 as uuidv4 } from 'uuid';

/**
 * VideoJob State Machine
 * 
 * States:
 * CREATED -> PLANNING -> PREPARING_ASSETS -> GENERATING_VOICE -> COMPOSING -> RENDERING -> VERIFYING -> COMPLETED
 *                                                                            |
 *                                                                            v
 *                                                                         FAILED
 */

export const JobStatus = {
  CREATED: 'CREATED',
  PLANNING: 'PLANNING',
  PREPARING_ASSETS: 'PREPARING_ASSETS',
  GENERATING_VOICE: 'GENERATING_VOICE',
  COMPOSING: 'COMPOSING',
  RENDERING: 'RENDERING',
  VERIFYING: 'VERIFYING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export const validTransitions = {
  [JobStatus.CREATED]: [JobStatus.PLANNING, JobStatus.FAILED],
  [JobStatus.PLANNING]: [JobStatus.PREPARING_ASSETS, JobStatus.FAILED],
  [JobStatus.PREPARING_ASSETS]: [JobStatus.GENERATING_VOICE, JobStatus.COMPOSING, JobStatus.FAILED],
  [JobStatus.GENERATING_VOICE]: [JobStatus.COMPOSING, JobStatus.FAILED],
  [JobStatus.COMPOSING]: [JobStatus.RENDERING, JobStatus.FAILED],
  [JobStatus.RENDERING]: [JobStatus.VERIFYING, JobStatus.FAILED],
  [JobStatus.VERIFYING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.FAILED]: []
};

export function createVideoJob(prompt, options = {}) {
  return {
    id: uuidv4(),
    prompt,
    sourceContext: options.sourceContext || null,
    format: options.format || '16:9',
    durationTarget: options.durationTarget || 30,
    language: options.language || 'en',
    voice: options.voice || {
      enabled: false,
      provider: null,
      voice: null,
      instructions: null
    },
    captions: options.captions || 'off',
    status: JobStatus.CREATED,
    plan: null,
    scenes: [],
    assets: [],
    narration: null,
    render: null,
    verification: null,
    artifacts: [],
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function canTransition(job, newStatus) {
  if (!job || !job.status) return false;
  const allowedTransitions = validTransitions[job.status] || [];
  return allowedTransitions.includes(newStatus);
}

export function transitionJob(job, newStatus, error = null) {
  if (!canTransition(job, newStatus)) {
    throw new Error(`Invalid transition from ${job.status} to ${newStatus}`);
  }
  
  return {
    ...job,
    status: newStatus,
    error: error || job.error,
    updatedAt: new Date().toISOString()
  };
}

export function updateJob(job, updates) {
  return {
    ...job,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}
