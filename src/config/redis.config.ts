import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CacheModuleOptions, CacheOptionsFactory} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class RedisConfig implements CacheOptionsFactory{
    constructor(private readonly configService: ConfigService) {}

    createCacheOptions(): CacheModuleOptions{
        return {
            store: redisStore as any,
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD'),
            ttl: 300, // 5 minutes default TTL
            max: 1000, // Maximum number of items in cache
            isGlobal: true,
        }
    }
}