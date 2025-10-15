import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
    selector: 'app-snackbar-html',
    templateUrl: './snackbar-html.component.html',
    styleUrls: ['./snackbar-html.component.scss'],
    standalone: false
})
export class SnackbarHtmlComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBar: MatSnackBar) { }

}
