import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';


@Component({
  selector: 'app-writer',
  templateUrl: './writer.component.html',
  styleUrls: ['./writer.component.css']
})
export class WriterComponent implements AfterViewInit {

  @Input()
  path: string;
  content: string;
  sanitized: SafeHtml;
  @Input('content')
  set _content(val: string) {
    this.content = val;
    this.originalContent = val;
    this.sanitized = this.sanitizer.bypassSecurityTrustHtml(val);
    this.originalSanitized = this.sanitized;
    this.modified = false;
  }
  originalContent: string;
  originalSanitized: SafeHtml;
  @Output()
  contentChange: EventEmitter<string> = new EventEmitter<string>();

  modified: boolean;
  @ViewChild("myInput", { static: true })
  myInput: ElementRef<HTMLInputElement>;

  constructor(private sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
    this.myInput.nativeElement.focus();
  }

  changeContent() {
    this.modified = this.originalContent !== this.content;
    this.sanitized = this.sanitizer.bypassSecurityTrustHtml(this.content);
  }

  async saveContent(): Promise<void> {
    this.contentChange.emit(this.content);
  }

}
