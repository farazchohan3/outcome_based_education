import { Component, OnInit } from '@angular/core';
import { ROLES } from 'src/app/models/constants';

export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  children?: RouteInfo[];
}

export const ROUTES: RouteInfo[] = [
  { path: '/faculty', title: 'Faculty', icon: 'group', class: '', children: [] },
  { path: '/curriculum/courses', title: 'Courses', icon: 'library_books', class: '', children: [] },
  { path: '/curriculum/co-mapping', title: 'Mapped CO with PO/PEO', icon: 'library_books', class: '', children: [] },
  { path: '/assessments', title: 'Assessment', icon: 'assessment', class: '', children: [] },
  { path: '/attainment/import-cia-marks', title: 'Data Import', icon: 'track_changes', class: '', children: [] },
  { path: '/attainment/co-attainment', title: 'CO Attainement', icon: 'track_changes', class: '', children: [] },
  { path: '/profile', title: 'My Profile', icon: 'people', class: '', children: [] },
  { path: '/change-passsword', title: 'Change Login Password', icon: 'key', class: '', children: [] },
];
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  menuItems: RouteInfo[] = [];
  constructor() { }

  ngOnInit(): void {
    this.menuItems = ROUTES.map(e => e);
  }

}
