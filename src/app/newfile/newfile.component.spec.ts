import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NewfileComponent} from './newfile.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatFormFieldModule, MatInputModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('NewfileComponent', () => {
  let component: NewfileComponent;
  let fixture: ComponentFixture<NewfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewfileComponent ],
      imports: [ MatFormFieldModule, MatInputModule, MatDialogModule, FormsModule, NoopAnimationsModule ],
      providers: [
        {provide: MatDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: {
          name: "TestName",
          type: "md",
        }}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
