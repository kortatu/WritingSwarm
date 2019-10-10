import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {WriterComponent} from './writer.component';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule, MatInputModule,
  MatTooltipModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ChangeDetectorRef} from '@angular/core';

describe('WriterComponent', () => {
  let component: WriterComponent;
  let fixture: ComponentFixture<WriterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WriterComponent],
      imports: [
        FormsModule,
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        NoopAnimationsModule,
      ],
      providers: [{
          provide: DomSanitizer,
          useValue: {
            sanitize: () => 'safeString',
            bypassSecurityTrustHtml: () => 'safeString'
          }
        }, {
          provide: ChangeDetectorRef,
          useValue: {
            markForCheck: () => {},
            detectChanges: () => {},
          }
        }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
