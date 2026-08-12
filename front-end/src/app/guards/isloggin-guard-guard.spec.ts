import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { islogginGuardGuard } from './isloggin-guard-guard';

describe('islogginGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => islogginGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
