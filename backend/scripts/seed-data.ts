import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create a demo company/tenant
  console.log('📦 Creating demo company...');
  const demoTenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant-123' },
    update: {},
    create: {
      id: 'demo-tenant-123',
      name: 'Demo Tech Company',
      companyName: 'شركة التقنية التجريبية',
      subscriptionPlan: 'Pro',
      subscriptionStatus: 'Active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxUsers: 50,
      maxTickets: 5000,
      isActive: true,
    },
  });

  console.log('✅ Demo company created:', demoTenant.companyName);

  // 2. Create wildcard permission for owner
  const ownerPermission = await prisma.permission.upsert({
    where: {
      tenantId_key: {
        tenantId: demoTenant.id,
        key: '*',
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      key: '*',
      description: 'Full access for owner',
    },
  });

  // 3. Create users
  console.log('👥 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Owner
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      passwordHash: hashedPassword,
      name: 'أحمد المالك',
    },
  });

  const ownerTenantUser = await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: ownerUser.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: ownerUser.id,
      isActive: true,
    },
  });

  await prisma.tenantUserPermission.upsert({
    where: {
      tenantUserId_permissionId: {
        tenantUserId: ownerTenantUser.id,
        permissionId: ownerPermission.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      tenantUserId: ownerTenantUser.id,
      permissionId: ownerPermission.id,
    },
  });

  console.log('✅ Owner created:', ownerUser.email);

  // Call Center Agent
  const ccUser = await prisma.user.upsert({
    where: { email: 'callcenter@demo.com' },
    update: {},
    create: {
      email: 'callcenter@demo.com',
      passwordHash: hashedPassword,
      name: 'فاطمة موظفة الكول سنتر',
    },
  });

  const ccTenantUser = await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: ccUser.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: ccUser.id,
      isActive: true,
    },
  });

  // Create Call Center permissions
  const ccPermissions = ['tickets:create', 'tickets:read', 'tickets:update', 'tickets:assign'];
  for (const permKey of ccPermissions) {
    const perm = await prisma.permission.upsert({
      where: {
        tenantId_key: {
          tenantId: demoTenant.id,
          key: permKey,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        key: permKey,
        description: `Call Center permission: ${permKey}`,
      },
    });

    await prisma.tenantUserPermission.upsert({
      where: {
        tenantUserId_permissionId: {
          tenantUserId: ccTenantUser.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        tenantUserId: ccTenantUser.id,
        permissionId: perm.id,
      },
    });
  }

  console.log('✅ Call Center created:', ccUser.email);

  // Team Leader
  const tlUser = await prisma.user.upsert({
    where: { email: 'teamleader@demo.com' },
    update: {},
    create: {
      email: 'teamleader@demo.com',
      passwordHash: hashedPassword,
      name: 'محمد قائد الفريق',
    },
  });

  const tlTenantUser = await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: tlUser.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: tlUser.id,
      isActive: true,
    },
  });

  // Create Team Leader permissions
  const tlPermissions = ['tickets:*', 'users:read', 'reports:read'];
  for (const permKey of tlPermissions) {
    const perm = await prisma.permission.upsert({
      where: {
        tenantId_key: {
          tenantId: demoTenant.id,
          key: permKey,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        key: permKey,
        description: `Team Leader permission: ${permKey}`,
      },
    });

    await prisma.tenantUserPermission.upsert({
      where: {
        tenantUserId_permissionId: {
          tenantUserId: tlTenantUser.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        tenantUserId: tlTenantUser.id,
        permissionId: perm.id,
      },
    });
  }

  console.log('✅ Team Leader created:', tlUser.email);

  // Technician 1
  const tech1User = await prisma.user.upsert({
    where: { email: 'tech1@demo.com' },
    update: {},
    create: {
      email: 'tech1@demo.com',
      passwordHash: hashedPassword,
      name: 'خالد الفني الأول',
    },
  });

  const tech1TenantUser = await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: tech1User.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: tech1User.id,
      isActive: true,
    },
  });

  // Create Technician permissions
  const techPermissions = ['tickets:read', 'tickets:update', 'tickets:start', 'tickets:finish'];
  for (const permKey of techPermissions) {
    const perm = await prisma.permission.upsert({
      where: {
        tenantId_key: {
          tenantId: demoTenant.id,
          key: permKey,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        key: permKey,
        description: `Technician permission: ${permKey}`,
      },
    });

    await prisma.tenantUserPermission.upsert({
      where: {
        tenantUserId_permissionId: {
          tenantUserId: tech1TenantUser.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        tenantUserId: tech1TenantUser.id,
        permissionId: perm.id,
      },
    });
  }

  console.log('✅ Technician 1 created:', tech1User.email);

  // Technician 2
  const tech2User = await prisma.user.upsert({
    where: { email: 'tech2@demo.com' },
    update: {},
    create: {
      email: 'tech2@demo.com',
      passwordHash: hashedPassword,
      name: 'علي الفني الثاني',
    },
  });

  const tech2TenantUser = await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: tech2User.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: tech2User.id,
      isActive: true,
    },
  });

  for (const permKey of techPermissions) {
    const perm = await prisma.permission.findFirst({
      where: {
        tenantId: demoTenant.id,
        key: permKey,
      },
    });

    if (perm) {
      await prisma.tenantUserPermission.upsert({
        where: {
          tenantUserId_permissionId: {
            tenantUserId: tech2TenantUser.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          tenantId: demoTenant.id,
          tenantUserId: tech2TenantUser.id,
          permissionId: perm.id,
        },
      });
    }
  }

  console.log('✅ Technician 2 created:', tech2User.email);

  // 4. Create sample tickets with different statuses
  console.log('🎫 Creating sample tickets...');

  const ticketsData = [
    {
      ticketNumber: 'T-2024-0001',
      ticketType: 'تركيب',
      phone: '0501234567',
      zone: 'الرياض - حي النخيل',
      description: 'تركيب جهاز جديد للعميل - مستعجل',
      status: 'OPEN',
      isNationalSla: false,
      assigneeType: null,
      assigneeId: null,
    },
    {
      ticketNumber: 'T-2024-0002',
      ticketType: 'صيانة',
      phone: '0507654321',
      zone: 'جدة - حي الحمراء',
      description: 'صيانة دورية للجهاز',
      status: 'ASSIGNED',
      isNationalSla: true,
      assigneeType: 'user',
      assigneeId: tech1TenantUser.id,
    },
    {
      ticketNumber: 'T-2024-0003',
      ticketType: 'استعلام',
      phone: '0551234567',
      zone: 'الدمام - حي الشاطئ',
      description: 'استفسار عن خدمة جديدة',
      status: 'IN_PROGRESS',
      isNationalSla: false,
      assigneeType: 'user',
      assigneeId: tech1TenantUser.id,
    },
    {
      ticketNumber: 'T-2024-0004',
      ticketType: 'صيانة',
      phone: '0509876543',
      zone: 'الرياض - حي العليا',
      description: 'إصلاح عطل في الجهاز',
      status: 'PAUSED',
      isNationalSla: false,
      assigneeType: 'user',
      assigneeId: tech2TenantUser.id,
    },
    {
      ticketNumber: 'T-2024-0005',
      ticketType: 'تركيب',
      phone: '0558765432',
      zone: 'مكة - حي العزيزية',
      description: 'تركيب جهاز جديد + تدريب',
      status: 'FINISHED',
      isNationalSla: false,
      assigneeType: 'user',
      assigneeId: tech2TenantUser.id,
    },
    {
      ticketNumber: 'T-2024-0006',
      ticketType: 'صيانة',
      phone: '0503456789',
      zone: 'الرياض - حي الملز',
      description: 'صيانة عاجلة - عطل كبير',
      status: 'QA_APPROVED',
      isNationalSla: false,
      assigneeType: 'user',
      assigneeId: tech1TenantUser.id,
    },
    {
      ticketNumber: 'T-2024-0007',
      ticketType: 'استعلام',
      phone: '0556789012',
      zone: 'جدة - حي الروضة',
      description: 'استفسار عن الأسعار',
      status: 'QA_REJECTED',
      isNationalSla: false,
      assigneeType: 'user',
      assigneeId: tech2TenantUser.id,
    },
    {
      ticketNumber: 'T-2024-0008',
      ticketType: 'تركيب',
      phone: '0502345678',
      zone: 'الدمام - حي الفيصلية',
      description: 'تركيب جهاز في مبنى جديد',
      status: 'ASSIGNED',
      isNationalSla: true,
      assigneeType: 'user',
      assigneeId: tech1TenantUser.id,
    },
  ];

  for (const ticketData of ticketsData) {
    const ticket = await prisma.ticket.create({
      data: {
        ...ticketData,
        tenantId: demoTenant.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last 7 days
      },
    });

    // Create timeline entries for tickets with history
    if (ticket.status !== 'OPEN') {
      await prisma.ticketHistory.create({
        data: {
          tenantId: demoTenant.id,
          ticketId: ticket.id,
          action: 'CREATE',
          performedBy: ccTenantUser.id,
          field: 'status',
          newValue: 'تم إنشاء التذكرة',
          createdAt: new Date(ticket.createdAt.getTime() + 1000),
        },
      });

      if (ticket.assigneeId) {
        await prisma.ticketHistory.create({
          data: {
            tenantId: demoTenant.id,
            ticketId: ticket.id,
            action: 'ASSIGN',
            performedBy: ccTenantUser.id,
            field: 'assignee',
            newValue: ticket.assigneeId,
            createdAt: new Date(ticket.createdAt.getTime() + 60000),
          },
        });
      }

      if (['IN_PROGRESS', 'PAUSED', 'FINISHED', 'QA_APPROVED', 'QA_REJECTED'].includes(ticket.status)) {
        await prisma.ticketHistory.create({
          data: {
            tenantId: demoTenant.id,
            ticketId: ticket.id,
            action: 'START',
            performedBy: ticket.assigneeId!,
            field: 'status',
            oldValue: 'ASSIGNED',
            newValue: 'IN_PROGRESS',
            createdAt: new Date(ticket.createdAt.getTime() + 120000),
          },
        });
      }

      if (ticket.status === 'PAUSED') {
        await prisma.ticketHistory.create({
          data: {
            tenantId: demoTenant.id,
            ticketId: ticket.id,
            action: 'PAUSE',
            performedBy: ticket.assigneeId!,
            field: 'status',
            oldValue: 'IN_PROGRESS',
            newValue: 'PAUSED',
            createdAt: new Date(ticket.createdAt.getTime() + 180000),
          },
        });
      }

      if (['FINISHED', 'QA_APPROVED', 'QA_REJECTED'].includes(ticket.status)) {
        await prisma.ticketHistory.create({
          data: {
            tenantId: demoTenant.id,
            ticketId: ticket.id,
            action: 'FINISH',
            performedBy: ticket.assigneeId!,
            field: 'status',
            oldValue: ticket.status === 'PAUSED' ? 'PAUSED' : 'IN_PROGRESS',
            newValue: 'FINISHED',
            createdAt: new Date(ticket.createdAt.getTime() + 240000),
          },
        });
      }

      if (ticket.status === 'QA_APPROVED') {
        await prisma.ticketHistory.create({
          data: {
            tenantId: demoTenant.id,
            ticketId: ticket.id,
            action: 'QA_APPROVE',
            performedBy: tlTenantUser.id,
            field: 'qaStatus',
            oldValue: 'FINISHED',
            newValue: 'QA_APPROVED',
            createdAt: new Date(ticket.createdAt.getTime() + 300000),
          },
        });
      }

      if (ticket.status === 'QA_REJECTED') {
        await prisma.ticketHistory.create({
          data: {
            tenantId: demoTenant.id,
            ticketId: ticket.id,
            action: 'QA_REJECT',
            performedBy: tlTenantUser.id,
            field: 'qaStatus',
            oldValue: 'FINISHED',
            newValue: 'QA_REJECTED',
            createdAt: new Date(ticket.createdAt.getTime() + 300000),
          },
        });
      }
    }

    console.log(`✅ Ticket created: ${ticket.ticketNumber} (${ticket.status})`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏢 Company: شركة التقنية التجريبية');
  console.log('👥 Users created:');
  console.log('   • Owner: owner@demo.com (password: password123)');
  console.log('   • Call Center: callcenter@demo.com (password: password123)');
  console.log('   • Team Leader: teamleader@demo.com (password: password123)');
  console.log('   • Technician 1: tech1@demo.com (password: password123)');
  console.log('   • Technician 2: tech2@demo.com (password: password123)');
  console.log(`🎫 Tickets: ${ticketsData.length} sample tickets with different statuses`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

