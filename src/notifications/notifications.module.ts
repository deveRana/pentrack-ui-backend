import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/database/prisma.module';
import { LoggerModule } from '@core/logger/logger.module';
import { AuthModule } from '@auth/auth.module';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';

@Module({
    imports: [PrismaModule, LoggerModule, AuthModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsRepository],
    exports: [NotificationsService],
})
export class NotificationsModule {}