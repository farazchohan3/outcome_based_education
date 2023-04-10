import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup | undefined;
  errorMsg: string | undefined;
  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, [ Validators.required, Validators.email ]],
      password: [null, [Validators.required, Validators.minLength(6)]]
    });
  }

  loginUser(form: any): void {
    // let formValues = { ...form.value };
    delete this.errorMsg;
    this.loader = true;
    let formValues = Object.assign({}, form.value);
    this.httpClient.post(`${environment.serverUrl}/auth/login`, { ...formValues })
      .toPromise()
      .then((value: { message: string; user: any } | any) => {
        this.loader = false;
        this.cookieService.set('user', { ...value['user'] }, { expires: 1, sameSite: 'Lax', secure: false });
        localStorage.setItem('user', JSON.stringify(value['user']));
        this.router.navigate(['/home'], { replaceUrl: true })
        // console.log(">>> Value: ", value);
      }, (error) => {
        this.loader = false;
        this.errorMsg = error.error.message;
        // console.log(">>> Error: ", error.error.message);
      })
  }

}
