import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersComponent } from './filters/filters.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoDataComponent } from './no-data/no-data.component';


@NgModule({
  declarations: [
    FiltersComponent,
    NoDataComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FiltersComponent,
    NoDataComponent
  ]
})
export class ComponentsModule { }
