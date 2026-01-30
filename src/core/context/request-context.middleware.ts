// src/core/context/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from './request-context.service';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    constructor(private readonly contextService: RequestContextService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const requestId = (req.headers['x-request-id'] as string) || randomUUID();

        // Set request ID in response header
        res.setHeader('X-Request-Id', requestId);

        // Create context
        const context = {
            requestId,
            userId: req['user']?.id, // Will be set by auth guard
            role: req['user']?.role,
            timestamp: new Date(),
        };

        // Set context in async local storage
        this.contextService.setContext(context);

        next();
    }
}