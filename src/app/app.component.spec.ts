import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {
  MatCardModule,
  MatDialogModule,
  MatDialogRef,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {WriterComponent} from './text/writer/writer.component';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {ChangeDetectorRef} from '@angular/core';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent, LoginComponent, WriterComponent],
      imports: [MatCardModule, MatSidenavModule, MatIconModule, MatDividerModule,
        FormsModule, MatFormFieldModule, MatInputModule,
        MatToolbarModule, MatTooltipModule, MatDialogModule],
      providers: [
        {provide: HttpClient, useClass: MockHttpClient},
        {provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        },
        {provide: DomSanitizer,
          useValue: {
            sanitize: s => s,
            bypassSecurityTrustHtml: s => s
          }
        },
        {provide: ChangeDetectorRef,
          useValue: {
            markForCheck: () => {},
            detectChanges: () => {},
          }
        }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'WritingSwarm'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('WritingSwarm');
  });

  it('should render image logo', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const htmlImageElement = compiled.querySelector('img');
    expect(htmlImageElement).not.toBeNull();
    expect(htmlImageElement.getAttribute('alt')).toContain('Writing Swarm Logo');
  });
});

class MockHttpClient {
  constructor() {
  }
}
