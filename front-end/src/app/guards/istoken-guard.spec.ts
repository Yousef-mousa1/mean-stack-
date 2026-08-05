import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { istokenGuard } from './istoken-guard';

describe('istokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => istokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
