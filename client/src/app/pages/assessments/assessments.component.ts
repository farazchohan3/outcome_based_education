import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Assessments, Questions } from 'src/app/models/assessments';
import { ASSESSMENT_TYPE, BLOOM_LEVELS } from 'src/app/models/constants';
import { Course } from 'src/app/models/course';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.css']
})
export class AssessmentsComponent implements OnInit {

  selectedCourse: Course | null = null;

  fetching: boolean = false;
  updation: boolean = false;
  loader: boolean = false;
  listSub: Subscription | undefined;

  directAssessments: Assessments[] = [];
  indirectAassessments: Assessments[] = [];

  assessmentModel: Assessments | null = null;
  assessmentForm: FormGroup | undefined;
  assessmentTypes: any[] = [];

  bloomLevelKeys: string[] = [];
  eseBool: boolean = false;
  surveyBool: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private httpClient: HttpClient,
    private modalService: NgbModal,
    private toast: ToastrService
  ) { }

  async ngOnInit() {
    this.assessmentTypes = ASSESSMENT_TYPE;
    this.bloomLevelKeys = Object.keys(BLOOM_LEVELS);
  }

  courseSelection(value: Course) {
    this.selectedCourse = value;
    this.httpClient.get<{ assessments: Assessments[] }>(`${environment.serverUrl}/assessments/${value._id}`, {
      headers: this.dataService.httpHeaders
    })
      .toPromise()
      .then((value) => {
        this.directAssessments = value.assessments.filter(x => x.assessmentType !== 'survey');
        this.indirectAassessments = value.assessments.filter(x => x.assessmentType === 'survey');
        this.eseBool = this.directAssessments.some(x => x.assessmentType === 'ESE') ? true : false;
      }, (err) => {
        console.log(">>> error: ", err);
      })
  }

  initialisedForm(assessmentObj?: Assessments | undefined, surveyBool: boolean = false): void {
    this.surveyBool = surveyBool;
    if (assessmentObj === undefined) this.updation = false; else this.updation = true;
    this.assessmentForm = this.fb.group({
      _id: [assessmentObj?._id],
      curriculumId: [this.selectedCourse?.curriculumId],
      curriculumName: [this.selectedCourse?.curriculumName],
      termId: [this.selectedCourse?.termId],
      termName: [this.selectedCourse?.termName],
      termNo: [this.selectedCourse?.termNo],
      courseTitle: [this.selectedCourse?.courseTitle],
      courseId: [this.selectedCourse?._id],
      courseCode: [this.selectedCourse?.courseCode],
      assessmentType: [ surveyBool ? 'survey' : assessmentObj?.assessmentType || null],
      assessmentName: [assessmentObj?.assessmentName || null],
      totalMarks: [assessmentObj?.totalMarks || null],
      questions: this.fb.array(assessmentObj?.questions?.map(e => this.initialQuestionForm(e)) || [], [Validators.required, Validators.minLength(1)]),
    });
  }

  initialQuestionForm(questionObj?: Questions | undefined) {
    return this.fb.group({
      coCode: [questionObj?.coCode || null, Validators.required],
      bloomLevel: [questionObj?.bloomLevel || this.bloomLevelKeys[0], !this.surveyBool && Validators.required],
      questionNo: [questionObj?.questionNo || this.getQuestionsControl().length + 1, Validators.required],
      questionStatement: [questionObj?.questionStatement || null, Validators.required],
      maximumMarks: [questionObj?.maximumMarks || 0, !this.surveyBool &&  Validators.required]
    });
  }

  openAssessmentModal(modalRef: any, surveyBool: boolean = false, assessmentObj?: Assessments | undefined) {
    if(this.selectedCourse === null) {
      this.toast.warning("Please Select Course First...")
    } else {
      this.initialisedForm(assessmentObj, surveyBool);
      this.modalService.open(modalRef, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static'
      });
    }
  }

  getQuestionsControl() {
    return this.assessmentForm?.get('questions') as FormArray;
  }

  addQuestionToQuestionsArray() {
    this.getQuestionsControl().push(this.initialQuestionForm());
  }

  removeQuestionFromQuestionArray(idx: number) {
    this.getQuestionsControl().removeAt(idx);
    this.getQuestionsControl().controls.forEach((control, index) => {
      if(index >= idx) {
        control.patchValue({
          questionNo: control.value.questionNo - 1
        })
      }
    })
  }

  submitAssessmentForm(form: FormGroup) {
    this.loader = true;
    let values: Assessments = { ...form.value };
    values.totalMarks = values.questions?.reduce((prev, next) => prev + next?.maximumMarks || 0, 0);

    if(!this.updation) {
      this.httpClient.post<{ response: Assessments }>(
        `${environment.serverUrl}/assessments/add-assessment`,
        { ...values }, {
        headers: this.dataService.httpHeaders
      })
      .toPromise()
      .then((value) => {
        this.loader = false;
        this.modalService.dismissAll();
        this.directAssessments?.push({ ...value.response });
        this.toast.success("Assessment Added Successfully");
      }, (error) => {
        console.error(">>> error: ", error);
        this.loader = false;
        this.toast.error("Something went wrong!! Please Try Again...")
      });
    } else {
      this.httpClient.put<{ response: Assessments }>(
        `${environment.serverUrl}/assessments/update-assessment/${values._id}`,
        { ...values }, {
        headers: this.dataService.httpHeaders
      })
      .toPromise()
      .then((value) => {
        this.loader = false;
        this.modalService.dismissAll();
        let idx = this.directAssessments?.findIndex(x => x._id === value.response._id);
        this.directAssessments[idx] = { ...value.response };
        this.toast.success("Assessment Updated Successfully");
      }, (error) => {
        console.error(">>> error: ", error);
        this.loader = false;
        this.toast.error("Something went wrong!! Please Try Again...")
      });
    }
  }

  deleteAssessment(modalRef: any, id: any) {
    this.modalService.open(modalRef).result.then((value) => {
      this.httpClient.delete(`${environment.serverUrl}/assessments/delete-assessment/${id}`)
      .toPromise()
      .then((value) => {
        this.toast.success("Course Outcome Deleted");
        let idx = this.directAssessments.findIndex(x => x._id === id);
        this.directAssessments.splice(idx, 1);
      }, (err) => {
        // console.log(">>> error", err);
      });

    }, (err) => {
      console.log(">>> error: ", err);

    })
  }

  openViewModal(modalRef: any, assessment: Assessments, surveyBool: boolean = false) {
    this.assessmentModel = assessment;
    this.surveyBool = surveyBool;
    this.modalService.open(modalRef, {
      size: surveyBool ? 'lg' : 'xl'
    })
  }
}

