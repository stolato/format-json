import { provideZoneChangeDetection, importProvidersFrom } from "@angular/core";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpRequestInterceptor } from "./app/services/interceptor";
import { provideLottieOptions } from "ngx-lottie";
import { SocketIoModule } from "ngx-socket-io";
import { environment } from "./environments/environment";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { AppRoutingModule } from "./app/app-routing.module";
import { NgxSpinnerModule } from "ngx-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatMenuModule } from "@angular/material/menu";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDividerModule } from "@angular/material/divider";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngJsoneditorModule } from "@maaxgr/ang-jsoneditor";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatChipsModule } from "@angular/material/chips";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatSelectModule } from "@angular/material/select";
import { AppComponent } from "./app/app.component";


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(SocketIoModule.forRoot({
            url: environment.socketUrl, options: {
                transports: ['websocket'],
                reconnection: true,
            }
        }), BrowserModule, AppRoutingModule, NgxSpinnerModule, MatSidenavModule, MatMenuModule, MatExpansionModule, MatDividerModule, FormsModule, ReactiveFormsModule, AngJsoneditorModule, MatToolbarModule, MatIconModule, MatButtonModule, MatDialogModule, ClipboardModule, MatSnackBarModule, MatTooltipModule, MatBottomSheetModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatSlideToggleModule, MatTableModule, MatPaginatorModule, MatSortModule, MatSelectModule),
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
        provideLottieOptions({
            player: () => import('lottie-web')
        }),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
