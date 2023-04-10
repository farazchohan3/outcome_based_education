import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { BLOOM_LEVELS, DELIVERY_METHODS } from 'src/app/models/constants';
import { Course } from 'src/app/models/course';
import { CourseOutcomes } from 'src/app/models/course-outcomes';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-course-outcome',
  templateUrl: './course-outcome.component.html',
  styleUrls: ['./course-outcome.component.css']
})
export class CourseOutcomeComponent implements OnInit, OnDestroy {

  courseId: string | undefined;
  courseModel: Course | undefined;
  courseSub: Subscription | undefined;

  bloomLevels: any;
  bloomLevelKeys: any;
  deliveryMethods: any;

  courseOutcomeForm: FormGroup | undefined;
  loader: boolean = false;
  updation: boolean = false;

  courseOutcomeList: CourseOutcomes[] = [];
  tempCourseOutcomeList: CourseOutcomes[] = [];
  selectedCOType: number = 0;
  coTypes: { name: string; value: number; }[] = [
    { name: "Theory", value: 0 },
    { name: "Laboratory", value: 1 }
  ];

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private toast: ToastrService,
    private change: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(res => this.courseId = res['courseId']);

    this.bloomLevels = BLOOM_LEVELS;
    this.bloomLevelKeys = Object.keys(BLOOM_LEVELS);
    this.deliveryMethods = DELIVERY_METHODS;

    this.data.getCourses();
    this.courseSub = this.data.coursessSub.subscribe(res => {
      if(res.length != 0) {
        console.log("behlole: ", res)
        console.log("behlole2: ", this.courseId)

        this.courseModel = res.find(x => x._id === this.courseId);
      }
    });

    this.httpClient.get<{ coursesCO: CourseOutcomes[] }>(`${environment.serverUrl}/course-outcomes/${this.courseId}`, {
      headers: this.data.httpHeaders
    })
      .toPromise()
      .then((value) => {
        this.courseOutcomeList = [ ...value.coursesCO ];
        // console.log("behlole3: ", this.courseOutcomeList)
        this.tempCourseOutcomeList = [ ...value.coursesCO ];
        this.filterListByCOType();
      }, (error) => {
        // console.log(">>> Error: ", error);
      })

  }

  filterListByCOType(coType: number = 0) {
    this.selectedCOType = coType;
    this.courseOutcomeList = this.tempCourseOutcomeList.filter(x => x.coType === coType);
  }

  initialisedForm(coObj: CourseOutcomes | undefined): void {
    if(coObj === undefined) this.updation = false; else this.updation = true;
    this.courseOutcomeForm = this.fb.group({
      _id: [coObj?._id],
      curriculumId: [this.courseModel?.curriculumId],
      curriculumName: [this.courseModel?.curriculumName],
      termId: [this.courseModel?.termId],
      termName: [this.courseModel?.termName],
      termNo: [this.courseModel?.termNo],
      courseTitle: [this.courseModel?.courseTitle],
      courseId: [this.courseModel?._id],
      coCode: [coObj?.coCode || null, Validators.required],
      coType: [ coObj?.coType || this.selectedCOType ],
      classHrs: [ coObj?.classHrs || this.selectedCOType || 0 ],
      labHrs: [ coObj?.labHrs || this.selectedCOType || 0 ],
      coCodeStatement: [coObj?.coCodeStatement || null, Validators.required],
      deliveryMethod: [coObj?.deliveryMethod || null, Validators.required],
      cognitiveDomain: this.fb.array(coObj?.cognitiveDomain?.map(e => this.fb.control(e)) || [], [Validators.required, Validators.minLength(1)])
    });
    // if(coObj === null) {
    // }
  }

  getControl() {
    return this.courseOutcomeForm?.get('cognitiveDomain') as FormArray;
  }

  onChange(value: any) {
    let arrayValue: string[] = [...this.getControl().value];
    if(arrayValue.includes(value)) {
      let idx = arrayValue.findIndex(x => x === value);
      this.getControl().removeAt(idx);
      this.change.detectChanges();
    } else {
      this.getControl().push(this.fb.control(value));
      this.change.detectChanges();
    }
  }

  getCheckedValue(value: string) {
    let arrayValue: string[] = [...this.getControl().value];
    return arrayValue.includes(value);
  }

  getFormattedBloomLevelInfo(level: string) {
    return this.bloomLevels[level].split(":")[0].trim().replace("-", " ");
  }

  openCourseOutcomeModal(modalRef: any, coObj?: CourseOutcomes) {
    this.initialisedForm(coObj);
    this.modalService.open(modalRef);
  }

  submitForm(form: FormGroup) {
    this.loader = true;
    let values: CourseOutcomes = { ...form.value };
    delete values._id;
    values.cognitiveDomain = values.cognitiveDomain?.sort();
    this.httpClient.post<{ response: CourseOutcomes, error: any }>(`${environment.serverUrl}/course-outcomes/add-co`, { ...values })
      .toPromise()
      .then((value) => {
        // console.log(":>>> Value: ", value);
        this.loader = false;
        this.modalService.dismissAll();
        this.toast.success("Course Outcome Added Successfully");
        this.courseOutcomeList.push(value.response);
      }, (err) => {
        // console.log(">>> err: ", err);
        this.loader = false;
        this.toast.error(err.error.message);
      });
  }

  submitUpdateCOForm(form: FormGroup) {
    this.loader = true;
    let values: CourseOutcomes = { ...form.value };
    values.cognitiveDomain = values.cognitiveDomain?.sort();
    this.httpClient.put<{ response: CourseOutcomes }>(`${environment.serverUrl}/course-outcomes/update-co/${form.value._id}`, { ...values })
      .toPromise()
      .then((value) => {
        // console.log(":>>> Value: ", value);
        this.loader = false;
        this.modalService.dismissAll();
        this.toast.success("Course Outcome Updated Successfully");
        let idx = this.courseOutcomeList.findIndex(x => x._id === form.value._id);
        this.courseOutcomeList[idx] = { ...value.response };
      }, (err) => {
        console.log(">>> err: ", err);
        this.loader = false;
        this.toast.error(err.error.message);
      });
  }

  deleteCO(modalRef: any, id: any) {
    this.modalService.open(modalRef).result.then((value) => {
      this.httpClient.delete(`${environment.serverUrl}/course-outcomes/delete-co/${id}`)
        .toPromise()
        .then((value) => {
          this.toast.success("Course Outcome Deleted");
          let idx = this.courseOutcomeList.findIndex(x => x._id === id);
          this.courseOutcomeList.splice(idx, 1);
        }, (err) => {
          // console.log(">>> error", err);
        });

    }, (err) => {
      console.log(">>> error: ", err);

    })
  }

  ngOnDestroy() {
    this.courseSub?.unsubscribe();
  }

}
