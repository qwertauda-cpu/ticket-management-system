import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from '@nestjs/common';
import { defer, type Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const tenantId: string | undefined = request?.user?.tenantId;

    if (!tenantId) {
      return next.handle();
    }

    return defer(() => this.tenantContext.runWithTenantId(tenantId, () => next.handle()));
  }
}


