import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { WriterComponent } from './text/writer/writer.component';
import {FormsModule} from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule, MatInputModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    WriterComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
