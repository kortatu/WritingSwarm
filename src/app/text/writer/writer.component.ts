import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatDialog} from '@angular/material';
import {FileData, SelectFileComponent} from '../../select-file/select-file.component';
import {environment} from '../../../environments/environment';
import {SupportedFormats, TextDocument} from '../../preview/preview.component';

@Component({
  selector: 'app-writer',
  templateUrl: './writer.component.html',
  styleUrls: ['./writer.component.scss']
})
export class WriterComponent implements AfterViewInit {

  @Input('name')
  set _name(val: string) {
    this.name = val;
    if (this.name.endsWith('.tex')) {
      this.format = SupportedFormats.LATEX;
    } else {
      this.format = SupportedFormats.MARKDOWN;
    }
  }
  name: string;
  @Input()
  rootHash: string;
  content: string;
  format: SupportedFormats;
  textDocument: TextDocument;
  previewContent: string;
  showingPreview = true;
  @Input('content')
  set _content(val: string) {
    this.content = val;
    // this.format = 'tex';
    this.originalContent = val;
    this.previewContent = this.content;
    this.textDocument = new TextDocument();
    this.textDocument.content = this.previewContent;
    this.textDocument.format = this.format;
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

  constructor(private ref: ChangeDetectorRef,
              private matDialog: MatDialog) {
    // nothing to see here
  }

  ngAfterViewInit(): void {
    this.myInput.nativeElement.focus();
    this.ref.detectChanges();
  }

  changeContent() {
    this.modified = this.originalContent !== this.content;
    this.previewContent = this.showingPreview ? this.content : this.originalContent;
    this.textDocument = new TextDocument();
    this.textDocument.content = this.previewContent;
    this.textDocument.format = this.format;
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
    this.changeContent();
    this.switchText = this.showingPreview ? 'Original' : 'Preview';
  }

  async insertImage() {
    const textArea = this.myInput.nativeElement;
    const selectionStart = textArea.selectionStart;
    const selectionEnd = textArea.selectionEnd;
    const dialogRef = this.matDialog.open(SelectFileComponent, {
      width: '600px',
      data: {
        contentType: 'image',
        rootHash: this.rootHash,
      }
    });
    const result: FileData = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.content = textArea.value.substring(0, selectionStart)
          + this.getImageLinkText(result)
          + textArea.value.substring(selectionEnd);
      this.changeContent();
    }
  }

  private getImageLinkText(result: FileData) {
    const url = environment.swarmProxy + `/bzz-raw:/${result.hash}`;
    return ` ![${result.name}](${url}${result.size})`;
  }
}
