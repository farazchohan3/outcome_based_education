import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.css']
})
export class NoDataComponent implements OnInit {

  @Input() showImageBool: boolean = true;
  @Input() message: string;

  constructor() { }

  ngOnInit(): void { }

}
