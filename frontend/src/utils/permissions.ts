// Permission utility functions

export function hasPermission(user: any, requiredPermission: string): boolean {
  if (!user) return false;
  
  // Owner has all permissions
  if (user.isOwner) return true;
  
  // Check if user has the specific permission or wildcard
  if (user.permissions) {
    return user.permissions.some((p: string) => 
      p === requiredPermission || 
      p === '*' || 
      p === requiredPermission.split(':')[0] + ':*'
    );
  }
  
  return false;
}

export function canCreateTicket(user: any): boolean {
  return hasPermission(user, 'tickets:create');
}

export function canAssignTicket(user: any): boolean {
  return hasPermission(user, 'tickets:assign');
}

export function canStartTicket(user: any): boolean {
  return hasPermission(user, 'tickets:start');
}

export function canFinishTicket(user: any): boolean {
  return hasPermission(user, 'tickets:finish');
}

export function canUpdateTicket(user: any): boolean {
  return hasPermission(user, 'tickets:update');
}

export function canDeleteTicket(user: any): boolean {
  return hasPermission(user, 'tickets:delete') || user.isOwner;
}

export function canQATicket(user: any): boolean {
  // QA is typically done by Team Leaders
  return hasPermission(user, 'tickets:*') || user.isOwner;
}

export function canManageUsers(user: any): boolean {
  return user?.isOwner || false;
}

export function canViewReports(user: any): boolean {
  return hasPermission(user, 'reports:read');
}

