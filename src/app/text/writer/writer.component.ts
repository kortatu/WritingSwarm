import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as showdown from 'showdown';

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
  rightPanel: SafeHtml;
  private showingPreview = true;
  @Input('content')
  set _content(val: string) {
    this.content = val;
    this.originalContent = val;
    this.sanitized = this.sanitizer.bypassSecurityTrustHtml(this.converter.makeHtml(val));
    this.originalSanitized = this.sanitized;
    this.modified = false;
    this.adjustRightPanel();
  }
  originalContent: string;
  originalSanitized: SafeHtml;
  @Output()
  contentChange: EventEmitter<string> = new EventEmitter<string>();

  modified: boolean;
  @ViewChild("myInput", { static: true })
  myInput: ElementRef<HTMLInputElement>;

  @ViewChild('autosize', { static: false })
  txtAreaAutosize: CdkTextareaAutosize;

  converter: showdown.Converter;
  switchText: string;

  constructor(private sanitizer: DomSanitizer) {
    this.converter = new showdown.Converter({
      tables: true,
      strikethrough: true,
    });
  }

  ngAfterViewInit(): void {
    this.myInput.nativeElement.focus();
  }

  changeContent() {
    this.modified = this.originalContent !== this.content;
    this.sanitized = this.sanitizer.bypassSecurityTrustHtml(this.converter.makeHtml(this.content));
    this.adjustRightPanel();
  }

  async saveContent(): Promise<void> {
    this.contentChange.emit(this.content);
  }

  /*
  [WritingSwarm.md]: http://localhost:8500/bzz:/3031a439391f543516d7e519f1ae79cee75eacde21941dfd70eea5e75571d20a/WritingSwarm.md
  [path]: environment.proxy/bzz:/rootHash+path
   */

  switchOriginal() {
    this.showingPreview = !this.showingPreview;
    this.adjustRightPanel();
  }

  private adjustRightPanel() {
    this.switchText = this.showingPreview ? 'Original' : 'Preview';
    this.rightPanel = this.showingPreview ? this.sanitized : this.originalSanitized;
  }
}
