import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DialogData {
    value: string;
}

@Component({
    selector: 'app-common-single-value-dialog',
    templateUrl: './single-value-dialog.component.html',
    styleUrls: ['./single-value-dialog.component.css']
})
export class SingleValueDialogComponent {

    constructor(public dialogRef: MatDialogRef<SingleValueDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    }


    onNoClick(): void {

        console.log('Dialog onNoClick');

        this.dialogRef.close();
    }

}