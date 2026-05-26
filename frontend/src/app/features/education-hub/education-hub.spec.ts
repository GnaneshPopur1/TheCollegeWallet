import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationHub } from './education-hub';

describe('EducationHub', () => {
  let component: EducationHub;
  let fixture: ComponentFixture<EducationHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationHub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
