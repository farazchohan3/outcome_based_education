import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CO_CODE } from 'src/app/models/constants';
import { Course } from 'src/app/models/course';
import { StudentAttainments } from 'src/app/models/student-attainments';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-co-attainment',
  templateUrl: './co-attainment.component.html',
  styleUrls: ['./co-attainment.component.css']
})
export class CoAttainmentComponent implements OnInit {

  tempFile: any = null;
  courseId: string | undefined;

  title: string | undefined;
  studentsAttainments: StudentAttainments[] = [];

  ciaAttainment: any[] = [];
  eseAttainment: any[] = [];

  totalDirectAttainment: any[] = [];
  totalIndirectAttainment: any[] = [];
  totalAttainment: any[] = [];
  selectedCourse: Course | undefined;

  benchMark: number = 0;
  totalStudents: number = 0;

  constructor(
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private dataService: DataService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.title = this.router.url.replace('/', "").split("/")[1].split("-").map(e => e.toUpperCase()).join(" ");
  }

  getSelectedCourse(courseObj: Course) {
    this.selectedCourse = { ...courseObj };
  }

  openDirectAttainmentModal(modalRef: any) {
    this.modalService.open(modalRef).result
      .then((value: number) => {
        let num = Number(value) || 0;
        if(num > 0 && num <= 100) {
          this.benchMark = num;
          this.getStudentAttainments(this.selectedCourse?._id);
        } else {
          this.toast.warning("Bench Mark should be greater than 0 and less than or equal to 100", "Warning");
        }
      }, (error) => {});
  }

  openInDirectAttainmentModal(modalRef: any) {
    this.modalService.open(modalRef).result
      .then((value: number) => {
        let num = Number(value) || 0;
        if(num > 0) {
          this.totalStudents = num;
          this.getSurvey(this.selectedCourse?._id);
        } else {
          this.toast.warning("Value should be greater than 0", "Warning");
        }
      }, (error) => {});
  }

  getStudentAttainments(courseId: string | undefined) {
    this.httpClient.get<{ ciaMarks: StudentAttainments[], eseMarks: StudentAttainments[] }>(
      `${environment.serverUrl}/attainments/${this.selectedCourse?._id}`,
      { headers: this.dataService.httpHeaders }
    ).toPromise()
      .then((value) => {
        this.ciaAttainment = this.calculateAttainemnt(this.formatRecord([...value.ciaMarks]));
        this.eseAttainment = this.calculateAttainemnt(this.formatRecord([...value.eseMarks]));
        this.totalDirectAttainment = CO_CODE.map((code, idx) => {
          let coAttain = (0.4 * Math.round(this.ciaAttainment[idx]['attaimentPercentage'] * 100)) + (0.6 * Math.round(this.eseAttainment[idx]['attaimentPercentage'] * 100));
          let attainmentObj = this.checkAttainment(coAttain);
          return {
            'coCode': code,
            'ciaPercentage': this.ciaAttainment[idx]['attaimentPercentage'],
            'esePercentage': this.eseAttainment[idx]['attaimentPercentage'],
            'totalAttainment': coAttain / 100,
            'attainmentLevel': attainmentObj.attainmentLevel,
            'date': new Date()
          };
        });
      }, (error) => {
        // console.log(">>> error: ", error);
      })
  }

  calculateTotalAttainment() {
    this.totalAttainment = CO_CODE.map((code, idx) => {
      let coAttain = (0.9 * Math.round(this.totalDirectAttainment[idx]['totalAttainment'] * 100)) + (0.1 * Math.round(this.totalIndirectAttainment[idx]['totalAvg']));

      let attainmentLevel = this.checkAttainment(coAttain).attainmentLevel;
      return {
        coCode: code,
        directAttainment: this.totalDirectAttainment[idx]['totalAttainment'],
        indirectAttainment: this.totalIndirectAttainment[idx]['totalAvg'] / 100,
        totalCOAttainment: coAttain,
        attainmentLevel: attainmentLevel
      };
    });

    let tottalCoAttainmentObj = {
      curriculumId: this.selectedCourse?.curriculumId,
      curriculumName: this.selectedCourse?.curriculumName,
      termId: this.selectedCourse?.termId,
      termName: this.selectedCourse?.termName,
      termNo: this.selectedCourse?.termNo,
      courseTitle: this.selectedCourse?.courseTitle,
      courseCode: this.selectedCourse?.courseCode,
      courseId: this.selectedCourse?._id,
      ciaAttainment: [...this.ciaAttainment],
      eseAttainment: [...this.eseAttainment],
      directAttainment: [...this.totalDirectAttainment],
      indirectAttainment: [...this.totalIndirectAttainment],
      totalAttainment: [...this.totalAttainment]
    };

    this.httpClient.post(
      `${environment.serverUrl}/totalcoattainments/add-total-co-attainment`,
      { ...tottalCoAttainmentObj }, {
        headers: this.dataService.httpHeaders
      }).toPromise()
      .then((value) => {
        console.log("total co attainment >>>>>>",value);

        this.toast.success("Total CO Attainment Added Successfully");
      }, (error) => {
        console.error(">>> error: ", error);

        this.toast.error("Something went wrong!! Please Try Again...")
      });
  }

