import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PrettyJsonPipe} from "./pipes/prettyjson.pipe";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AngJsoneditorModule} from "@maaxgr/ang-jsoneditor";
import { HomepageComponent } from './pages/homepage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import { OpenFileComponent } from './components/open-file/open-file.component';
import {MatBottomSheetModule, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MatFormFieldModule} from "@angular/material/form-field";
import { NotfoundComponent } from './pages/notfound/notfound.component';
import {LottieModule} from "ngx-lottie";
import {MatChipsModule} from "@angular/material/chips";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

export function playerFactory() {
  return import(/* webpackChunkName: 'lottie-web' */ 'lottie-web');
}

@NgModule({
  declarations: [
    AppComponent,
    PrettyJsonPipe,
    HomepageComponent,
    HeaderComponent,
    OpenFileComponent,
    NotfoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AngJsoneditorModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    ClipboardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSlideToggleModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
