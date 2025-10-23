import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/user.entities';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JournalModule } from './modules/journal/journal.module';
import { Journal } from './modules/journal/journal.entity';
import { DatabaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisConfig } from './config/redis.config';
import { GeminiModule } from './modules/gemini/gemini.module';
import { BullModule } from '@nestjs/bull';
import { BullConfig } from './config/bull.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync(
      {
        useClass: DatabaseConfig,
      }
    ),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: RedisConfig,
    }),

    BullModule.forRootAsync({
      useClass: BullConfig,
    }),
    
    ThrottlerModule.forRootAsync({
      useFactory: () => ([{
        ttl: parseInt(process.env.RATE_LIMIT_TTL!) || 60,
        limit: parseInt(process.env.RATE_LIMIT_LIMIT!) || 100,
      }]),
    }),
    UsersModule,
    AuthModule,
    JournalModule,
    GeminiModule,
  ],
})
export class AppModule {}
