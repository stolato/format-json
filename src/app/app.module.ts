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
import { MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import { OpenFileComponent } from './components/open-file/open-file.component';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatFormFieldModule} from "@angular/material/form-field";
import { NotfoundComponent } from './pages/notfound/notfound.component';
import {LottieModule} from "ngx-lottie";
import {MatChipsModule} from "@angular/material/chips";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { SharedComponent } from './components/shared/shared.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgxSpinnerModule} from "ngx-spinner";
import {MatInputModule} from "@angular/material/input";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatMenuModule} from "@angular/material/menu";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DialogLoginComponent } from './components/dialogs/dialog-login/dialog-login.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatDividerModule} from "@angular/material/divider";
import { DialogRegisterComponent } from './components/dialogs/dialog-register/dialog-register.component';
import {HttpRequestInterceptor} from "./services/intercepctor";
import { DialogConfirmComponent } from './components/dialogs/dialog-confirm/dialog-confirm.component';
import {DialogListJsonComponent} from "./components/dialogs/dialog-list-json/dialog-list-json.component";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import { DialogOrganizationComponent } from './components/dialogs/dialog-organization/dialog-organization.component';

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
    SharedComponent,
    SidebarComponent,
    DialogLoginComponent,
    DialogRegisterComponent,
    DialogConfirmComponent,
    DialogListJsonComponent,
    DialogOrganizationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    MatSidenavModule,
    MatMenuModule,
    MatExpansionModule,
    MatDividerModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngJsoneditorModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ClipboardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSlideToggleModule,
    LottieModule.forRoot({player: playerFactory}),
    MatTableModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    { provide: HTTP_INTERCEPTORS , useClass: HttpRequestInterceptor, multi: true}
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
