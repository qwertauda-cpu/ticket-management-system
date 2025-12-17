import { ForbiddenException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient;

  constructor(private readonly tenantContext: TenantContextService) {
    const base = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    const tenantScopedModels = PrismaService.detectTenantScopedModels(base as any);

    this.client = (base as any).$extends({
      query: {
        $allModels: {
          async $allOperations(params: any) {
            const { model, operation, args, query } = params;
            const nextArgs = args ?? {};
            if (!model || !tenantScopedModels.has(model)) {
              return query(nextArgs);
            }

            const tenantId = tenantContext.getTenantId();
            if (!tenantId) {
              throw new ForbiddenException('Tenant context missing');
            }

            const ensureWhereHasTenant = () => {
              const where = (nextArgs as any).where ?? (((nextArgs as any).where) = {});
              if (where.tenantId === undefined) {
                throw new ForbiddenException('Tenant isolation requires where.tenantId');
              }
              if (where.tenantId !== tenantId) {
                throw new ForbiddenException('Cross-tenant access denied');
              }
            };

            const addTenantToWhere = () => {
              const where = (nextArgs as any)?.where ?? {};
              (nextArgs as any).where = { AND: [where, { tenantId }] };
            };

            const enforceTenantOnData = (data: Record<string, any>) => {
              if (data.tenantId !== undefined && data.tenantId !== tenantId) {
                throw new ForbiddenException('Cross-tenant write denied');
              }
              data.tenantId = tenantId;
            };

            switch (operation) {
              // Reads
              case 'findMany':
              case 'findFirst':
              case 'findFirstOrThrow':
              case 'aggregate':
              case 'count':
              case 'groupBy':
                addTenantToWhere();
                break;

              // Unique/point operations must be explicitly scoped
              case 'findUnique':
              case 'findUniqueOrThrow':
              case 'update':
              case 'delete':
              case 'upsert':
                ensureWhereHasTenant();
                break;

              // Bulk operations can be safely scoped
              case 'updateMany':
              case 'deleteMany':
                addTenantToWhere();
                break;

              // Writes
              case 'create': {
                const data = (nextArgs as any).data ?? (((nextArgs as any).data) = {});
                enforceTenantOnData(data);
                break;
              }
              case 'createMany': {
                const data = (nextArgs as any)?.data;
                if (Array.isArray(data)) {
                  for (const item of data) enforceTenantOnData(item);
                } else if (data && typeof data === 'object') {
                  enforceTenantOnData(data);
                }
                break;
              }
              default:
                break;
            }

            return query(nextArgs);
          },
        },
      },
    }) as PrismaClient;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  private static detectTenantScopedModels(prisma: any): ReadonlySet<string> {
    const runtimeModels: Record<string, { fields?: Array<{ name: string }> }> =
      (prisma?._runtimeDataModel?.models as any) ?? {};

    return new Set(
      Object.entries(runtimeModels)
        .filter(([, m]) => m?.fields?.some((f) => f.name === 'tenantId'))
        .map(([name]) => name),
    );
  }
}


