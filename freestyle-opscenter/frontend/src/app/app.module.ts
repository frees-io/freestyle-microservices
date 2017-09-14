import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

// Presentational modules
import {  MdToolbarModule,
          MdButtonModule,
          MdSidenavModule,
          MdGridListModule,
          MdIconModule,
          MdListModule,
          MdProgressBarModule
        } from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// WsViewer
import { WsViewerComponent } from './ws-viewer/ws-viewer.component';
import { WsService } from './ws-viewer/ws.service';

@NgModule({
  declarations: [
    AppComponent,
    WsViewerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    AppRoutingModule,
    MdButtonModule,
    MdToolbarModule,
    MdSidenavModule,
    MdGridListModule,
    MdIconModule,
    MdListModule,
    MdProgressBarModule
  ],
  providers: [WsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
