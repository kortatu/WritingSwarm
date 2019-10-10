import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NewfileComponent, NewfileData} from './newfile.component';
import {MAT_DIALOG_DATA, MatButtonModule, MatDialogModule, MatDialogRef, MatFormFieldModule, MatInputModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {DebugElement, Predicate} from '@angular/core';

const testElementName = 'TestName';
const MODEL_ATTRIBUTE = 'ng-reflect-model';
describe('NewfileComponent', () => {
  let component: NewfileComponent;
  let debugElement: DebugElement;
  let fixture: ComponentFixture<NewfileComponent>;
  let matDialogCloseSpy;
  const matDialogDataProvider = {
    name: testElementName,
    type: "md",
  };

  beforeEach(async(() => {
    const matDialogRefJasmine = jasmine.createSpyObj('MatDialogRef', ['close']);
    matDialogCloseSpy = matDialogRefJasmine.close;
    matDialogDataProvider.name = testElementName;
    TestBed.configureTestingModule({
      declarations: [NewfileComponent],
      imports: [MatFormFieldModule, MatInputModule, MatDialogModule,
        FormsModule, NoopAnimationsModule, MatButtonModule],
      providers: [
        {
          provide: MatDialogRef, useValue: matDialogRefJasmine
        },
        {provide: MAT_DIALOG_DATA, useValue: matDialogDataProvider}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Ok button', () => {
    const buttons = debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2, "There should be 2 buttons");
    const okButton = debugElement.query(and(By.css('button'), WithText('Ok')));
    expect(okButton).not.toBeUndefined();
  });

  it('should have name element filled in', () => {
    const input: DebugElement = debugElement.query(By.css('input'));
    expect(input).not.toBeUndefined();
    expect(input.attributes[MODEL_ATTRIBUTE]).toBe(testElementName);
  });

  it('should call close on Ok', async () => {
    const inputDebugElement = debugElement.query(By.css('input'));
    const okButton = debugElement.query(and(By.css('button'), WithText('Ok')));

    // Element has NewName as model, expected input ng-model to change
    component.data.name = 'NewName';
    fixture.detectChanges();
    expect(inputDebugElement.attributes[MODEL_ATTRIBUTE]).toBe('NewName');

    // Close still not called
    expect(matDialogCloseSpy.calls.any()).toBe(false, 'close still not called');

    // User clicks ok, and close called with expected name value (NewName)
    okButton.nativeElement.click();
    expect(matDialogCloseSpy.calls.any()).toBe(true, 'close called');
    expect(matDialogCloseSpy.calls.argsFor(0)[0].name).toBe('NewName', 'close called with NewName');
  });

  it('should change data name when user input', async () => {
    const inputDebugElement = debugElement.query(By.css('input'));
    const inputElement: HTMLInputElement = inputDebugElement.nativeElement;
    inputElement.value = 'NewestName';
    inputElement.dispatchEvent(newEvent('input'));
    fixture.detectChanges();
    // User input changes model name
    expect(component.data.name).toBe('NewestName');
  });
});

function and<T>(p1, p2: Predicate<T>): Predicate<T> {
  return (t: T) => {
    return p1(t) && p2(t);
  };
}

function or<T>(p1, p2: Predicate<T>): Predicate<T> {
  return (t: T) => {
    return p1(t) || p2(t);
  };
}

function WithText(text: string): Predicate<DebugElement> {
  return (subElement: DebugElement) => {
    return subElement.nativeElement.textContent === text;
  };
}

function newEvent(eventName: string, bubbles = false, cancelable = false): CustomEvent {
  const evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}
