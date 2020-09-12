import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { place } from '../../place.model';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit,OnDestroy {
  place: place;
  subsctiption: Subscription;
  isBookable = false;
  isLoading = false;
  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private bookingService: BookingService,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(take(1),
      switchMap(userId => {
        if(!userId){
          throw new Error('No userid found');
        }
        fetchedUserId = userId;
        return this.placesService.getPlace(paramMap.get('placeId'))
      }))
      .subscribe(place => {
        this.place = place;
        if (fetchedUserId === this.place.userId){
          this.isBookable = false;
        }
        else{
          this.isBookable = true;
        }
        this.isLoading = false;
      },
      error => {
        this.alertCtrl.create({
          header: 'Error!',
          message: `Place couldn't be fetched`,
          buttons: [{text: 'Okay',
            handler: () => {
                this.router.navigate(['/', 'places', 'tabs', 'discover']);
            }}]
        }).then(alertEl => alertEl.present());
      });
    });
  }
  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navCtrl.navigateBack('/places/tabs/discover');
    // this.navCtrl.pop();
    this.actionCtrl.create({
      header: 'Choose a Action',
      buttons: [{
        text: 'Select Date',
        handler: () => { this.onAction('Select'); }
      },
      {
        text: 'Random Date',
        handler: () => { this.onAction('Random'); }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ]
    }).then(actionEl => actionEl.present());
  }
  onAction(mode: 'Select' | 'Random'){
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {selectedPlace: this.place, selectedMode: mode}
    }).then(modal => {
        modal.present();
        modal.onDidDismiss().then(resultdata => {
          console.log(resultdata.data.bookingData, resultdata.role );
          if (resultdata.role === 'confirm'){
            this.loadingCtrl.create({
              message: 'Booking Place...'
            }).then(loadingEl => {
              loadingEl.present();
              var data= resultdata.data.bookingData;
              this.bookingService.addBooking(this.place.id,
              this.place.title,
              this.place.imageUrl,
              data.firstName,
              data.lastname,
              data.guest,
              data.dateFrom,
              data.dateTo).subscribe(() => {
                loadingEl.dismiss();
              });
            })
          }
        });
    });
  }
  ngOnDestroy(){
    if (this.subsctiption){
      this.subsctiption.unsubscribe();
    }
  }
}
