export type JwtPayload = {
  sub: string;
  tenantId?: string;
  tenantUserId?: string;
  email?: string;
  name?: string;
  permissions?: string[];
  isOwner?: boolean;
  iat?: number;
  exp?: number;
};

export type AuthUser = {
  userId: string;
  sub?: string;
  tenantId?: string;
  tenantUserId?: string;
  email?: string;
  name?: string;
  permissions?: string[];
  isOwner?: boolean;
};

declare module 'express-serve-static-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Request {
    user?: AuthUser;
  }
}


