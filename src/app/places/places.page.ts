import { Component, OnInit } from '@angular/core';
import { Platform, AlertController, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
})
export class PlacesPage implements OnInit {

  constructor(
    private routerOutlet: IonRouterOutlet,
    private alertCtrl: AlertController,
    private platform: Platform
    ) {
    //   this.platform.backButton.subscribeWithPriority(-1, () => {
    //   if (!this.routerOutlet.canGoBack()) {
    //     this.alertCtrl.create({
    //       header: 'Exit App',
    //       message: 'Do you want to exit from the app?',
    //       buttons: [{
    //         text: 'Okay',
    //         handler: () => {
    //           navigator['app'].exitApp();
    //         }
    //       },
    //         {
    //           text: 'Cancel',
    //           role: 'Cancel'
    //       }]
    //     }).then(alertEl => alertEl.present());
    //   }
    // });
    }

  ngOnInit() {
  }

}
