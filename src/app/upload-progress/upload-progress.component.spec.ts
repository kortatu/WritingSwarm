import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {FileUploadModel, UploadProgressComponent} from './upload-progress.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatFormFieldModule, MatIconModule, MatProgressBarModule} from '@angular/material';
import {of} from 'rxjs';
import {HttpResponse} from '@angular/common/http';

describe('UploadProgressComponent', () => {
  let component: UploadProgressComponent<any>;
  let fixture: ComponentFixture<UploadProgressComponent<any>>;

  beforeEach(async(() => {
    const matDialogRefJasmine = jasmine.createSpyObj('MatDialogRef', ['close']);
    const fileUploadModel = new FileUploadModel<string>("testFileName", () => {
      return of(new HttpResponse({body: "result"}));
    });
    TestBed.configureTestingModule({
      declarations: [ UploadProgressComponent ],
      imports: [MatDialogModule, MatProgressBarModule, MatFormFieldModule, MatIconModule],
      providers: [
        {
          provide: MatDialogRef, useValue: matDialogRefJasmine
        },
        {provide: MAT_DIALOG_DATA, useValue: fileUploadModel}
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
