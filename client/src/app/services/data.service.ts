import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Course } from '../models/course';
import { Curriculum } from '../models/curriculum';
import { Term } from '../models/term';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  userModel: User;
  httpHeaders: HttpHeaders = new HttpHeaders({
    'Cache-Control': 'no-cache'
  });

  curriculumsSub = new BehaviorSubject<Curriculum[]>([]);

  // TermsSub = new BehaviorSubject<Term[]>([]);
  curriculumRetrieved: boolean = false;
  // TermRetrieved: boolean = false;
  coursessSub = new BehaviorSubject<Course[]>([]);
  coursesRetrieved: boolean = false;

  termsSub = new BehaviorSubject<Term[]>([]);
  termsRetrieved: boolean = false;

  constructor(
    private httpClient: HttpClient
  ) {
    this.userModel = JSON.parse(localStorage.getItem('user') || "");
  }

  getCurriculums(): void {
    if(!this.curriculumRetrieved) {
      this.httpClient.get<{ curriculums: any[] }>(`${environment.serverUrl}/curriculums`, {
        headers: this.httpHeaders
      })
        .toPromise()
        .then(res => {
          this.curriculumsSub.next(res?.curriculums.filter(e => e.deptName === this.userModel?.department).map(e => e as Curriculum));
          this.curriculumRetrieved = true;
        }, err => {
          console.log(">>> error: ", err);

        });
    }
  }

  //
  getTerms(): void {
    if(!this.termsRetrieved) {
      this.httpClient.get<{ terms: Term[] }>(`${environment.serverUrl}/terms`, {
        headers: this.httpHeaders
      })
        .toPromise()
        .then((res) => {
          this.termsSub.next(res?.terms.filter(e => e.deptName === this.userModel?.department));
          this.termsRetrieved = true;
        }, err => {
          console.log(">>> error: ", err);

        });
    }
  }

  getCourses(): void {
    if(!this.coursesRetrieved) {
      this.httpClient.get<{ courses: Course[] }>(`${environment.serverUrl}/courses`, {
        headers: this.httpHeaders
      })
        .toPromise()
        .then((res) => {
          this.coursessSub.next(res?.courses.filter(x => x.courseOwnerId === this.userModel._id));
          this.coursesRetrieved = true;
        }, (err) => {
          console.log(">>> error: ", err);

        })
    }
  }
}

/**
 * batchId, termId => courses fetch OBE Server Route
 */
