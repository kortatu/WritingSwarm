import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFilesViewerComponent } from './project-files-viewer.component';
import {MatIconModule, MatTreeModule} from '@angular/material';
import {ChangeDetectorRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';

class MockHttpClient {
  constructor() {
  }
}

describe('ProjectFilesViewerComponent', () => {
  let component: ProjectFilesViewerComponent;
  let fixture: ComponentFixture<ProjectFilesViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectFilesViewerComponent ],
      imports: [ MatTreeModule, MatIconModule ],
      providers: [
        {provide: HttpClient, useClass: MockHttpClient},
        {
          provide: ChangeDetectorRef,
          useValue: {
            markForCheck: () => {
            },
            detectChanges: () => {
            }
          },
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFilesViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
