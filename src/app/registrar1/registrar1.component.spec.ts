import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registrar1Component } from './registrar1.component';

describe('Registrar1Component', () => {
  let component: Registrar1Component;
  let fixture: ComponentFixture<Registrar1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registrar1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Registrar1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
