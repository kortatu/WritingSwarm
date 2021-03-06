import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ProjectFile} from '../project-files';
import {environment} from '../../environments/environment';

export class FileData {
  hash: string;
  name: string;
  size: string;
  url: string;
}
export class SelectFileData {
  contentType: string;
  rootHash: string;
}


@Component({
  selector: 'app-select-file',
  templateUrl: './select-file.component.html',
  styleUrls: ['./select-file.component.css']
})
export class SelectFileComponent implements OnInit {
  selected: FileData;

  constructor(public dialogRef: MatDialogRef<SelectFileComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SelectFileData) {
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  loadEntry(file: ProjectFile) {
    this.selected = {
      name: file.fileName,
      hash: file.hash,
      size: ' =600x*',
      url: environment.swarmProxy + '/bzz-raw:/' + file.hash,
    };
    // this.dialogRef.close(this.selected);
  }
}
