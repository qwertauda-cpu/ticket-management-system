import { SetMetadata } from '@nestjs/common';
import { REQUIRE_PERMISSIONS_KEY } from './permissions.constants';

export const RequirePermissions = (...keys: string[]) => SetMetadata(REQUIRE_PERMISSIONS_KEY, keys);