  formatRecord(attainments: StudentAttainments[]) {
    let studentMarks: StudentAttainments[] = [];
    let map: Map<number | undefined, any> = new Map<number | undefined, any>();
    if (attainments.length === 0) return studentMarks;

    attainments.forEach((std, idx) => {
      if (map.has(std.crn)) {
        // console.log(">>> Already Existed");
        let stdMap = { ...map.get(std?.crn) };
        std.questions?.forEach((e, idx) => {
          stdMap.questions.push({
            ...e,
            "assessmentId": std.assessmentId,
            "assessmentName": std.assessmentName,
            "assessmentType": std.assessmentType
          });
        });
        delete stdMap?.assessmentId;
        delete stdMap?.assessmentName;
        delete stdMap?.assessmentType;
        map.set(std.crn, { ...stdMap });
      } else {
        // console.log(">>> New Occurences");
        let obj = { ...std };
        obj.questions = obj.questions?.map(e => ({
          ...e,
          "assessmentId": std.assessmentId,
          "assessmentName": std.assessmentName,
          "assessmentType": std.assessmentType
        }));
        delete obj?.assessmentId;
        delete obj?.assessmentName;
        delete obj?.assessmentType;
        map.set(std.crn, { ...obj });
      }
    });
    map.forEach((value, key) => studentMarks.push({ ...value }));
    return studentMarks;
  }

  calculateAttainemnt(stdRecords: StudentAttainments[]) {
    // let benchMark = 60;
    let coCODEs = [ ...CO_CODE ];
    let CO_Object: any = {
      "CO1": { coCode: "CO1", count: 0, maximumMarks: 0, attainment: "Not Applicable", attainmentLevel: 0, attainmentType: "Very Low", attaimentPercentage: 0 },
      "CO2": { coCode: "CO2", count: 0, maximumMarks: 0, attainment: "Not Applicable", attainmentLevel: 0, attainmentType: "Very Low", attaimentPercentage: 0 },
      "CO3": { coCode: "CO3", count: 0, maximumMarks: 0, attainment: "Not Applicable", attainmentLevel: 0, attainmentType: "Very Low", attaimentPercentage: 0 },
      "CO4": { coCode: "CO4", count: 0, maximumMarks: 0, attainment: "Not Applicable", attainmentLevel: 0, attainmentType: "Very Low", attaimentPercentage: 0 },
      "CO5": { coCode: "CO5", count: 0, maximumMarks: 0, attainment: "Not Applicable", attainmentLevel: 0, attainmentType: "Very Low", attaimentPercentage: 0 },
      "CO6": { coCode: "CO6", count: 0, maximumMarks: 0, attainment: "Not Applicable", attainmentLevel: 0, attainmentType: "Very Low", attaimentPercentage: 0 }
    };

    if (stdRecords.length === 0) return Object.values(CO_Object);

    let totalQuestions = stdRecords[0].questions?.length; // 19
    console.log(">>> Total Questions: ", totalQuestions);

    coCODEs.forEach((code: any) => {
      CO_Object[code]['maximumMarks'] = stdRecords[0].questions?.filter(e => e.coCode === code).reduce((prev, next) => prev + (next.maximumMarks || 0), 0)
    });

    stdRecords.forEach((student, stdIdx) => {
      let A_Counter = 0;
      student.questions?.forEach((ques, quesIdx: number) => {
        if (ques.obtainedMarks === 'A') A_Counter++;
        if (ques.obtainedMarks === 'NA') student.questions[quesIdx].obtainedMarks = 'A';
      });
      if (A_Counter === totalQuestions) stdRecords.splice(stdIdx, 1);
    });

    stdRecords.forEach((student, stdIdx) => {
      coCODEs.forEach((code, codeIdx) => {
        let questions = student.questions.filter(e => e.coCode === code && e.obtainedMarks !== 'A');
        let totalMarks = questions.reduce((prev, next) => prev + next.maximumMarks, 0);
        let obtainedMarks = questions.reduce((prev, next) => prev + (typeof next.obtainedMarks === 'string' ? 0 : next.obtainedMarks || 0), 0);
        let CO_AVG = Math.floor((obtainedMarks / totalMarks) * 100);
        if (CO_AVG >= this.benchMark) {
          CO_Object[code].count++;
        }
      });
    });

    coCODEs.forEach(CO => {
      if (CO_Object[CO].count != 0) {
        // let attaimentPercentage = Math.round((CO_Object[CO].count / stdRecords.length) * 100);
        let attaimentPercentage = Math.round((CO_Object[CO].count / stdRecords.length) * 100);
        CO_Object[CO].attaimentPercentage = (CO_Object[CO].count / stdRecords.length);

        let obj = this.checkAttainment(attaimentPercentage);
        CO_Object[CO].attainmentLevel = obj.attainmentLevel;
        CO_Object[CO].attainmentType = obj.attainmentType;
        CO_Object[CO].attainment = obj.attainment;
      }
    });
    return Object.values(CO_Object) || [];
  }

