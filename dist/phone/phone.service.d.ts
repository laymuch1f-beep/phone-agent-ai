export declare class PhoneService {
    private readonly logger;
    private readonly apiKey;
    private sockets;
    private get authHeader();
    acceptCall(callId: string, opts?: {
        instructions?: string;
        model?: string;
    }): Promise<any>;
    connect(callId: string): Promise<void>;
    handleIncomingCall(callId: string): Promise<{
        control: {
            action: string;
            parameters: {
                voice: string;
                instructions: string;
                turn_detection: {
                    type: string;
                };
            };
        };
    }>;
    terminateCall(callId: string): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: any;
    }>;
    close(callId: string): void;
}
