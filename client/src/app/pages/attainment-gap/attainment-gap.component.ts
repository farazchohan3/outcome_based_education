import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PO_CODE, PSO_CODE } from 'src/app/models/constants';
import { Course } from 'src/app/models/course';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-attainment-gap',
  templateUrl: './attainment-gap.component.html',
  styleUrls: ['./attainment-gap.component.css'],
})
export class AttainmentGapComponent implements OnInit {
  selectedCourse: any;
  gapForm: FormGroup;

  // poCode: string[] = [...PO_CODE];
  codes: string[] = [...PO_CODE, ...PSO_CODE];
  showTable: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private dataService: DataService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void { }

  async getSelectedCourse(courseObj: Course) {
    this.selectedCourse = { ...courseObj };
    if(this.selectedCourse.gapId === null) {
      this.initializedForm();
    } else {
      let response = await this.httpClient
        .get<{ attainmentGaps: any }>(`${environment.serverUrl}/attainmentgaps/${this.selectedCourse.gapId}`, {
          headers: this.dataService.httpHeaders,
        }).toPromise();

      this.initializedForm({ ...response.attainmentGaps })
    }
  }

  initializedForm(attainmentGapObj: any | null = null) {  
    this.showTable = true;
    this.gapForm = this.fb.group({
      _id: [this.selectedCourse.gapId || ""],
      curriculumId: [this.selectedCourse.curriculumId],
      curriculumName: [this.selectedCourse.curriculumName],
      termId: [this.selectedCourse.termId],
      termName: [this.selectedCourse.termName],
      termNo: [this.selectedCourse.termNo],
      courseTitle: [this.selectedCourse.courseTitle],
      courseCode: [this.selectedCourse.courseCode],
      courseId: [this.selectedCourse._id],
      gaps: this.fb.array(
        attainmentGapObj !== null ? 
        Array.from(attainmentGapObj['gaps'] || []).map((e: any, idx: number) => this.getGapForm(e?.id, e)) :
        this.codes.map((code, idx) => this.getGapForm(code))
      )
    });
  }

  getGapForm(code: string, gapObj: any = {}) {
    return this.fb.group({
      id: [code],
      targetLevel: [gapObj.targetLevel || null],
      attainmentLevel: [gapObj.attainmentLevel || null],
      observation: [gapObj.observation || null],
    });
  }

  saveAttainmentGap() {
    let values = { ...this.gapForm.value };
    this.httpClient
      .post(
        `${environment.serverUrl}/attainmentgaps/add`,
        { ...values },
        { headers: this.dataService.httpHeaders }
      )
      .toPromise()
      .then(
        (value) => {
          console.log(value);
          this.toast.success('Attainment Gap Save Successfully', 'Success');
        },
        (error) => {
          console.log(error);
          this.toast.warning(
            'Something Went Wrong!! Please Try Again',
            'Error'
          );
        }
      );
  }
}
