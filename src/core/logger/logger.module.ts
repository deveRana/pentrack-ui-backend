// src/core/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { AppLogger } from './logger.service';

@Module({
    providers: [AppLogger],
    exports: [AppLogger],
})
export class LoggerModule { }