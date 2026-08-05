import { CanActivateFn } from '@angular/router';

export const istokenGuard: CanActivateFn = (route, state) => {
  return true;
};
