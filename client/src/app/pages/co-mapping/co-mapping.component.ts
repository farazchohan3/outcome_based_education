import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PO_CODE, PSO_CODE } from 'src/app/models/constants';
import { Course } from 'src/app/models/course';
import { CourseOutcomes } from 'src/app/models/course-outcomes';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import {ProgramOutcomes} from "../../models/program-outcomes";

@Component({
  selector: 'app-co-mapping',
  templateUrl: './co-mapping.component.html',
  styleUrls: ['./co-mapping.component.css']
})
export class CoMappingComponent implements OnInit {

  courses: Course[] = [];
  curriculumId: string | undefined;

  programOutcomeList: ProgramOutcomes[] = [];
  tempProgramOutcomeList: ProgramOutcomes[] = [];

  coMappingForm: FormGroup;

  selectedCourse: Course;
  selectedCourseCOS: CourseOutcomes[] = [];
  selectedCourseCOCodes: string[] = [];

  poCodes: string[] = [];
  dummyPOCodes: ProgramOutcomes[] = [];
  psoCodes: string[] = [];

  selectedPO: any;
  enableSelects: boolean = false;

  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private dataService: DataService,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.poCodes = [...PO_CODE];
    this.psoCodes = [...PSO_CODE];

  }

  getCourses(course: Course) {
    this.selectedCourse = course;
    this.httpClient.get<{ coursesCO: CourseOutcomes[] }>(
      `${environment.serverUrl}/course-outcomes/${this.selectedCourse._id}/theory-cos`,
      { headers: this.dataService.httpHeaders }
    ).toPromise()
      .then((res) => {
        this.selectedCourseCOS = res.coursesCO.map(e => e);
        this.selectedCourseCOCodes = res.coursesCO.map(e => e.coCode?.toUpperCase() || "");
        this.initialiseFormGroup(this.selectedCourse.poMapId || "");
        this.getPOMap();
      }, (error) => { });

    let randomId = this.selectedCourse.curriculumId;
    //   ?
    console.log("curriculumId: : ", randomId)
    this.httpClient.get<{ curriculumPO: ProgramOutcomes[] }>(`${environment.serverUrl}/program-outcomes/${randomId}`, {
      headers: this.data.httpHeaders
    }).toPromise().then((value) => {
      this.programOutcomeList = [ ...value.curriculumPO ];
      this.tempProgramOutcomeList = [ ...value.curriculumPO ];
      console.log("poCodes1: : ", this.programOutcomeList)
      this.dummyPOCodes = this.programOutcomeList;
      console.log("poCodes2: : ", [...this.dummyPOCodes])
    }, (error) => {

      // this.filterListByCOType();
      console.log(">>> Error: ", error);
    })




  }

  getPOMap() {
    this.httpClient.get<{ poMap: any }>(
      `${environment.serverUrl}/co_po_mapping/${this.selectedCourse._id}/get-po-map/${this.selectedCourse.poMapId}`,
      { headers: this.dataService.httpHeaders }
    ).toPromise()
      .then((res) => {
        this.selectedPO = res.poMap;
        this.reInitialiseForm();
      }, (error) => { });
  }

  reInitialiseForm() {
    this.selectedCourseCOCodes.forEach((code, idx) => {
      Object.entries(this.selectedPO[code]).forEach(([po, stength]) => {
        let selectRef = <HTMLSelectElement>document.getElementById(code+po+'Strength');
        selectRef.value = String(stength);
        this.addPOFormGroup(code, po, Number(stength));
      });
    });
  }

  initialiseFormGroup(id: string){
    this.coMappingForm = this.fb.group({
      _id: [id],
      curriculumId: [this.selectedCourse.curriculumId],
      curriculumName: [this.selectedCourse.curriculumName],
      termId: [this.selectedCourse.termId],
      termName: [this.selectedCourse.termName],
      termNo: [this.selectedCourse.termNo],
      courseTitle: [this.selectedCourse.courseTitle],
      courseCode: [this.selectedCourse.courseCode],
      courseId: [this.selectedCourse._id],
    });

    this.selectedCourseCOCodes.forEach((code, index) => {
      this.coMappingForm.addControl(code, this.fb.group({}))
    });
    // here add the patch endpoint
    let dummyCourse = [this.selectedCourse];
    let dummyCourse2 = dummyCourse[0];
    console.log("courses1: : ", dummyCourse2)
    dummyCourse2.poMapId = [id];
    console.log("courses2: : ", dummyCourse2)

    this.httpClient.put<{ response: Course }>(`${environment.serverUrl}/courses/update-course/${dummyCourse2._id}`, { ...dummyCourse2 })
      .toPromise()
      .then((value) => {
        // console.log(":>>> Value: ", value);
        // this.loader = false;
        // this.modalService.dismissAll();
        this.toast.success("Course Updated Successfully")

        let idx = this.courses.findIndex(x => x._id === dummyCourse2._id);
        this.courses[idx] = {...value.response};
      }, (err) => {
        console.log(">>> err: ", err);
        // this.loader = false;
        // this.toast.error(err.error.message);
      });


  }

  addPOFormGroup(coCode: string, poCode: string, strength: number) {
    let coFormGroup: FormGroup = this.coMappingForm.get(coCode) as FormGroup;
    if(coFormGroup.contains(poCode)) {
      if(Number(strength) !== 0) {
        coFormGroup.setControl(poCode, this.fb.control(Number(strength)));
      } else {
        coFormGroup.removeControl(poCode);
      }
    } else {
      coFormGroup.addControl(poCode, this.fb.control(Number(strength)))
    }
  }

  saveCOPOMapping() {
    let values = { ...this.coMappingForm.value };
    this.httpClient.post(
      `${environment.serverUrl}/co_po_mapping/add`,
      { ...values },
      { headers: this.dataService.httpHeaders }
    ).toPromise()
      .then((value) => {
        console.log(value);
        this.toast.success("Co PO Mapping Save Successfully", "Success");
      }, (error) => {
        console.log(error);
        this.toast.warning("Something Went Wrong!! Please Try Again", "Error");
      })
  }


}
