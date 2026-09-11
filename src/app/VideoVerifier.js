import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, statSync } from 'fs';

const execAsync = promisify(exec);

/**
 * Video Verification Service
 * 
 * Verifies rendered video artifacts meet requirements:
 * - artifact exists
 * - artifact size > 0
 * - ffprobe can read it
 * - expected video stream exists
 * - resolution matches requested format
 * - duration is plausible
 * - codec/container is valid
 */

export async function verifyVideoArtifact(videoPath, expectedFormat = '16:9', expectedDurationSeconds = 30) {
  const verification = {
    passed: false,
    checks: {},
    errors: [],
    metadata: null
  };

  // Check 1: File exists
  if (!existsSync(videoPath)) {
    verification.checks.exists = false;
    verification.errors.push(`Artifact does not exist: ${videoPath}`);
    return verification;
  }
  verification.checks.exists = true;

  // Check 2: File size > 0
  try {
    const stats = statSync(videoPath);
    if (stats.size === 0) {
      verification.checks.nonEmpty = false;
      verification.errors.push('Artifact file is empty');
      return verification;
    }
    verification.checks.nonEmpty = true;
    verification.fileSize = stats.size;
  } catch (error) {
    verification.checks.nonEmpty = false;
    verification.errors.push(`Cannot stat file: ${error.message}`);
    return verification;
  }

  // Check 3: ffprobe can read it and extract metadata
  try {
    const probeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    const { stdout } = await execAsync(probeCmd);
    const probeData = JSON.parse(stdout);
    
    verification.metadata = {
      format: probeData.format,
      streams: probeData.streams
    };

    verification.checks.probeReadable = true;
  } catch (error) {
    verification.checks.probeReadable = false;
    verification.errors.push(`ffprobe failed: ${error.message}`);
    return verification;
  }

  // Check 4: Video stream exists
  const videoStream = verification.metadata.streams.find(s => s.codec_type === 'video');
  if (!videoStream) {
    verification.checks.hasVideoStream = false;
    verification.errors.push('No video stream found in artifact');
    return verification;
  }
  verification.checks.hasVideoStream = true;
  verification.videoCodec = videoStream.codec_name;

  // Check 5: Resolution matches expected format
  const expectedResolutions = {
    '9:16': { width: 1080, height: 1920, tolerance: 10 },
    '16:9': { width: 1920, height: 1080, tolerance: 10 },
    '1:1': { width: 1080, height: 1080, tolerance: 10 }
  };

  const expected = expectedResolutions[expectedFormat];
  if (expected) {
    const widthMatch = Math.abs(videoStream.width - expected.width) <= expected.tolerance;
    const heightMatch = Math.abs(videoStream.height - expected.height) <= expected.tolerance;
    
    if (widthMatch && heightMatch) {
      verification.checks.resolutionMatch = true;
    } else {
      verification.checks.resolutionMatch = false;
      verification.errors.push(
        `Resolution mismatch: got ${videoStream.width}x${videoStream.height}, expected ~${expected.width}x${expected.height}`
      );
    }
  } else {
    // Unknown format, just record what we got
    verification.checks.resolutionMatch = true;
  }

  verification.actualResolution = `${videoStream.width}x${videoStream.height}`;

  // Check 6: Duration is plausible
  const actualDuration = parseFloat(verification.metadata.format.duration) || 0;
  const minExpectedDuration = expectedDurationSeconds * 0.5; // At least 50% of target
  const maxExpectedDuration = expectedDurationSeconds * 2.0; // At most 200% of target
  
  if (actualDuration >= minExpectedDuration && actualDuration <= maxExpectedDuration) {
    verification.checks.durationPlausible = true;
  } else {
    verification.checks.durationPlausible = false;
    verification.errors.push(
      `Duration implausible: got ${actualDuration.toFixed(2)}s, expected ~${expectedDurationSeconds}s`
    );
  }

  verification.actualDuration = actualDuration;

  // Check 7: Codec is valid
  const validCodecs = ['h264', 'libx264', 'h265', 'libx265', 'vp9', 'av1'];
  if (validCodecs.includes(videoStream.codec_name.toLowerCase())) {
    verification.checks.validCodec = true;
  } else {
    verification.checks.validCodec = false;
    verification.errors.push(`Unknown codec: ${videoStream.codec_name}`);
  }

  // Check 8: Container is valid
  const validContainers = ['mp4', 'mov', 'mkv', 'webm'];
  const container = (verification.metadata.format.format_name || '').toLowerCase();
  if (validContainers.some(c => container.includes(c))) {
    verification.checks.validContainer = true;
  } else {
    verification.checks.validContainer = false;
    verification.errors.push(`Unknown container: ${container}`);
  }

  // Final verdict
  const allChecksPassed = Object.values(verification.checks).every(check => check === true);
  verification.passed = allChecksPassed;

  return verification;
}
