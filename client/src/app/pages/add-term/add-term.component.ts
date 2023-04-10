import { HttpClient } from '@angular/common/http';
import { hasLifecycleHook } from '@angular/compiler/src/lifecycle_reflector';
import { Component, OnInit, ValueSansProvider } from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DEPARTMENTS } from 'src/app/models/constants';
import { Curriculum } from 'src/app/models/curriculum';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import {Term} from "../../models/term";


@Component({
  selector: 'app-add-term',
  templateUrl: './add-term.component.html',
  styleUrls: ['./add-term.component.css']
})
export class AddTermComponent implements OnInit {
  termForm: FormGroup | undefined;
  termUpdateBool: boolean = false;
  terms: Term[] = [];
  departments: any;
  curriculums: Curriculum[] = [];
  termSub: Subscription | undefined;
  userModel: User = JSON.parse(localStorage.getItem('user') || '');
  loader: boolean = false;
  modal: any;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private toast: ToastrService,
    private data: DataService
  ) { }

  ngOnInit(): void {
    this.departments = DEPARTMENTS;
    this.getTerms();
  }
  getTerms() {
    this.data.getTerms();
    this.termSub = this.data.termsSub.subscribe((res) => {
      // console.log(res);
      if (res.length != 0) {
        this.terms = res;
      }
    });
  }

  initialiseForm(termObj: Term | any = null){
    if(termObj === null) {
      this.termUpdateBool = false;

      this.termForm = this.fb.group({
        termName : [null],
        termNo : [null],
        curriculum: [null],
        deptName: [this.userModel.department],
        termOwner: [this.userModel.firstName + " " + this.userModel.lastName],
        termOwnerId: [this.userModel._id],
        termCurriculum: [null],

        // curriculum: [null],

      });
    } else {
      this.termUpdateBool = true;
      let currObj = this.curriculums.find(x => x._id === termObj.curriculumId);

      this.termForm = this.fb.group({
        _id: [termObj._id],
        termName : [termObj.termName],
        termNo : [termObj.termNo],
        curriculum: [currObj],
        deptName: [this.userModel.department],
        termOwner: [this.userModel.firstName + " " + this.userModel.lastName],
        termOwnerId: [this.userModel._id],
        termCurriculum: [currObj],

        // curriculum: [null],

      });




      // this.termForm = this.fb.group({
      //   _id: [termObj._id],
      //   curriculum: [currObj],
      //   termName: [termObj.termName],
      //   termNo:[termObj.termNo]
      //
      // });

    }
  }


  openTermModal(modalRef: any, term: Term | any = null) {

    this.data.getCurriculums();
    this.data.curriculumsSub.subscribe(list => {
      if(list.length != 0) {
        this.curriculums = list;
        this.initialiseForm(term);
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
    let termObj: Term | any = { ...form.value };

    delete termObj['curriculum'];
    // delete termObj['term'];
    termObj.curriculumId = values.curriculum['_id'];
    termObj.curriculumName = values.curriculum['curriculumName'];
    // courseObj.termId = values.term['_id'];
    // courseObj.termName = values.term['termName'];
    // courseObj.termNo = values.term['termNo'];

    if(!this.termUpdateBool) {
      this.httpClient.post<{ response: Term, error: any }>(`${environment.serverUrl}/terms/addTerm`, { ...termObj })
        .toPromise()
        .then((value) => {
          // console.log(":>>> Value: ", value);
          this.loader = false;
          this.modalService.dismissAll();
          this.toast.success("Term Added Successfully")

          this.terms.push({ ...value.response });
        }, (err) => {
          // console.log(">>> err: ", err);
          this.loader = false;
          this.toast.error(err.error.message);
        });
    } else {
      this.httpClient.put<{ response: Term }>(`${environment.serverUrl}/terms/update-term/${termObj._id}`, { ...termObj })
        .toPromise()
        .then((value) => {
          // console.log(":>>> Value: ", value);
          this.loader = false;
          this.modalService.dismissAll();
          this.toast.success("Term Updated Successfully")
          let idx = this.terms.findIndex(x => x._id === termObj._id);
          this.terms[idx] = { ...value.response };
        }, (err) => {
          // console.log(">>> err: ", err);
          this.loader = false;
          this.toast.error(err.error.message);
        });
    }
  }

  deleteTerm(modalRef: any, id: any) {
    this.modalService.open(modalRef).result.then((value) => {
      this.httpClient.delete(`${environment.serverUrl}/terms/delete-term/${id}`)
        .toPromise()
        .then((value) => {
          this.toast.success("Term Deleted Successfully");
          let idx = this.terms.findIndex(x => x._id === id);
          this.terms.splice(idx, 1);
        }, (err) => {
          // console.log(">>> error", err);
        });

    }, (err) => {
      console.log(">>> error: ", err);

    })
  }






  curriculumTerms() {
    this.curriculums = this.termForm?.get('curriculum')?.value || [];
  }


}
