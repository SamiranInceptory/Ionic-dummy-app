import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss']
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: place;
  subscription: Subscription;
  isLoading = false;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.isLoading =true;
      this.subscription = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.isLoading = false;
      });
    });
  }
  ngOnDestroy(){
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
