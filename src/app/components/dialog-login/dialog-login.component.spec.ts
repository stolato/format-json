import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLoginComponent } from './dialog-login.component';

describe('DialogLoginComponent', () => {
  let component: DialogLoginComponent;
  let fixture: ComponentFixture<DialogLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogLoginComponent]
    });
    fixture = TestBed.createComponent(DialogLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
