import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-dialog',
  templateUrl: './popup-dialog.component.html',
  styleUrls: ['./popup-dialog.component.css'],
})
export class PopupDialogComponent {
  calculatedAmount: string; // Change the type to string

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { percentage: number; productValues: number[] },
    public dialogRef: MatDialogRef<PopupDialogComponent>
  ) {
    // Calculate the dollar amount based on the percentage and product values
    const amountInM = (data.percentage / 100) * data.productValues[0];
    this.calculatedAmount = amountInM.toFixed(2) + ' M$'; // Format as "X.XX M$"
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
