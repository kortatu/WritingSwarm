import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as showdown from 'showdown';

export enum SupportedFormats {
  MARKDOWN = 'md',
  LATEX = 'tex',
  ASCIIDOC = 'adoc',
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {

  @Input('format')
  set format(value: SupportedFormats) {
    switch (value) {
      case SupportedFormats.MARKDOWN:
        this.converter = new showdown.Converter({
          tables: true,
          strikethrough: true,
        });
        break;
      case SupportedFormats.LATEX:
      case SupportedFormats.ASCIIDOC:
      default:
    }
    this.generatePreview();
  }

  content: string;
  @Input('content')
  set _content(value: string) {
    this.content = value;
    this.generatePreview();
  }

  @Input()
  modified: boolean;

  converter: showdown.Converter;
  convertedContent: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
    // nothing to see here
  }

  ngOnInit() {
  }

  private generatePreview(): void {
    if (!!this.content) {
      this.convertedContent = this.sanitizer.bypassSecurityTrustHtml(this.converter.makeHtml(this.content));
    } else {
      this.convertedContent = undefined;
    }
  }
}
