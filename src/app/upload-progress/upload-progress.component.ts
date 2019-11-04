import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, ThemePalette} from '@angular/material';
import {Observable, of, Subscription} from 'rxjs';
import {catchError, last, map, tap} from 'rxjs/operators';
import {HttpErrorResponse, HttpEvent, HttpEventType} from '@angular/common/http';

export class FileUploadModel<R> {
  fileName: string;
  state: string;
  inProgress: boolean;
  progress: number;
  sub?: Subscription;
  failed: boolean;
  start: () => Observable<HttpEvent<R>>;
  color: ThemePalette;
  result: R;
  error: string;

  constructor(fileName: string, startF: () => Observable<HttpEvent<R>>) {
    this.fileName = fileName;
    this.state = 'in';
    this.inProgress = false;
    this.progress = 0;
    this.failed = false;
    this.start = startF;
    this.color = 'primary';
  }
}

@Component({
  selector: 'app-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss']
})
export class UploadProgressComponent<R> implements OnInit {

  constructor(public dialogRef: MatDialogRef<UploadProgressComponent<R>>,
              @Inject(MAT_DIALOG_DATA) public file: FileUploadModel<R>) { }

  ngOnInit() {
    this.start();
  }

  cancelFile(file: FileUploadModel<R>) {
    file.sub.unsubscribe();
    // this.removeFileFromArray(file);
  }

  start() {
    this.file.sub = this.file.start().pipe(
        map(event => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              this.file.progress =
                  Math.round(event.loaded * 100 / event.total);
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        tap(message => {}),
        last(),
        catchError((error: HttpErrorResponse) => {
          this.file.inProgress = false;
          this.file.failed = true;
          this.file.color = 'warn';
          const message = error.message.length < 40
              ? error.message :
              error.message.substring(0, 40) + "...";
          this.file.error = `${this.file.fileName} upload failed. ${message}`;
          return of(this.file.error);
        })
    ).subscribe(
        (event: any) => {
          if (typeof (event) === 'object') {
            console.log("Event", event);
            this.file.inProgress = false;
            this.file.result = event.body;
          }
        }
    );
  }
}
