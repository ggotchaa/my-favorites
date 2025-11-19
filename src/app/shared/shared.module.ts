import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from './material/material.module';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule],
  declarations: [PaginationComponent],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule, PaginationComponent],
})
export class SharedModule {}
