import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export class NewfileData {
  name: string;
  type: string;
}
@Component({
  selector: 'app-newfile',
  templateUrl: './newfile.component.html',
  styleUrls: ['./newfile.component.css']
})
export class NewfileComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NewfileComponent>,
              @Inject(MAT_DIALOG_DATA) public data: NewfileData) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
