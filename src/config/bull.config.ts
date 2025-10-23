import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BullModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bull';

@Injectable()
export class BullConfig implements SharedBullConfigurationFactory {
    constructor(private configService: ConfigService) {}

    createSharedConfiguration(): BullModuleOptions {
        const host = this.configService.get<string>('QUEUE_REDIS_HOST', 'localhost');
        const port = this.configService.get<number>('QUEUE_REDIS_PORT', 6379);
        const password = this.configService.get<string>('QUEUE_REDIS_PASSWORD');

        console.log(`Configuring Bull with Redis at ${host}:${port}`);

        return {
            redis: {
                host,
                port,
                password: password || undefined,
                maxRetriesPerRequest: null,
                
            },
            defaultJobOptions: {
                removeOnComplete: 10,
                removeOnFail: 5,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
        };
    }
}