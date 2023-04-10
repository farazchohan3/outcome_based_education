import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Course} from "../../models/course";
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {Curriculum} from "../../models/curriculum";
import {DataService} from "../../services/data.service";
import {Subscription} from "rxjs";
// import {ActivatedRoute} from "@angular/router";
import {ProgramOutcomes} from "../../models/program-outcomes";
import {CourseOutcomes} from "../../models/course-outcomes";
// import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
// import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
// import {HttpClient} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {BLOOM_LEVELS, DELIVERY_METHODS} from "../../models/constants";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-batch-outcome',
  templateUrl: './batch-outcome.component.html',
  styleUrls: ['./batch-outcome.component.css']
})
export class BatchOutcomeComponent implements OnInit, OnDestroy {

  curriculumId: string | undefined;

  // batchId: string | undefined;
  curriculumModel: Curriculum | undefined;
  curriculumSub: Subscription | undefined;

  batchSub: Subscription | undefined;

  programOutcomeList: ProgramOutcomes[] = [];

  // bloomLevels: any;
  //bloomLevelKeys: any;
  //deliveryMethods: any;

  programOutcomeForm: FormGroup;
  loader: boolean = false;
  updation: boolean = false;

  // batchOutcomeList: ProgramOutcomes[] = [];

  tempProgramOutcomeList: ProgramOutcomes[] = [];
  // selectedPOType: number = 0;
  // poTypes: { name: string; value: number; }[] = [
  //   { name: "Theory", value: 0 },
  //   { name: "Laboratory", value: 1 }
  // ];
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

    this.route.params.subscribe(res => this.curriculumId = res['batchId'])
    this.data.getCurriculums();
    this.curriculumSub = this.data.curriculumsSub.subscribe(res => {
      if(res.length != 0) {
        console.log("behlole: ", res)
        console.log("behlole2: ", this.curriculumId)

        this.curriculumModel = res.find(x => x._id === this.curriculumId);
        console.log("behlole3:", this.curriculumModel?._id)
      }
    });
    this.httpClient.get<{ curriculumPO: ProgramOutcomes[] }>(`${environment.serverUrl}/program-outcomes/${this.curriculumId}`, {
      headers: this.data.httpHeaders
    })
      .toPromise()
      .then((value) => {
        this.programOutcomeList = [ ...value.curriculumPO ];
        console.log("behlole3: ", this.programOutcomeList)
        this.tempProgramOutcomeList = [ ...value.curriculumPO ];
        // this.filterListByCOType();
      }, (error) => {
        console.log(">>> Error: ", error);
      })

      // this.data.getCurriculums();
      // this.curriculumSub = this.data.curriculumsSub.subscribe(res => {
      //   if(res.length != 0) {
      //     this.batchModel = res.find(x => x._id === this.batchId);
      //     // debugger
      //     console.log("Behlole",this.batchModel)
      //   }
      // });
  }

  // filterListByCOType(coType: number = 0) {
  //   this.selectedCOType = coType;
  //   this.courseOutcomeList = this.tempCourseOutcomeList.filter(x => x.coType === coType);
  // }

  initialisedForm(poObj: ProgramOutcomes | undefined): void {
    if(poObj === undefined) this.updation = false; else this.updation = true;
    this.programOutcomeForm = this.fb.group({
      _id: [poObj?._id],
      curriculumId: [this.curriculumModel?._id],

      curriculumName: [this.curriculumModel?.curriculumName],
      // termId: [this.batchModel?.termId],
      // termName: [this.courseModel?.termName],
      // termNo: [this.courseModel?.termNo],
      // courseTitle: [this.courseModel?.courseTitle],
      // courseId: [this.courseModel?._id],
      poCode: [poObj?.poCode || null, Validators.required],
      // coType: [ coObj?.coType || this.selectedCOType ],
      // classHrs: [ coObj?.classHrs || this.selectedCOType || 0 ],
      // labHrs: [ coObj?.labHrs || this.selectedCOType || 0 ],
      poCodeStatement: [poObj?.poCodeStatement || null, Validators.required],
      // deliveryMethod: [coObj?.deliveryMethod || null, Validators.required],
      cognitiveDomain: this.fb.array(poObj?.cognitiveDomain?.map(e => this.fb.control(e)) || [], [Validators.required, Validators.minLength(1)])
    });
    // if(coObj === null) {
    // }
  }

  getControl() {
    return this.programOutcomeForm?.get('cognitiveDomain') as FormArray;
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

  // getFormattedBloomLevelInfo(level: string) {
  //   return this.bloomLevels[level].split(":")[0].trim().replace("-", " ");
  // }

  openCurriculumOutcomeModal(modalRef: any, poObj?: ProgramOutcomes) {
    this.initialisedForm(poObj);
    console.log("behlole4:", poObj)
    this.modalService.open(modalRef);
  }

  submitForm(form: FormGroup) {
    this.loader = true;
    let values: ProgramOutcomes = { ...form.value };
    delete values._id;
    values.cognitiveDomain = values.cognitiveDomain?.sort();
    this.httpClient.post<{ response: ProgramOutcomes, error: any }>(`${environment.serverUrl}/program-outcomes/add-po`, { ...values })
      .toPromise()
      .then((value) => {
        // console.log(":>>> Value: ", value);
        this.loader = false;
        this.modalService.dismissAll();
        this.toast.success("Batch Outcome Added Successfully");
        this.programOutcomeList.push(value.response);
      }, (err) => {
        // console.log(">>> err: ", err);
        this.loader = false;
        this.toast.error(err.error.message);
      });
  }

  submitUpdatePOForm(form: FormGroup) {
    this.loader = true;
    let values: ProgramOutcomes = { ...form.value };
    values.cognitiveDomain = values.cognitiveDomain?.sort();
    this.httpClient.put<{ response: ProgramOutcomes }>(`${environment.serverUrl}/program-outcomes/update-po/${form.value._id}`, { ...values })
      .toPromise()
      .then((value) => {
        // console.log(":>>> Value: ", value);
        this.loader = false;
        this.modalService.dismissAll();
        this.toast.success("Batch Outcome Updated Successfully");
        let idx = this.programOutcomeList.findIndex(x => x._id === form.value._id);
        this.programOutcomeList[idx] = { ...value.response };
      }, (err) => {
        console.log(">>> err: ", err);
        this.loader = false;
        this.toast.error(err.error.message);
      });
  }

  deleteBO(modalRef: any, id: any) {
    this.modalService.open(modalRef).result.then((value) => {
      this.httpClient.delete(`${environment.serverUrl}/program-outcomes/delete-po/${id}`)
        .toPromise()
        .then((value) => {
          this.toast.success("Batch Outcome Deleted");
          let idx = this.programOutcomeList.findIndex(x => x._id === id);
          this.programOutcomeList.splice(idx, 1);
        }, (err) => {
          // console.log(">>> error", err);
        });

    }, (err) => {
      console.log(">>> error: ", err);

    })
  }

  ngOnDestroy() {
    this.curriculumSub?.unsubscribe();
  }

}
