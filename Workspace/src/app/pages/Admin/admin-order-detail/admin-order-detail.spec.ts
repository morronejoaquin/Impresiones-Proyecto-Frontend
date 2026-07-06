import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrderDetailPage } from './admin-order-detail';

describe('AdminOrderDetail', () => {
  let component: AdminOrderDetailPage;
  let fixture: ComponentFixture<AdminOrderDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrderDetailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrderDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
