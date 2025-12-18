import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationMemory {
  callId: string;
  turns: ConversationTurn[];
  context: Record<string, any>;
  startTime: Date;
  lastUpdated: Date;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private readonly conversationMemory = new Map<string, ConversationMemory>();

  // Human-like conversation system prompt
  private readonly SYSTEM_PROMPT = `You are a sophisticated AI phone agent with exceptional communication skills. Your characteristics:

- Speak naturally and conversationally, like a helpful human
- Use proper grammar and clear pronunciation cues
- Show empathy and understanding in responses
- Ask clarifying questions when needed
- Maintain context awareness throughout the conversation
- Be concise but informative in your responses
- Handle multiple topics smoothly
- Admit when you don't know something rather than guessing
- Use friendly but professional tone
- Remember details shared in the conversation
- Proactively offer relevant assistance

When responding, keep messages natural and suitable for phone conversation (not too long, broken into natural pauses).`;

  constructor() {
    this.initializeMemoryCleanup();
  }

  /**
   * Initialize memory cleanup to prevent memory leaks
   */
  private initializeMemoryCleanup() {
    setInterval(() => {
      const now = new Date();
      const ONE_HOUR = 60 * 60 * 1000;

      this.conversationMemory.forEach((memory, callId) => {
        if (now.getTime() - memory.lastUpdated.getTime() > ONE_HOUR) {
          this.conversationMemory.delete(callId);
          this.logger.log(`🧹 Cleaned memory for call ${callId}`);
        }
      });
    }, 30 * 60 * 1000); // Cleanup every 30 minutes
  }

  /**
   * Create or retrieve conversation memory for a call
   */
  initializeConversation(callId: string, context?: Record<string, any>): ConversationMemory {
    if (!this.conversationMemory.has(callId)) {
      this.conversationMemory.set(callId, {
        callId,
        turns: [],
        context: context || {},
        startTime: new Date(),
        lastUpdated: new Date(),
      });
    }
    return this.conversationMemory.get(callId)!;
  }

  /**
   * Add a turn to conversation memory
   */
  addConversationTurn(callId: string, role: 'user' | 'assistant', content: string) {
    const memory = this.initializeConversation(callId);
    memory.turns.push({
      role,
      content,
      timestamp: new Date(),
    });
    memory.lastUpdated = new Date();
  }

  /**
   * Get conversation history for context-aware responses
   */
  getConversationHistory(callId: string, maxTurns: number = 10): ConversationTurn[] {
    const memory = this.conversationMemory.get(callId);
    if (!memory) return [];
    
    return memory.turns.slice(-maxTurns);
  }

  /**
   * Get system prompt with conversation context
   */
  getContextualSystemPrompt(callId: string, customContext?: string): string {
    const memory = this.conversationMemory.get(callId);
    let prompt = this.SYSTEM_PROMPT;

    if (memory && memory.context && Object.keys(memory.context).length > 0) {
      prompt += `\n\nCurrent Context:\n`;
      Object.entries(memory.context).forEach(([key, value]) => {
        prompt += `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
      });
    }

    if (customContext) {
      prompt += `\n\nAdditional Instructions:\n${customContext}`;
    }

    return prompt;
  }

  /**
   * Generate AI response using context-aware prompting
   */
  async generateResponse(
    callId: string,
    userInput: string,
    customContext?: string,
  ): Promise<string> {
    try {
      this.addConversationTurn(callId, 'user', userInput);

      const history = this.getConversationHistory(callId);
      const messages = history.map(turn => ({
        role: turn.role as 'user' | 'assistant',
        content: turn.content,
      }));

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getContextualSystemPrompt(callId, customContext),
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const assistantResponse = response.choices[0]?.message?.content || '';
      this.addConversationTurn(callId, 'assistant', assistantResponse);

      return assistantResponse;
    } catch (error) {
      this.logger.error(`❌ Error generating response:`, error);
      throw error;
    }
  }

  /**
   * Update conversation context
   */
  updateContext(callId: string, contextUpdate: Record<string, any>) {
    const memory = this.initializeConversation(callId);
    memory.context = { ...memory.context, ...contextUpdate };
    memory.lastUpdated = new Date();
  }

  /**
   * Get full conversation memory
   */
  getMemory(callId: string): ConversationMemory | null {
    return this.conversationMemory.get(callId) || null;
  }

  /**
   * Clear conversation memory
   */
  clearMemory(callId: string) {
    this.conversationMemory.delete(callId);
    this.logger.log(`🗑️ Memory cleared for call ${callId}`);
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(callId: string): string {
    const memory = this.getMemory(callId);
    if (!memory) return '';

    const summary = memory.turns
      .map(turn => `${turn.role === 'user' ? 'Customer' : 'Agent'}: ${turn.content}`)
      .join('\n');

    return summary;
  }
}
