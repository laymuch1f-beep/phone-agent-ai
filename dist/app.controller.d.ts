import { RawBodyRequest } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { PhoneService } from './phone/phone.service';
export declare class AppController {
    private readonly appService;
    private readonly phoneService;
    constructor(appService: AppService, phoneService: PhoneService);
    private readonly client;
    private readonly webhookSecret;
    getHello(): string;
    webhook(req: RawBodyRequest<Request>): Promise<void | "pong">;
}
