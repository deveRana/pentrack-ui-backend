// src/core/context/request-context.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
    requestId: string;
    userId?: string;
    role?: string;
    timestamp: Date;
}

@Injectable()
export class RequestContextService {
    private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

    setContext(context: RequestContext): void {
        this.asyncLocalStorage.enterWith(context);
    }

    getContext(): RequestContext | undefined {
        return this.asyncLocalStorage.getStore();
    }

    getRequestId(): string | undefined {
        return this.getContext()?.requestId;
    }

    getUserId(): string | undefined {
        return this.getContext()?.userId;
    }

    getRole(): string | undefined {
        return this.getContext()?.role;
    }
}