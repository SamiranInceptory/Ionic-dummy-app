import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular'; 
import { Plugins, Capacitor } from '@capacitor/core';
import { AuthService } from './auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription;
  private previousAuthState = false;
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private _location: Location,
    public alertController: AlertController
  ) {
    this.initializeApp();
  }


  ngOnInit() {
    this.subscription = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth ){
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });

  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if ( this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')){
        Plugins.SplashScreen.hide();
      }
    });

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this._location.isCurrentPathEqualTo('/places/tabs/discover') ||
      this._location.isCurrentPathEqualTo('/places/tabs/offers') ||
      this._location.isCurrentPathEqualTo('/auth')) {

        // Show Exit Alert!
        console.log('Show Exit Alert!');
        this.showExitConfirm();
        processNextHandler();
      } else {

        // Navigate to back page
        console.log('Navigate to back page');
        this._location.back();

      }

    });

    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Handler called to force close!');
      this.alertController.getTop().then(r => {
        if (r) {
          r.dismiss();
          navigator['app'].exitApp();
        }
      }).catch(e => {
        console.log(e);
      });
    });

  }

showExitConfirm() {
  this.alertController.create({
    header: 'App termination',
    message: 'Do you want to close the app?',
    backdropDismiss: false,
    buttons: [{
      text: 'Stay',
      role: 'cancel',
      handler: () => {
        console.log('Application exit prevented!');
      }
    }, {
      text: 'Exit',
      handler: () => {
        navigator['app'].exitApp();
      }
    }]
  })
    .then(alert => {
      alert.present();
    });
}

  onLogout(){
    this.authService.logout();
  }
}
