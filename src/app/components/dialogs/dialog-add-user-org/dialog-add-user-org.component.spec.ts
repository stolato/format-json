import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddUserOrgComponent } from './dialog-add-user-org.component';

describe('DialogAddUserOrgComponent', () => {
  let component: DialogAddUserOrgComponent;
  let fixture: ComponentFixture<DialogAddUserOrgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogAddUserOrgComponent]
    });
    fixture = TestBed.createComponent(DialogAddUserOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
