import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml, SafeStyle} from '@angular/platform-browser';
import * as showdown from 'showdown';
import {HtmlGenerator, parse} from 'latex.js';
import {Observable} from 'rxjs';

export enum SupportedFormats {
  MARKDOWN = 'md',
  LATEX = 'tex',
  ASCIIDOC = 'adoc',
}
export class TextDocument {
  content: string;
  format: SupportedFormats;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

    format: string;

    @Input('textDocument')
    set textDocument(textDocument: TextDocument) {
        this.format = textDocument.format;
        this.content = textDocument.content;
        switch (this.format) {
            case SupportedFormats.MARKDOWN:
                const converter = new showdown.Converter({
                    tables: true,
                    strikethrough: true,
                });
                this.generator = {
                    convert: (s) => {
                        return {body: converter.makeHtml(s), style: ''};
                    }
                };
                break;
            case SupportedFormats.LATEX:
                this.generator = {
                    convert: (s) => {
                        const latexGenerator = new HtmlGenerator({hyphenate: false});
                        const parsed = parse(s, {generator: latexGenerator, documentClass: 'article'});
                        const doc = parsed.htmlDocument();
                        const style = doc.getElementsByTagName('html')[0].style.cssText;
                        return {body: doc.body.outerHTML, style};
                    }
                };
                break;
            case SupportedFormats.ASCIIDOC:
            default:
        }
        this.generatePreview();
    }

  content: string;
  // @Input('content')
  // set _content(value: string) {
  //   this.content = value;
  //   this.generatePreview();
  // }

  @Input()
  modified: boolean;

  generator: IViewGenerator;
  convertedContent: SafeHtml;
  style: SafeStyle;

  constructor(private sanitizer: DomSanitizer) {
    // nothing to see here
  }

  ngOnInit() {
  }

  private generatePreview(): void {
    if (!!this.content) {
      const res = this.generator.convert(this.content);
      this.convertedContent = this.sanitizer.bypassSecurityTrustHtml(res.body);
      this.style = this.sanitizer.bypassSecurityTrustStyle(res.style);
    } else {
      this.convertedContent = undefined;
    }
  }
}

interface IViewGenerator {
  convert: (content: string) => {body: string, style: string };
}
