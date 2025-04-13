import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddOrgComponent } from './dialog-add-org.component';

describe('DialogAddOrgComponent', () => {
  let component: DialogAddOrgComponent;
  let fixture: ComponentFixture<DialogAddOrgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogAddOrgComponent]
    });
    fixture = TestBed.createComponent(DialogAddOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
