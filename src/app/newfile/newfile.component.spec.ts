import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewfileComponent } from './newfile.component';

describe('NewfileComponent', () => {
  let component: NewfileComponent;
  let fixture: ComponentFixture<NewfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewfileComponent ]
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
