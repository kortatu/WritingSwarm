import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFileComponent } from './select-file.component';
import {ProjectFilesViewerComponent} from '../project-files-viewer/project-files-viewer.component';
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatTreeModule
} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {MockHttpClient} from '../test/mock-http-client';

describe('SelectFileComponent', () => {
  let component: SelectFileComponent;
  let fixture: ComponentFixture<SelectFileComponent>;
  let matDialogCloseSpy;
  const matDialogDataProvider = {
    contentType: 'image',
    rootHash: '',
  };

  beforeEach(async(() => {
    const matDialogRefJasmine = jasmine.createSpyObj('MatDialogRef', ['close']);
    matDialogCloseSpy = matDialogRefJasmine.close;
    TestBed.configureTestingModule({
      declarations: [ SelectFileComponent, ProjectFilesViewerComponent ],
      imports: [ MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule,
        MatTreeModule],
      providers: [
        {provide: HttpClient, useClass: MockHttpClient},
        {provide: MatDialogRef, useValue: matDialogRefJasmine},
        {provide: MAT_DIALOG_DATA, useValue: matDialogDataProvider}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
