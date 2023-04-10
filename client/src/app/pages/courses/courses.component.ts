import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { COURSE_TYPE, DEPARTMENTS } from 'src/app/models/constants';
import { Course } from 'src/app/models/course';
import { Curriculum } from 'src/app/models/curriculum';
import { Term } from 'src/app/models/term';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  courseForm: FormGroup | undefined;
  loader: boolean = false;
  updation: boolean = false;

  curriculums: Curriculum[] = [];
  curriculumSub: Subscription | undefined;
  courses: Course[] = [];
  coursesSub: Subscription | undefined;

  terms: Term[] = [];

  courseType: any;
  departments: any;

  userModel: User = JSON.parse(localStorage.getItem("user") || "");

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private data: DataService,
    private httpClient: HttpClient,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.courseType = COURSE_TYPE;
    this.departments = DEPARTMENTS;
    this.getCourses();
  }

  getCourses() {
    this.data.getCourses();
    this.coursesSub = this.data.coursessSub.subscribe(res => {
      if(res.length != 0) {
        this.courses = res;
      }
    })
  }

  initialiseForm(courseObj: Course | any = null){
    if(courseObj === null) {
      this.updation = false;
      this.courseForm = this.fb.group({
        curriculum: [null],
        term: [null],
        courseDomain: [null],
        typeOfCourse: [null], //Theory, Theory with Lab, Lab/Project Works/Others
        courseCode: [null],
        courseTitle: [null],
        courseAcronym: [null],
        theoryCredits: [null],
        tutorialCredits: [null],
        practicalCredits: [null],
        totalCredits: [null],
        totalCiaWeightage: [null],
        totalTeeWeightage: [null],
        totalWeightage: [null],
        ciaPassingMarks: [null],
        prerequisiteCourses: [null],
        courseOwner: [this.userModel.firstName + " " + this.userModel.lastName],
        courseOwnerId: [this.userModel._id],
        reviewerDepartment: [this.userModel.department],
        courseReviewer: [null],
        lastDateToReview: [null],
        totalCourseConatactHours: [null],
        totalCiaMarks: [null],
        totalMidTermMarks: [null],
        totalTeeMarks: [null],
        totalAttendanceMarks: [null],
        totalMarks: [null],
        teeDuration: [null],
        blommsDomain: [null],
        state: [true],
        poMapId:[null]
      });
    } else {
      this.updation = true;
      let currObj = this.curriculums.find(x => x._id === courseObj.curriculumId);
      this.terms = currObj?.terms || [];
      let termObj = this.terms.find(x => x._id === courseObj.termId);

      this.courseForm = this.fb.group({
        _id: [courseObj._id],
        curriculum: [currObj],
        term: [termObj],
        courseDomain: [courseObj.courseDomain],
        typeOfCourse: [courseObj.typeOfCourse], //Theory, Theory with Lab, Lab/Project Works/Others
        courseCode: [courseObj.courseCode],
        courseTitle: [courseObj.courseTitle],
        courseAcronym: [courseObj.courseAcronym],
        theoryCredits: [courseObj.theoryCredits],
        tutorialCredits: [courseObj.tutorialCredits],
        practicalCredits: [courseObj.practicalCredits],
        totalCredits: [courseObj.totalCredits],
        totalCiaWeightage: [courseObj.totalCiaWeightage],
        totalTeeWeightage: [courseObj.totalTeeWeightage],
        totalWeightage: [courseObj.totalWeightage],
        ciaPassingMarks: [courseObj.ciaPassingMarks],
        prerequisiteCourses: [courseObj.prerequisiteCourses],
        courseOwner: [this.userModel.firstName + " " + this.userModel.lastName],
        courseOwnerId: [this.userModel._id],
        reviewerDepartment: [this.userModel.department],
        courseReviewer: [courseObj.courseReviewer],
        lastDateToReview: [new DatePipe('en-US').transform(courseObj.lastDateToReview, 'yyyy-MM-dd')],
        totalCourseConatactHours: [courseObj.totalCourseConatactHours],
        totalCiaMarks: [courseObj.totalCiaMarks],
        totalMidTermMarks: [courseObj.totalMidTermMarks],
        totalTeeMarks: [courseObj.totalTeeMarks],
        totalAttendanceMarks: [courseObj.totalAttendanceMarks],
        totalMarks: [courseObj.totalMarks],
        teeDuration: [courseObj.teeDuration],
        blommsDomain: [courseObj.blommsDomain],
        state: [courseObj.state],
        poMapId:[courseObj.poMapId]
      });

    }
  }

  openCourseModal(modalRef: any, course: Course | any = null) {
    this.data.getCurriculums();
    this.data.curriculumsSub.subscribe(list => {
      if(list.length != 0) {
        this.curriculums = list;
        this.initialiseForm(course);
        this.modalService.open(modalRef, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
      }
    })
  }

  submitForm(form: FormGroup) {
    this.loader = true;
    let values = { ...form.value };
    let courseObj: Course | any = { ...form.value };

    delete courseObj['curriculum'];
    delete courseObj['term'];
    courseObj.curriculumId = values.curriculum['_id'];
    courseObj.curriculumName = values.curriculum['curriculumName'];
    courseObj.termId = values.term['_id'];
    courseObj.termName = values.term['termName'];
    courseObj.termNo = values.term['termNo'];

    if(!this.updation) {
      this.httpClient.post<{ response: Course, error: any }>(`${environment.serverUrl}/courses/add-course`, { ...courseObj })
        .toPromise()
        .then((value) => {
          // console.log(":>>> Value: ", value);
          this.loader = false;
          this.modalService.dismissAll();
          this.toast.success("Course Added Successfully")

          this.courses.push({ ...value.response });
        }, (err) => {
          // console.log(">>> err: ", err);
          this.loader = false;
          this.toast.error(err.error.message);
        });
    } else {
      this.httpClient.put<{ response: Course }>(`${environment.serverUrl}/courses/update-course/${courseObj._id}`, { ...courseObj })
        .toPromise()
        .then((value) => {
          // console.log(":>>> Value: ", value);
          this.loader = false;
          this.modalService.dismissAll();
          this.toast.success("Course Updated Successfully")

          let idx = this.courses.findIndex(x => x._id === courseObj._id);
          this.courses[idx] = { ...value.response };
        }, (err) => {
          // console.log(">>> err: ", err);
          this.loader = false;
          this.toast.error(err.error.message);
        });
    }
  }

  deleteCourse(modalRef: any, id: any) {
    this.modalService.open(modalRef).result.then((value) => {
      this.httpClient.delete(`${environment.serverUrl}/courses/delete-course/${id}`)
        .toPromise()
        .then((value) => {
          this.toast.success("Course Deleted Successfully");
          let idx = this.courses.findIndex(x => x._id === id);
          this.courses.splice(idx, 1);
        }, (err) => {
          // console.log(">>> error", err);
        });

    }, (err) => {
      console.log(">>> error: ", err);

    })
  }

  curriculumTerms() {
    this.terms = this.courseForm?.get('curriculum')?.value?.terms || [];
  }

  compareCurriculumsById(c1: Curriculum, c2: Curriculum) {
    return c1 && c2 && c1._id === c2._id;
  }

  navigateCourseOutcome(courseId: any) {
    this.router.navigate([courseId, 'course-outcomes'], { relativeTo: this.route });
  }
}
