import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Assessments } from 'src/app/models/assessments';
import { Course } from 'src/app/models/course';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-import-survey-response',
  templateUrl: './import-survey-response.component.html',
  styleUrls: ['./import-survey-response.component.css']
})
export class ImportSurveyResponseComponent implements OnInit {

  selectedCourse: Course | null = null;
  loader: boolean = false;

  assessments: Assessments[] = [];
  selectedAssessment: Assessments | null = null;
  studentAttainments: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private dataService: DataService,
    private toast: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
  }

  courseSelection(value: Course) {
    this.selectedCourse = value;
    this.httpClient.get<{ assessments: Assessments[] }>(`${environment.serverUrl}/assessments/${value._id}/survey-marks`, {
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
    assessment?.questions?.forEach((e) => array.push(`Q${e.questionNo} [${e.coCode}]`));
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
        let ratings = assessment?.questions?.map((ques, idx) => {
          let stdMarkKey: string | undefined = `Q${ques.questionNo} [${ques.coCode}]`;
          let value = std[stdMarkKey]
          return {
            coCode: ques.coCode,
            coStatement: ques.questionStatement,
            value: 20 * value,
            index: value
          };
        });
        return {
          studentName: std["Student Name"],
          urn: std["URN"],
          crn: std["CRN"],
          assessmentId: assessment?._id,
          curriculumId: assessment?.curriculumId,
          curriculumName: assessment?.curriculumName,
          termId: assessment?.termId,
          termName: assessment?.termName,
          termNo: assessment?.termNo,
          courseTitle: assessment?.courseTitle,
          courseCode: assessment?.courseCode,
          courseId: assessment?.courseId,
          rating: ratings
        }
      });
      this.importStudentMarks(studentMarks);
    }
  }

  importStudentMarks(studentMarks: any[]) {
    this.loader = true;
    this.httpClient.post(
      `${environment.serverUrl}/surveys/add-survey`,
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

  fetchStudentMarks(assessmentModel: Assessments, modalRef: any) {
    this.selectedAssessment = assessmentModel;
    this.httpClient.get<{ surveys: any[] }>(
      `${environment.serverUrl}/surveys/${this.selectedCourse?._id}/survey-response/${assessmentModel._id}`,
      { headers: this.dataService.httpHeaders }
    ).toPromise()
    .then((value) => {
      console.log(">>>: ", value.surveys);
      this.studentAttainments = [ ...value.surveys ];
      this.modalService.open(modalRef, { size: 'xl' })
    }, (error) => {
      // console.log(">>> ", error);
      this.toast.error("Something went wrong while fetching records from server!!")

    })
  }

}
