import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: place[];
  offersSub: Subscription;
  isLoading = false;
  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.offersSub = this.placesService.places.subscribe(offers => {
      this.offers = offers;
    });
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onEdit(id: string, slider: IonItemSliding){
    slider.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', id]);
  }

  ngOnDestroy() {
    if (this.offersSub){
      this.offersSub.unsubscribe();
    }
  }
}
