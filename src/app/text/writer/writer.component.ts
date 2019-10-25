import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';

@Component({
  selector: 'app-writer',
  templateUrl: './writer.component.html',
  styleUrls: ['./writer.component.css']
})
export class WriterComponent implements AfterViewInit {

  @Input()
  name: string;
  content: string;
  showingPreview = true;
  @Input('content')
  set _content(val: string) {
    this.content = val;
    this.originalContent = val;
    this.modified = false;
  }
  originalContent: string;
  @Output()
  contentChange: EventEmitter<string> = new EventEmitter<string>();

  modified: boolean;
  @ViewChild("myInput", { static: true })
  myInput: ElementRef<HTMLInputElement>;

  @ViewChild('autosize', { static: false })
  txtAreaAutosize: CdkTextareaAutosize;

  switchText = 'Original';

  constructor(private ref: ChangeDetectorRef) {
    // nothing to see here
  }

  ngAfterViewInit(): void {
    this.myInput.nativeElement.focus();
    this.ref.detectChanges();
  }

  changeContent() {
    this.modified = this.originalContent !== this.content;
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
    this.switchText = this.showingPreview ? 'Original' : 'Preview';
  }
}
