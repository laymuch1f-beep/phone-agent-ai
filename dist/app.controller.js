"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const openai_1 = require("openai");
const phone_service_1 = require("./phone/phone.service");
let AppController = class AppController {
    constructor(appService, phoneService) {
        this.appService = appService;
        this.phoneService = phoneService;
        this.client = new openai_1.OpenAI();
        this.webhookSecret = process.env.OPENAI_WEBHOOK_VERIFICATION_KEY;
    }
    getHello() {
        return this.appService.getHello();
    }
    async webhook(req) {
        try {
            const event = await this.client.webhooks.unwrap(req.rawBody.toString(), req.headers, this.webhookSecret);
            if (event.type === 'realtime.call.incoming' && event?.data?.call_id) {
                return this.phoneService.handleIncomingCall(event.data.call_id);
            }
            return 'pong';
        }
        catch (e) {
            if (e instanceof openai_1.OpenAI.InvalidWebhookSignatureError) {
                throw new common_1.UnauthorizedException('Invalid signature');
            }
            else {
                throw new common_1.BadRequestException(e.message);
            }
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "webhook", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        phone_service_1.PhoneService])
], AppController);
//# sourceMappingURL=app.controller.js.map