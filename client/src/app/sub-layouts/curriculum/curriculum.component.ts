import { Component, OnInit } from '@angular/core';

export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  children?: RouteInfo[];
}

export const ROUTES: RouteInfo[] = [
  { path: 'batches', title: 'Programs', icon: 'book', class: '', children: [] },
  // { path: 'programbatches', title: 'Program Batch', icon: 'book', class: '', children: [] },
  { path: 'add-term', title: 'Semester', icon: 'book', class: '', children: [] },
  { path: 'courses', title: 'Courses', icon: 'book', class: '', children: [] },
  { path: 'co-mapping', title: 'Mapped CO\'s with PO\'s and PEO\'s ', icon: 'map', class: '', children: [] },
];

@Component({
  selector: 'app-curriculum',
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.css']
})
export class CurriculumComponent implements OnInit {

  menuItems: RouteInfo[] | undefined;

  constructor() { }

  ngOnInit(): void {
    this.menuItems = ROUTES.map(e => e);
  }

}
