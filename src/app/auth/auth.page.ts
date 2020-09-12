import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgModel, NgForm } from '@angular/forms';
import { error } from 'protractor';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLogin = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private loader: LoadingController,
    private alertCtrl: AlertController,
    ) { }

  ngOnInit() {
    
  }

  authenticate(email: string, password: string){
    this.loader.create({keyboardClose: true, message: 'Logging in...'}).then(loaderEl => {
      loaderEl.present();
      let authObs: Observable<AuthResponseData>;
      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      }
      else {
        authObs = this.authService.signUp(email, password);
      }
      authObs.subscribe(resData => {
        console.log(resData);
        this.loader.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      }, errorRes => {
          console.log(errorRes);
          this.loader.dismiss();
          const  code = errorRes.error.error.message;
          let messege = 'Could not sign you up, Please try again';
          if (code === 'EMAIL_EXISTS'){
            messege = 'This email address already exists';
          }
          else if (code === 'EMAIL_NOT_FOUND') {
            messege = 'Email address not found';
          }
          else if (code === 'INVALID_PASSWORD') {
            messege = 'This password is not correct';
          }
          this.showAlert(messege);
      });
    });
  }

  showAlert(message: string) {
   this.alertCtrl.create({header: 'Authentication failed', message: message, buttons: ['Okay']})
   .then(alertEl => alertEl.present());
  }

  onSubmit(form: NgForm){
    if (!form.valid){
      return;
    }
    const email = form.value.email;
    const pass = form.value.password;
    this.authenticate(email, pass);
    form.reset();
  }
  
  onSwitch(){
    this.isLogin = !this.isLogin;
  }

}
