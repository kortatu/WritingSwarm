import {BrowserModule} from '@angular/platform-browser';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';
import {WriterComponent} from './text/writer/writer.component';
import {FormsModule} from '@angular/forms';
import {LoginComponent} from './login/login.component';
import {NewfileComponent} from './newfile/newfile.component';
import {UploadProgressComponent} from './upload-progress/upload-progress.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    WriterComponent,
    LoginComponent,
    NewfileComponent,
    UploadProgressComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressBarModule,
  ],
  entryComponents: [
    NewfileComponent,
    UploadProgressComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {
}
