import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorListasComponent } from './gestor-listas.component';

describe('GestorListasComponent', () => {
  let component: GestorListasComponent;
  let fixture: ComponentFixture<GestorListasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorListasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestorListasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
