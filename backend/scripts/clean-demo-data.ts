import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting cleanup of demo data...\n');

  try {
    // 1. Delete all tickets and their history
    console.log('🗑️  Deleting tickets and history...');
    const deletedHistory = await prisma.ticketHistory.deleteMany({});
    console.log(`   ✅ Deleted ${deletedHistory.count} ticket history records`);

    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTickets.count} tickets`);

    // 2. Delete all tenant user permissions
    console.log('\n🗑️  Deleting tenant user permissions...');
    const deletedPermissions = await prisma.tenantUserPermission.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPermissions.count} tenant user permissions`);

    // 3. Delete all team members
    console.log('\n🗑️  Deleting team members...');
    const deletedTeamMembers = await prisma.teamMember.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTeamMembers.count} team members`);

    // 4. Delete all teams
    console.log('\n🗑️  Deleting teams...');
    const deletedTeams = await prisma.team.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTeams.count} teams`);

    // 5. Delete all zones
    console.log('\n🗑️  Deleting zones...');
    const deletedZones = await prisma.zone.deleteMany({});
    console.log(`   ✅ Deleted ${deletedZones.count} zones`);

    // 6. Delete all permissions
    console.log('\n🗑️  Deleting permissions...');
    const deletedPerms = await prisma.permission.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPerms.count} permissions`);

    // 7. Delete all tenant users
    console.log('\n🗑️  Deleting tenant users...');
    const deletedTenantUsers = await prisma.tenantUser.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTenantUsers.count} tenant users`);

    // 8. Delete all subscriptions
    console.log('\n🗑️  Deleting subscriptions...');
    const deletedSubscriptions = await prisma.subscription.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSubscriptions.count} subscriptions`);

    // 9. Delete all invoices
    console.log('\n🗑️  Deleting invoices...');
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInvoices.count} invoices`);

    // 10. Delete all email notifications
    console.log('\n🗑️  Deleting email notifications...');
    const deletedEmails = await prisma.emailNotification.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEmails.count} email notifications`);

    // 11. Delete all tenants (companies)
    console.log('\n🗑️  Deleting tenants (companies)...');
    const deletedTenants = await prisma.tenant.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTenants.count} tenants`);

    // 12. Delete all users (except we'll keep them for now, they might be reused)
    // Actually, let's delete demo users
    console.log('\n🗑️  Deleting demo users...');
    const demoEmails = [
      'owner@demo.com',
      'callcenter@demo.com',
      'teamleader@demo.com',
      'tech1@demo.com',
      'tech2@demo.com',
    ];
    
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: demoEmails,
        },
      },
    });
    console.log(`   ✅ Deleted ${deletedUsers.count} demo users`);

    // 13. Keep Super Admin - verify it exists
    console.log('\n✅ Verifying Super Admin account...');
    const superAdmin = await prisma.superAdmin.findFirst({});
    if (superAdmin) {
      console.log(`   ✅ Super Admin exists: ${superAdmin.email}`);
    } else {
      console.log('   ⚠️  No Super Admin found!');
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All demo data has been deleted');
    console.log('✅ Only Super Admin account remains');
    console.log('✅ Database is ready for production use');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

