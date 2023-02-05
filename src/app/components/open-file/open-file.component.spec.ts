import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenFileComponent } from './open-file.component';

describe('OpenFileComponent', () => {
  let component: OpenFileComponent;
  let fixture: ComponentFixture<OpenFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
