"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PhoneService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneService = void 0;
const common_1 = require("@nestjs/common");
const ws_1 = __importDefault(require("ws"));
const axios_1 = __importDefault(require("axios"));
let PhoneService = PhoneService_1 = class PhoneService {
    constructor() {
        this.logger = new common_1.Logger(PhoneService_1.name);
        this.apiKey = process.env.OPENAI_API_KEY;
        this.sockets = new Map();
    }
    get authHeader() {
        return { Authorization: `Bearer ${this.apiKey}` };
    }
    async acceptCall(callId, opts) {
        const body = {
            type: 'realtime',
            model: opts?.model || 'gpt-realtime',
            output_modalities: ['audio'],
            audio: {
                input: {
                    format: 'pcm16',
                    turn_detection: { type: 'semantic_vad', create_response: true },
                },
                output: {
                    format: 'g711_ulaw',
                    voice: 'coral',
                    speed: 1.0,
                },
            },
            instructions: opts?.instructions || `You are a helpful assistant for a restaurant, we always availability for bookings.
         Speak clearly and briefly.
          Confirm understanding before taking actions.
          Your default language is English, unless a user uses a different language`,
        };
        try {
            const response = await axios_1.default.post(`https://api.openai.com/v1/realtime/calls/${callId}/accept`, body, {
                headers: {
                    ...this.authHeader,
                    'Content-Type': 'application/json'
                }
            });
            this.logger.log(`✅ Call ${callId} accepted successfully`);
            return response.data;
        }
        catch (e) {
            this.logger.error(`❌ Error accepting call ${callId}:`, e.message);
            if (e.response) {
                this.logger.error('Response data:', e.response.data);
                this.logger.error('Response status:', e.response.status);
            }
            throw e;
        }
    }
    async connect(callId) {
        const url = `wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(callId)}`;
        const ws = new ws_1.default(url, {
            headers: this.authHeader,
        });
        this.sockets.set(callId, ws);
        ws.on('open', () => {
            this.logger.log(`🔌 WS open for call ${callId}`);
            const responseCreate = {
                type: 'response.create',
                response: {
                    instructions: `Greet the user and ask them what they need assistance with.
             Use English as a default language.
             For booking cancellation, ask for booking reference and name only.
             If a user is silent for more than 3 seconds, ask if they are still there or if they need help with anything`,
                },
            };
            ws.send(JSON.stringify(responseCreate));
        });
        ws.on('message', (data) => {
            try {
                const text = data.toString();
                this.logger.debug(`📨 WS message (${callId}): ${text}`);
            }
            catch (e) {
                this.logger.error(`Failed to parse WS message for ${callId}`, e);
            }
        });
        ws.on('close', (code, reason) => {
            this.logger.log(`🔌 WS closed for ${callId}: code=${code} reason=${reason.toString()}`);
            this.sockets.delete(callId);
        });
        ws.on('error', (err) => {
            this.logger.error(`❌ WS error for ${callId}: ${err.message}`);
        });
    }
    async handleIncomingCall(callId) {
        this.logger.log(`📞 Handling incoming call: ${callId}`);
        try {
            await this.acceptCall(callId);
            setImmediate(() => {
                this.connect(callId).catch((e) => this.logger.error(`❌ Failed to connect WS for ${callId}: ${e.message}`));
            });
            return {
                control: {
                    action: 'accept',
                    parameters: {
                        voice: 'coral',
                        instructions: `You are a helpful assistant for a restaurant, we always availability for bookings.
               Speak clearly and briefly.
                Confirm understanding before taking actions.
                Your default language is English, unless a user uses a different language`,
                        turn_detection: {
                            type: 'server_vad',
                        }
                    }
                }
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to handle call ${callId}:`, error);
            throw error;
        }
    }
    async terminateCall(callId) {
        try {
            await axios_1.default.post(`https://api.openai.com/v1/realtime/calls/${callId}/hangup`, null, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`✅ Call ${callId} terminated`);
            return { ok: true };
        }
        catch (e) {
            this.logger.error(`❌ Hangup failed for ${callId}:`, e.response?.status, e.response?.data ?? e.message);
            return { ok: false, error: e.response?.data ?? e.message };
        }
    }
    close(callId) {
        const sock = this.sockets.get(callId);
        if (sock && sock.readyState === ws_1.default.OPEN)
            sock.close(1000, 'done');
        this.sockets.delete(callId);
    }
};
exports.PhoneService = PhoneService;
exports.PhoneService = PhoneService = PhoneService_1 = __decorate([
    (0, common_1.Injectable)()
], PhoneService);
//# sourceMappingURL=phone.service.js.map