import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Course } from 'src/app/models/course';
import { CourseOutcomes } from 'src/app/models/course-outcomes';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-po-attainment',
  templateUrl: './po-attainment.component.html',
  styleUrls: ['./po-attainment.component.css']
})
export class PoAttainmentComponent implements OnInit {

  selectedCourse: Course;
  poMap: any;
  totalPOPSOAttainment: any[] = [];


  constructor(
    private toast: ToastrService,
    private httpClient: HttpClient,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
  }

  getSelectedCourse(courseObj: Course) {
    this.selectedCourse = courseObj
    this.httpClient.get<{ poMap: any, finalCo: any, cos: CourseOutcomes[] }>(
      `${environment.serverUrl}/co_po_mapping/${this.selectedCourse._id}/get-po-map/${this.selectedCourse.poMapId}`,
      { headers: this.dataService.httpHeaders }
    ).toPromise()
      .then((res) => {
        let coHrs: any = {};
        res.cos.forEach((code, idx) => {
          let key = code.coCode || "";
          let totalAttainmentObj: any = Array.from(res.finalCo.totalAttainment).find((x: any) => x.coCode === code.coCode);
          let coAVg = Math.round(totalAttainmentObj.totalCOAttainment)
          coHrs[key] = {
            classHrs: code.classHrs,
            labHrs: code.labHrs,
            coAvg: coAVg || 0
          }
        });
        let totalCOHrs = res.cos.reduce((prev, next) => prev + ((next.classHrs || 0) + (next.labHrs || 0)), 0);
        let poKeys = Object.keys(res.poMap).filter(x => RegExp(/[PO]/g).test(x));
        this.totalPOPSOAttainment = poKeys.map((key, poIdx) => {
          let poArray = Array.from(res.poMap[key]);
          let totalHrs = poArray.reduce((prev, next) => prev + (coHrs[String(next)].classHrs + coHrs[String(next)].labHrs), 0);
          let sessionAvg = Number(totalHrs) / totalCOHrs;
          let mappingStrength = this.getPOMapStrength(sessionAvg * 100);

          let coSumAvg = Number(poArray.reduce((prev, next) => prev + coHrs[String(next)].coAvg, 0)) / poArray.length;
          let attainment = (mappingStrength / 3) * coSumAvg;
          return {
            "poKey": key,
            "coArray": poArray,
            "totalHrs": totalHrs,
            "totalCOHrs": totalCOHrs,
            "sessionAvg": sessionAvg,
            "mappingStrength": mappingStrength,
            "attainment": attainment / 100
          }
        }

        );

        let tottalPoAttainmentObj = {
          curriculumId: this.selectedCourse?.curriculumId,
          curriculumName: this.selectedCourse?.curriculumName,
          termId: this.selectedCourse?.termId,
          termName: this.selectedCourse?.termName,
          termNo: this.selectedCourse?.termNo,
          courseTitle: this.selectedCourse?.courseTitle,
          courseCode: this.selectedCourse?.courseCode,
          courseId: this.selectedCourse?._id,
          totalPOPSOAttainment: this.totalPOPSOAttainment
        };

        this.httpClient.post(
          `${environment.serverUrl}/totalpoattainments/add-total-po-attainment`,
          { ...tottalPoAttainmentObj }, {
          headers: this.dataService.httpHeaders
        }).toPromise()
          .then((value) => {

            console.log(value);
            
            this.toast.success("Total CO Attainment Added Successfully");
          }, (error) => {
            console.error(">>> error: ", error);

            this.toast.error("Something went wrong!! Please Try Again...")
          });
      }, (error) => { });

  }


  getPOMapStrength(value: number) {
    let poMappingStrength: number = 0;
    if (value > 40) {
      poMappingStrength = 3;
    }
    else if (value > 25 && value <= 40) {
      poMappingStrength = 2;
    }
    else if (value > 5 && value <= 25) {
      poMappingStrength = 1;
    }
    else {
      poMappingStrength = 0;
    }
    return poMappingStrength;
  }

}
