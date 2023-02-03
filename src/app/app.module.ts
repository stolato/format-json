import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PrettyJsonPipe} from "./pipes/prettyjson.pipe";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AngJsoneditorModule} from "@maaxgr/ang-jsoneditor";

@NgModule({
  declarations: [
    AppComponent,
    PrettyJsonPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AngJsoneditorModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
