import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceHistoryAdmin } from './price-history-admin';

describe('PriceHistoryAdmin', () => {
  let component: PriceHistoryAdmin;
  let fixture: ComponentFixture<PriceHistoryAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceHistoryAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceHistoryAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
