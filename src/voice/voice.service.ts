import { Injectable, Logger } from '@nestjs/common';

export interface VoiceMetrics {
  confidence: number;
  duration: number;
  speed: 'slow' | 'normal' | 'fast';
  tone: 'neutral' | 'positive' | 'negative' | 'uncertain';
  audioQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface SpeechAnalysis {
  transcription: string;
  language: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  intent: string;
  confidence: number;
  metrics: VoiceMetrics;
}

@Injectable()
export class VoiceRecognitionService {
  private readonly logger = new Logger(VoiceRecognitionService.name);

  /**
   * Analyze voice characteristics from audio metadata
   */
  analyzeVoiceMetrics(audioData: {
    duration: number;
    sampleRate?: number;
    bitDepth?: number;
    silence?: number;
  }): VoiceMetrics {
    const { duration, sampleRate = 16000, bitDepth = 16, silence = 0 } = audioData;

    // Calculate speech speed
    const speechDuration = duration - silence;
    const wordsEstimate = speechDuration * 2.5; // Average 2.5 words per second in speech
    const speed = wordsEstimate / speechDuration < 2.5 ? 'slow' : 
                  wordsEstimate / speechDuration > 3.5 ? 'fast' : 'normal';

    // Estimate audio quality based on sample rate and bit depth
    const audioQuality = sampleRate >= 16000 && bitDepth >= 16
      ? 'excellent'
      : sampleRate >= 8000 && bitDepth >= 8
      ? 'good'
      : 'fair';

    return {
      confidence: Math.min(1, (sampleRate / 16000) * (bitDepth / 16)),
      duration,
      speed,
      tone: 'neutral', // Would be determined by actual voice analysis
      audioQuality,
    };
  }

  /**
   * Detect speech sentiment and emotion
   */
  detectSentiment(transcription: string): 'positive' | 'negative' | 'neutral' {
    const positive = /great|excellent|wonderful|amazing|love|happy|thank|thanks|perfect|awesome/i;
    const negative = /bad|terrible|awful|hate|angry|upset|disappointed|frustrated|horrible/i;

    if (negative.test(transcription)) return 'negative';
    if (positive.test(transcription)) return 'positive';
    return 'neutral';
  }

  /**
   * Detect caller intent from transcription
   */
  detectIntent(transcription: string): string {
    const intentPatterns = {
      'reservation': /book|reserve|table|reservation|appointment/i,
      'inquiry': /what|how|when|where|why|tell me|can you|information/i,
      'complaint': /problem|issue|complaint|broken|not working|wrong|error/i,
      'booking': /book|schedule|confirm|make|appointment/i,
      'cancellation': /cancel|close|delete|remove|stop/i,
      'billing': /cost|price|charge|fee|bill|payment|refund/i,
      'support': /help|assist|support|issue|problem|error/i,
      'feedback': /feedback|opinion|review|suggest|improve/i,
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(transcription)) {
        return intent;
      }
    }

    return 'general';
  }

  /**
   * Detect language from transcription
   */
  detectLanguage(transcription: string): string {
    // Simple language detection based on character patterns
    // In production, use language detection library like 'franc' or 'textlang'
    
    if (/[\u4E00-\u9FA5]/.test(transcription)) return 'Chinese';
    if (/[\u0600-\u06FF]/.test(transcription)) return 'Arabic';
    if (/[\u0E00-\u0E7F]/.test(transcription)) return 'Thai';
    if (/[\u0900-\u097F]/.test(transcription)) return 'Hindi';

    return 'English';
  }

  /**
   * Analyze complete speech
   */
  analyzeSpeech(transcription: string, audioMetrics?: VoiceMetrics): SpeechAnalysis {
    const metrics = audioMetrics || {
      confidence: 0.95,
      duration: 0,
      speed: 'normal',
      tone: 'neutral',
      audioQuality: 'good',
    };

    return {
      transcription,
      language: this.detectLanguage(transcription),
      sentiment: this.detectSentiment(transcription),
      intent: this.detectIntent(transcription),
      confidence: metrics.confidence,
      metrics,
    };
  }

  /**
   * Generate voice processing recommendations
   */
  getVoiceRecommendations(analysis: SpeechAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.metrics.audioQuality === 'poor') {
      recommendations.push('Audio quality is poor, consider finding a quieter environment');
    }

    if (analysis.metrics.speed === 'slow') {
      recommendations.push('Speaker is talking slowly, may indicate confusion or language barrier');
    }

    if (analysis.sentiment === 'negative') {
      recommendations.push('Detected negative sentiment, recommend empathetic response');
    }

    if (analysis.confidence < 0.7) {
      recommendations.push('Low confidence score, may need to ask for clarification');
    }

    return recommendations;
  }

  /**
   * Check if voice input is suitable for processing
   */
  isVoiceInputValid(audioMetrics: VoiceMetrics): {
    valid: boolean;
    reason?: string;
  } {
    if (audioMetrics.audioQuality === 'poor') {
      return { valid: false, reason: 'Audio quality too poor for processing' };
    }

    if (audioMetrics.confidence < 0.5) {
      return { valid: false, reason: 'Confidence score too low' };
    }

    if (audioMetrics.duration < 0.5) {
      return { valid: false, reason: 'Audio too short to process' };
    }

    return { valid: true };
  }

  /**
   * Get recommended voice parameters for optimal performance
   */
  getOptimalVoiceParameters(): {
    sampleRate: number;
    bitDepth: number;
    channels: number;
    encoding: string;
    vad: { enabled: boolean; threshold: number };
  } {
    return {
      sampleRate: 16000,
      bitDepth: 16,
      channels: 1,
      encoding: 'linear16',
      vad: {
        enabled: true,
        threshold: 0.5,
      },
    };
  }

  /**
   * Analyze voice for speaker identification
   */
  async identifySpeaker(
    transcription: string,
    voiceCharacteristics: Record<string, any>,
  ): Promise<{ identified: boolean; confidence: number; speakerId?: string }> {
    // Placeholder for speaker identification using voice print matching
    // In production, would use services like Google Cloud Speech-to-Text
    
    return {
      identified: false,
      confidence: 0,
    };
  }

  /**
   * Generate voice quality report
   */
  generateQualityReport(analysis: SpeechAnalysis): {
    overallScore: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (analysis.metrics.audioQuality === 'poor') {
      issues.push('Poor audio quality');
      score -= 30;
    } else if (analysis.metrics.audioQuality === 'fair') {
      score -= 10;
    }

    if (analysis.confidence < 0.8) {
      issues.push(`Low recognition confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
      score -= 15;
    }

    if (analysis.metrics.speed === 'slow') {
      suggestions.push('Encourage caller to speak at normal pace');
    }

    if (analysis.sentiment === 'negative' && analysis.intent === 'complaint') {
      suggestions.push('Priority handling recommended - escalate if needed');
    }

    return {
      overallScore: Math.max(0, score),
      issues,
      suggestions,
    };
  }
}
