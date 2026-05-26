import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedCosts } from './fixed-costs';

describe('FixedCosts', () => {
  let component: FixedCosts;
  let fixture: ComponentFixture<FixedCosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedCosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedCosts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