  getSurvey(courseId : string | undefined) {
    this.httpClient.get<{ surveys : any[] }>(
      `${environment.serverUrl}/surveys/${courseId}`,
      { headers: this.dataService.httpHeaders }
    )
      .toPromise()
      .then((value) => {
        console.log(">>> surveys ", value);
        // let totalStudents = 8;
        let ratings: any[] = value.surveys.map(e => [...e.rating]);
        let map: Map<string, any> = new Map<string, any>();
        ratings.forEach((rate, idx) => {
          CO_CODE.forEach((code: string) => {
            if(map.has(code)) {
              let rateArray: any[] = map?.get(code);
              rateArray?.push({...rate.filter((x: any) => x.coCode === code)[0]})
              map.set(code, rateArray)
            } else {
              map.set(code, [ ...rate.filter((x: any) => x.coCode === code) ])
            }
          });
        });

        map.forEach((value, key) => {
          let totalSum = 0;
          const getLength = (idx: number) => value.filter((x: any) => x.index === idx).length || 0;
          const getSum = (idx: number) => {
            totalSum += (getLength(idx) * (20 * idx));
            return {
              index: idx,
              count: getLength(idx),
              totalRate: getLength(idx) * (20 * idx)
            };
          }

          let temp = {
            coCode: key,
            1: getSum(1),
            2: getSum(2),
            3: getSum(3),
            4: getSum(4),
            5: getSum(5),
            totalSum: totalSum,
            totalAvg: totalSum / this.totalStudents,
            totalStudents: this.totalStudents,
          };
          this.totalIndirectAttainment.push({
            ...temp,
            attainmentLevel: this.checkAttainment(temp.totalAvg).attainmentLevel
          });
        });
      }, (error) => {
        // console.log(error);

      });
  }

  checkAttainment(value: number) {
    let attainmentObj: {
      attainmentLevel: number | undefined;
      attainmentType: string | undefined;
      attainment: string | undefined;
    };

    if (value >= 70) {
      attainmentObj = {
        attainmentLevel: 3,
        attainmentType: "High",
        attainment: "Target Attained"
      };
    }
    else if (value >= 60) {
      attainmentObj = {
        attainmentLevel: 2,
        attainmentType: "Moderate",
        attainment: "Target Attained"
      };
    }
    else if (value >= 50) {
      attainmentObj = {
        attainmentLevel: 1,
        attainmentType: "Low",
        attainment: "Target Attained"
      };
    }
    else {
      attainmentObj = {
        attainmentLevel: 0,
        attainmentType: "",
        attainment: "Target Not Attained"
      };
    }

    return attainmentObj;
  }

}
