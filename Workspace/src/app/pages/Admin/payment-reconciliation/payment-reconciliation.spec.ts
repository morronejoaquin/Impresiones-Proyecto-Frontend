import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReconciliationComponent } from './payment-reconciliation';

describe('PaymentReconciliationComponent', () => {
  let component: PaymentReconciliationComponent;
  let fixture: ComponentFixture<PaymentReconciliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReconciliationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentReconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
