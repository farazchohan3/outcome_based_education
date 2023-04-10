import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { ROLES, TITLES, DEPARTMENTS } from './../../models/constants';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  user: User;
  userForm: FormGroup | undefined;
  changePasswordForm: FormGroup | undefined;

  updateBool: boolean = false;
  updateLoader: boolean = false;

  profileBool: boolean = true;

  userSignatures: any = [];
  userDesignations: any = [];
  userDepartments: any = [];

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private toast: ToastrService,
    private route: Router
  ) {
    this.userSignatures = TITLES;
    this.userDesignations = ROLES;
    this.userDepartments = DEPARTMENTS;

    this.user = JSON.parse(localStorage.getItem('user') || "") as User;
    if(this.route.url.replace("/", "").split("/")[0] === "change-password") {
      this.profileBool = false;
    } else {
      this.profileBool = true;
    }
    
  }

  ngOnInit(): void {
    if(this.profileBool) {
      this.userForm = this.fb.group({
        firstName: [this.user.firstName],
        lastName: [this.user.lastName],
        email: [this.user.email],
        department: [this.user.department],
        designation: [this.user.designation],
        title: [this.user.title],
        _id: [this.user._id],
      });
      this.userForm.disable();
    } else {
      this.changePasswordForm = this.fb.group({
        password: [null],
        confirmPassword: [null],
        _id: [this.user._id]
      })
    }
  }

  updateProfile(form: FormGroup | undefined): void {
    this.updateLoader = true;
    let user: User = { ...form?.value };
    this.httpClient.put(`${environment.serverUrl}/users/update-user/${user._id}`, user)
      .toPromise()
      .then((value) => {
        this.updateLoader = false;
        this.toast.success('Profile Updated Successfully');
        this.changeUpdateMode();
      })
      .catch((error) => {
        this.updateLoader = false;
        this.toast.warning("Something Went Wrong!! Please Try Again")
        console.log(">>> error: ", error.message);
      });
  }

  changeUpdateMode() {
    if(this.updateBool) {
      this.updateBool = false;
      this.userForm?.disable();
    } else {
      this.updateBool = true;
      this.userForm?.enable();
      this.userForm?.get('email')?.disable();
    }
  }

}
