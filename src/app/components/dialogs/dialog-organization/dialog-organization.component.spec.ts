import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOrganizationComponent } from './dialog-organization.component';

describe('DialogOrganizationComponent', () => {
  let component: DialogOrganizationComponent;
  let fixture: ComponentFixture<DialogOrganizationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogOrganizationComponent]
    });
    fixture = TestBed.createComponent(DialogOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
