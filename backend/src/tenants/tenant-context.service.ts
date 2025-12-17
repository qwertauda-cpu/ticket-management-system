import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type TenantStore = { tenantId: string };

@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<TenantStore>();

  runWithTenantId<T>(tenantId: string, fn: () => T): T {
    return this.als.run({ tenantId }, fn);
  }

  getTenantId(): string | undefined {
    return this.als.getStore()?.tenantId;
  }
}


