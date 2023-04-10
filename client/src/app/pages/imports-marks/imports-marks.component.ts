import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Assessments } from 'src/app/models/assessments';
import { Course } from 'src/app/models/course';
import { Curriculum } from 'src/app/models/curriculum';
import { Term } from 'src/app/models/term';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { StudentAttainments } from 'src/app/models/student-attainments';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-imports-marks',
  templateUrl: './imports-marks.component.html',
  styleUrls: ['./imports-marks.component.css']
})
export class ImportsMarksComponent implements OnInit {

  selectedCourse: Course | null = null;
  listSub: Subscription | undefined;

  fetching: boolean = false;
  updation: boolean = false;
  loader: boolean = false;
  ciaBool: boolean = false;

  assessments: Assessments[] = [];
  selectedAssessment: Assessments | undefined;
  studentAttainments: StudentAttainments[] = [];

  constructor(
    private dataService: DataService,
    private httpClient: HttpClient,
    private toast: ToastrService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ciaBool = this.router.url.replace("/", "").split("/").some(x => x.includes('cia'));
  }

  courseSelection(value: Course) {
    this.selectedCourse = value;
    this.httpClient.get<{ assessments: Assessments[] }>(`${environment.serverUrl}/assessments/${value._id}/${this.ciaBool ? 'cia-marks' : 'ese-marks'}`, {
      headers: this.dataService.httpHeaders
    })
      .toPromise()
      .then((value) => {
        // console.log(">>> Value: ", value.assessments);
        this.assessments = [...value.assessments];
      }, (err) => {
        console.log(">>> error: ", err);
      })
  }

  downloadExcel(assessment: Assessments | undefined) {
    let array: any[] = ["Student Name", "URN", "CRN"];
    assessment?.questions?.forEach((e) => array.push(`Q${e.questionNo} [${e.maximumMarks}] [${e.coCode}]`));
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([array]);
    const workbook: XLSX.WorkBook = { Sheets: { 'qrcodes': worksheet }, SheetNames: ['qrcodes'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, `${assessment?.courseTitle?.trim().replace(/ /g, "_").toLowerCase()}_${assessment?.assessmentName?.split(" ").join("")}_${new DatePipe('en-US').transform(new Date(), 'yyyyMMdd')}.xlsx`);
  }

  async selectMarkFile(files: any, assessment: Assessments | undefined) {
    let tempFile = files[0];
    let arrayBuffer: any;
    let fileReader: FileReader = new FileReader();
    fileReader.readAsArrayBuffer(tempFile);
    fileReader.onload = (e) => {
      arrayBuffer = fileReader.result;
      var data = new Uint8Array(arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];

      let studentMarks_excelResponse: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      let studentMarks = studentMarks_excelResponse.map((std, idx) => {
        let assessmentObj = { ...assessment }; // Shallow Copy of Assessment
        delete assessmentObj._id; // Delete ID Attribute
        assessmentObj.questions = assessmentObj.questions?.map(e => {
          let stdMarkKey: string | undefined = `Q${e.questionNo} [${e.maximumMarks}] [${e.coCode}]`;
          return {
            ...e,
            obtainedMarks: std[stdMarkKey]
          };
        });
        return {
          studentName: std["Student Name"],
          urn: std["URN"],
          crn: std["CRN"],
          assessmentId: assessment?._id,
          ...assessmentObj,
          totalObtainedMarks: assessmentObj.questions?.reduce((prev, next) => prev + (typeof next.obtainedMarks === 'string' ? 0 : next.obtainedMarks || 0), 0)
        }
      });
      this.importStudentMarks(studentMarks);
    }
  }

  importStudentMarks(studentMarks: any[]) {
    this.loader = true;
    this.httpClient.post(
      `${environment.serverUrl}/attainments/add-student-marks?ciaBool=${this.ciaBool}`,
      { data: [...studentMarks] },
      { headers: this.dataService.httpHeaders }
    )
    .toPromise()
    .then((res) => {
      this.loader = false;
      console.log(">>> res: ", res);
      this.toast.success("Marks Imported Successfully")
    }, (error) => {
      this.loader = false;
      console.error(">>> error: ", error);
      this.toast.error(error)

    })
  }

  checkStringType = (value: any) => typeof value === 'string' ? true : false

  fetchStudentMarks(assessmentModel: Assessments, modalRef: any) {
    this.selectedAssessment = assessmentModel;
    this.httpClient.get<{ attainments: StudentAttainments[] }>(
      `${environment.serverUrl}/attainments/${this.selectedCourse?._id}/${assessmentModel._id}?ciaBool=${this.ciaBool}`,
      { headers: this.dataService.httpHeaders }
    ).toPromise()
    .then((value) => {
      // console.log(">>>: ", value.attainments);
      this.studentAttainments = [ ...value.attainments ];
      this.modalService.open(modalRef, { size: 'xl' })
    }, (error) => {
      // console.log(">>> ", error);
      this.toast.error("Something went wrong while fetching records from server!!")

    })
  }

}
