import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';

import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  subscription: Subscription;
  isLoading = false;
  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.subscription = this.bookingService.bookings.subscribe(bookings => {
      console.log(bookings);
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }

  onCancelBooking(offerId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl.create({
      message: 'Deleting Booking...'
    }).then(loadingEl => {
      loadingEl.present();
      this.bookingService.cancelBooking(offerId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
    // cancel booking wiht id offerId
  }
  ngOnDestroy(){
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
