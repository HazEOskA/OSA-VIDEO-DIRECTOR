/**
 * Voice Provider Interface
 * 
 * Abstract interface for voice generation providers.
 * Implementations: MockVoiceProvider, OpenAIVoiceProvider, ElevenLabsVoiceProvider
 */

export class VoiceProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generate speech from text
   * @param {string} text - The text to synthesize
   * @param {object} options - Voice options (voice, language, instructions)
   * @returns {Promise<{audioPath: string, duration: number}>}
   */
  async generate(text, options = {}) {
    throw new Error('VoiceProvider.generate() must be implemented by subclass');
  }

  /**
   * Get available voices for this provider
   * @returns {Promise<Array<{id: string, name: string, gender: string, language: string}>>}
   */
  async getAvailableVoices() {
    throw new Error('VoiceProvider.getAvailableVoices() must be implemented by subclass');
  }
}

export class MockVoiceProvider extends VoiceProvider {
  constructor(config = {}) {
    super(config);
    this.outputDir = config.outputDir || './outputs';
  }

  async generate(text, options = {}) {
    // Mock implementation - returns a placeholder
    // In a real scenario, this would generate actual audio
    
    const mockAudioPath = `${this.outputDir}/mock-voice-${Date.now()}.txt`;
    
    // For now, just return metadata without creating actual file
    // since we don't have TTS credentials
    const estimatedDuration = Math.ceil(text.length / 15); // ~15 chars per second
    
    return {
      audioPath: null, // No actual file in mock mode
      duration: estimatedDuration,
      provider: 'mock',
      text: text,
      mock: true,
      message: 'Mock voice provider - no actual audio generated'
    };
  }

  async getAvailableVoices() {
    return [
      { id: 'mock-male', name: 'Mock Male', gender: 'male', language: 'en' },
      { id: 'mock-female', name: 'Mock Female', gender: 'female', language: 'en' }
    ];
  }
}

export class OpenAIVoiceProvider extends VoiceProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.outputDir = config.outputDir || './outputs';
    this.voice = config.voice || 'alloy';
  }

  async generate(text, options = {}) {
    if (!this.apiKey) {
      // Fallback to mock if no API key
      const mockProvider = new MockVoiceProvider({ outputDir: this.outputDir });
      return mockProvider.generate(text, options);
    }

    try {
      // OpenAI Speech API integration
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: options.voice || this.voice,
          response_format: 'mp3',
          speed: options.speed || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const timestamp = Date.now();
      const audioPath = `${this.outputDir}/voice-${timestamp}.mp3`;
      
      // Note: In browser/serverless env, you'd handle this differently
      // For Node.js, you'd use fs.writeFileSync
      // Here we return the buffer for the caller to handle
      
      // Estimate duration (TTS-1 is roughly real-time)
      const duration = Math.ceil(text.length / 15);
      
      return {
        audioPath,
        audioBuffer,
        duration,
        provider: 'openai',
        voice: options.voice || this.voice
      };
    } catch (error) {
      console.error('OpenAI voice generation failed:', error);
      // Fallback to mock
      const mockProvider = new MockVoiceProvider({ outputDir: this.outputDir });
      return mockProvider.generate(text, options);
    }
  }

  async getAvailableVoices() {
    return [
      { id: 'alloy', name: 'Alloy', gender: 'neutral', language: 'en' },
      { id: 'echo', name: 'Echo', gender: 'male', language: 'en' },
      { id: 'fable', name: 'Fable', gender: 'male', language: 'en' },
      { id: 'onyx', name: 'Onyx', gender: 'male', language: 'en' },
      { id: 'nova', name: 'Nova', gender: 'female', language: 'en' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', language: 'en' }
    ];
  }
}

/**
 * Factory function to create appropriate voice provider
 */
export function createVoiceProvider(type = 'mock', config = {}) {
  switch (type) {
    case 'openai':
      return new OpenAIVoiceProvider(config);
    case 'mock':
    default:
      return new MockVoiceProvider(config);
  }
}
