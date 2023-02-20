import { ComponentFixture, TestBed } from '@angular/core/testing';


import { HomepageComponent } from './homepage.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {HeaderComponent} from "../../components/header/header.component";

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomepageComponent ],
      imports: [MatSnackBarModule, MatBottomSheetModule, HeaderComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
