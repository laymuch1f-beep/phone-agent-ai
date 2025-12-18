"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppController", {
    enumerable: true,
    get: function() {
        return AppController;
    }
});
const _common = require("@nestjs/common");
const _appservice = require("./app.service");
const _openai = require("openai");
const _phoneservice = require("./phone/phone.service");
const _aiservice = require("./ai/ai.service");
const _searchservice = require("./search/search.service");
const _domainservice = require("./domain/domain.service");
const _voiceservice = require("./voice/voice.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let AppController = class AppController {
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'phone-agent'
        };
    }
    getHello() {
        return this.appService.getHello();
    }
    async webhook(req) {
        console.log('📞 Webhook received at:', new Date().toISOString());
        try {
            const event = await this.client.webhooks.unwrap(req.rawBody.toString(), req.headers, this.webhookSecret);
            console.log('✅ Webhook verified, event type:', event.type);
            if (event.type === 'realtime.call.incoming' && event?.data?.call_id) {
                console.log('📱 Incoming call ID:', event.data.call_id);
                return this.phoneService.handleIncomingCall(event.data.call_id);
            }
            return 'pong';
        } catch (e) {
            console.error('❌ Webhook error:', e);
            if (e instanceof _openai.OpenAI.InvalidWebhookSignatureError) {
                throw new _common.UnauthorizedException('Invalid signature');
            } else {
                throw new _common.BadRequestException(e.message);
            }
        }
    }
    async search(query) {
        console.log(`🔍 Search endpoint - Query: ${query}`);
        const results = await this.searchService.search(query, 5);
        return {
            query,
            resultsCount: results.length,
            results,
            timestamp: new Date().toISOString()
        };
    }
    async searchPost(body) {
        console.log(`🔍 POST Search - Query: ${body.query}`);
        const results = await this.searchService.search(body.query, body.maxResults || 5);
        return {
            query: body.query,
            resultsCount: results.length,
            results,
            timestamp: new Date().toISOString()
        };
    }
    async checkDomain(domain) {
        console.log(`🌐 Domain check - Domain: ${domain}`);
        const availability = await this.domainService.checkDomainAvailability(domain);
        const quote = availability.available ? await this.domainService.getDomainQuote(domain) : null;
        return {
            ...availability,
            quote,
            timestamp: new Date().toISOString()
        };
    }
    async checkDomainPost(body) {
        console.log(`🌐 Domain check - Domain: ${body.domain}`);
        const availability = await this.domainService.checkDomainAvailability(body.domain);
        const quote = availability.available ? await this.domainService.getDomainQuote(body.domain) : null;
        return {
            ...availability,
            quote,
            timestamp: new Date().toISOString()
        };
    }
    async suggestDomains(keyword) {
        console.log(`💡 Domain suggestions - Keyword: ${keyword}`);
        const suggestions = await this.domainService.getDomainSuggestions(keyword);
        return {
            keyword,
            suggestions,
            count: suggestions.length,
            timestamp: new Date().toISOString()
        };
    }
    async getVoiceQualityParams() {
        const params = this.voiceService.getOptimalVoiceParameters();
        return {
            ...params,
            timestamp: new Date().toISOString()
        };
    }
    async analyzeVoice(body) {
        console.log(`🎤 Voice analysis - Transcription: ${body.transcription.substring(0, 50)}...`);
        const analysis = this.voiceService.analyzeSpeech(body.transcription, body.audioMetrics);
        const report = this.voiceService.generateQualityReport(analysis);
        return {
            analysis,
            report,
            timestamp: new Date().toISOString()
        };
    }
    async getConversation(callId) {
        console.log(`💬 Retrieving conversation - Call ID: ${callId}`);
        const memory = this.aiService.getMemory(callId);
        if (!memory) {
            throw new _common.BadRequestException(`No conversation found for call ID: ${callId}`);
        }
        return {
            callId,
            summary: this.aiService.getConversationSummary(callId),
            memory,
            timestamp: new Date().toISOString()
        };
    }
    async addConversationMessage(callId, body) {
        console.log(`💬 Adding message to conversation - Call ID: ${callId}`);
        this.aiService.addConversationTurn(callId, body.role, body.content);
        const memory = this.aiService.getMemory(callId);
        return {
            callId,
            messageAdded: true,
            memory,
            timestamp: new Date().toISOString()
        };
    }
    async getConversationSummary(callId) {
        console.log(`📋 Getting conversation summary - Call ID: ${callId}`);
        const summary = this.aiService.getConversationSummary(callId);
        if (!summary) {
            throw new _common.BadRequestException(`No conversation found for call ID: ${callId}`);
        }
        return {
            callId,
            summary,
            timestamp: new Date().toISOString()
        };
    }
    async updateConversationContext(callId, body) {
        console.log(`🔧 Updating conversation context - Call ID: ${callId}`);
        this.aiService.updateContext(callId, body);
        const memory = this.aiService.getMemory(callId);
        return {
            callId,
            contextUpdated: true,
            memory,
            timestamp: new Date().toISOString()
        };
    }
    async deleteConversation(callId) {
        console.log(`🗑️ Deleting conversation - Call ID: ${callId}`);
        this.aiService.clearMemory(callId);
        return {
            callId,
            deleted: true,
            timestamp: new Date().toISOString()
        };
    }
    async getServiceStatus() {
        return {
            status: 'operational',
            services: {
                phoneAgent: 'active',
                aiConversation: 'active',
                internetSearch: 'active',
                domainCheck: 'active',
                voiceRecognition: 'active'
            },
            timestamp: new Date().toISOString()
        };
    }
    constructor(appService, phoneService, aiService, searchService, domainService, voiceService){
        this.appService = appService;
        this.phoneService = phoneService;
        this.aiService = aiService;
        this.searchService = searchService;
        this.domainService = domainService;
        this.voiceService = voiceService;
        this.client = new _openai.OpenAI();
        this.webhookSecret = process.env.OPENAI_WEBHOOK_VERIFICATION_KEY;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Object)
], AppController.prototype, "getHealth", null);
_ts_decorate([
    (0, _common.Get)('/hello'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
_ts_decorate([
    (0, _common.Post)('webhook'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _common.RawBodyRequest === "undefined" ? Object : _common.RawBodyRequest
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "webhook", null);
_ts_decorate([
    (0, _common.Get)('/search/:query'),
    _ts_param(0, (0, _common.Param)('query')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "search", null);
_ts_decorate([
    (0, _common.Post)('/search'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "searchPost", null);
_ts_decorate([
    (0, _common.Get)('/domain/check/:domain'),
    _ts_param(0, (0, _common.Param)('domain')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "checkDomain", null);
_ts_decorate([
    (0, _common.Post)('/domain/check'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "checkDomainPost", null);
_ts_decorate([
    (0, _common.Get)('/domain/suggest/:keyword'),
    _ts_param(0, (0, _common.Param)('keyword')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "suggestDomains", null);
_ts_decorate([
    (0, _common.Get)('/voice/quality'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "getVoiceQualityParams", null);
_ts_decorate([
    (0, _common.Post)('/voice/analyze'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "analyzeVoice", null);
_ts_decorate([
    (0, _common.Get)('/conversation/:callId'),
    _ts_param(0, (0, _common.Param)('callId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "getConversation", null);
_ts_decorate([
    (0, _common.Post)('/conversation/:callId/message'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Param)('callId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "addConversationMessage", null);
_ts_decorate([
    (0, _common.Get)('/conversation/:callId/summary'),
    _ts_param(0, (0, _common.Param)('callId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "getConversationSummary", null);
_ts_decorate([
    (0, _common.Post)('/conversation/:callId/context'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Param)('callId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Record === "undefined" ? Object : Record
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "updateConversationContext", null);
_ts_decorate([
    (0, _common.Delete)('/conversation/:callId'),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Param)('callId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "deleteConversation", null);
_ts_decorate([
    (0, _common.Get)('/status'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], AppController.prototype, "getServiceStatus", null);
AppController = _ts_decorate([
    (0, _common.Controller)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appservice.AppService === "undefined" ? Object : _appservice.AppService,
        typeof _phoneservice.PhoneService === "undefined" ? Object : _phoneservice.PhoneService,
        typeof _aiservice.AIService === "undefined" ? Object : _aiservice.AIService,
        typeof _searchservice.InternetSearchService === "undefined" ? Object : _searchservice.InternetSearchService,
        typeof _domainservice.DomainService === "undefined" ? Object : _domainservice.DomainService,
        typeof _voiceservice.VoiceRecognitionService === "undefined" ? Object : _voiceservice.VoiceRecognitionService
    ])
], AppController);

//# sourceMappingURL=app.controller.js.map