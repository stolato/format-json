import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogListJsonComponent } from './dialog-list-json.component';

describe('DialogListJsonComponent', () => {
  let component: DialogListJsonComponent;
  let fixture: ComponentFixture<DialogListJsonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogListJsonComponent]
    });
    fixture = TestBed.createComponent(DialogListJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
