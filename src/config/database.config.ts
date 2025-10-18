import {Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}
    createTypeOrmOptions(): TypeOrmModuleOptions {
        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development'); 
        return {
            type: 'postgres',
            host: this.configService.get<string>('DATABASE_HOST', 'localhost'), 
            port: this.configService.get<number>('DATABASE_PORT', 5432),
            username: this.configService.get<string>('DATABASE_USERNAME'),
            password: this.configService.get<string>('DATABASE_PASSWORD'),
            database: this.configService.get<string>('DATABASE_NAME'),
            url: this.configService.get<string>('DATABASE_URL'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
            synchronize: nodeEnv === 'development',
            logging: nodeEnv === 'development',
            ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
            // Make connection non-critical for testing
            retryAttempts: 3,   
            retryDelay: 3000,
            autoLoadEntities: true,
            extra: {
                max: 25, // Maximum number of connections in the pool
                min: 5,  // Minimum number of connections in the pool
                acquire: 30000, // Maximum time to get connection
                idle: 10000,    // Maximum time connection can be idle
            },
        };
    }
}