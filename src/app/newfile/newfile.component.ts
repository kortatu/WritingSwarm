import {Component, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTabChangeEvent} from '@angular/material';

export class NewfileData {
    name: string;
    type: string;
    blob: File;
}

@Component({
    selector: 'app-newfile',
    templateUrl: './newfile.component.html',
    styleUrls: ['./newfile.component.scss']
})
export class NewfileComponent implements OnInit {

    @Output()
    typeIcon: string;

    constructor(public dialogRef: MatDialogRef<NewfileComponent>,
                @Inject(MAT_DIALOG_DATA) public data: NewfileData) {
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSelectFileClick(): void {
        const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
        fileUpload.click();
    }

    uploadFile($event: Event) {
        const target: HTMLInputElement = $event.target as any;
        const files = target.files;
        if (files.length > 0) {
            const file: File = files[0];
            this.addfile(file);
        }
    }

    addfile(file: File) {
        if (file.type.startsWith('text')) {
            this.typeIcon = 'text_format';
            this.data.type = 'md';
        } else if (file.type.startsWith('image')) {
            this.typeIcon = 'image';
            this.data.type = 'image';
        } else {
            this.typeIcon = 'image';
            this.data.type = 'binary';
        }
        if (this.data.name === undefined || this.data.name === '' || this.data.name === null) {
            this.data.name = file.name;
        }
        this.data.blob = file;
    }

    changeTab($event: MatTabChangeEvent) {
        this.data.name = '';
        this.data.blob = null;
    }
}
