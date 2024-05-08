import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-popup',
  templateUrl: './feedback-popup.component.html',
  styleUrls: ['./feedback-popup.component.css']
})
export class FeedbackPopupComponent {
  comment: string = '';

  constructor(
    public dialogRef: MatDialogRef<FeedbackPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  submitFeedback(): void {
    if (this.comment.trim() !== '') {
      this.dialogRef.close(this.comment.trim()); // Pass only the comment value after trimming whitespace
    } else {
      // Optionally handle empty comment
    }
  }
  
}
