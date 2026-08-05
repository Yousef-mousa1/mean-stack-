import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyCoupon } from './apply-coupon';

describe('ApplyCoupon', () => {
  let component: ApplyCoupon;
  let fixture: ComponentFixture<ApplyCoupon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyCoupon],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplyCoupon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
