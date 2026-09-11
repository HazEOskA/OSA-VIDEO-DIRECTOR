import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Remotion Renderer Service
 * 
 * Handles rendering compositions to video using Remotion CLI
 */

export class RemotionRenderer {
  constructor(options = {}) {
    this.bundlePath = options.bundlePath || './dist/remotion-bundle.js';
    this.outputDir = options.outputDir || './outputs';
    this.compositionId = options.compositionId || 'OsaComposition';
  }

  /**
   * Render a composition to video
   * @param {object} props - Composition props (scenes, format, captions, etc.)
   * @param {string} outputPath - Output video path
   * @returns {Promise<{videoPath: string, duration: number, resolution: string}>}
   */
  async render(props, outputPath) {
    const {
      scenes = [],
      format = '16:9',
      captions = 'off',
      voiceEnabled = false
    } = props;

    // Calculate dimensions based on format
    const dimensions = this.getDimensionsForFormat(format);
    
    // Calculate total frames (assuming 30fps, ~5 seconds per scene for demo)
    const fps = 30;
    const totalFrames = Math.max(scenes.length * fps * 5, fps * 5);

    // Build remotion render command
    const propsJson = JSON.stringify({
      scenes,
      captions,
      voiceEnabled,
      format
    });

    const command = `
      npx remotion render \
        ${this.bundlePath} \
        ${this.compositionId} \
        "${outputPath}" \
        --props='${propsJson}' \
        --width=${dimensions.width} \
        --height=${dimensions.height} \
        --fps=${fps} \
        --frames=${totalFrames} \
        --codec=h264 \
        --crf=23
    `.trim().replace(/\s+/g, ' ');

    try {
      console.log('Rendering with Remotion:', command);
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minute timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      console.log('Render complete:', stdout);
      if (stderr) {
        console.warn('Render warnings:', stderr);
      }

      return {
        videoPath: outputPath,
        success: true,
        duration: totalFrames / fps,
        resolution: `${dimensions.width}x${dimensions.height}`,
        format: format
      };
    } catch (error) {
      console.error('Remotion render failed:', error.message);
      
      // If remotion fails, create a placeholder video using ffmpeg
      console.log('Falling back to FFmpeg placeholder generation...');
      return this.createPlaceholderVideo(outputPath, dimensions, fps, totalFrames);
    }
  }

  getDimensionsForFormat(format) {
    switch (format) {
      case '9:16':
        return { width: 1080, height: 1920 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '16:9':
      default:
        return { width: 1920, height: 1080 };
    }
  }

  /**
   * Create a placeholder video using FFmpeg when Remotion is unavailable
   */
  async createPlaceholderVideo(outputPath, dimensions, fps, totalFrames) {
    const { width, height } = dimensions;
    const duration = totalFrames / fps;

    // Create a test video with color and text overlay
    const command = `
      ffmpeg -y \
        -f lavfi \
        -i "color=c=#0a0a0f:s=${width}x${height}:d=${duration}" \
        -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=48:fontcolor=#FFD700:x=(w-text_w)/2:y=(h-text_h)/2:text='OSA VIDEO DIRECTOR',drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:fontsize=28:fontcolor=#ffffff:x=(w-text_w)/2:y=(h/2+60):text='Demo Video'" \
        -c:v libx264 \
        -preset fast \
        -crf 23 \
        -pix_fmt yuv420p \
        "${outputPath}"
    `.trim().replace(/\s+/g, ' ');

    try {
      await execAsync(command);
      
      return {
        videoPath: outputPath,
        success: true,
        duration: duration,
        resolution: `${width}x${height}`,
        format: 'placeholder',
        note: 'Generated with FFmpeg fallback'
      };
    } catch (error) {
      console.error('FFmpeg fallback also failed:', error.message);
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }
}
