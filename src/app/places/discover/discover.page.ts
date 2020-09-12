import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { place } from '../place.model';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  loadedPlaces: place[];
  listedLoadedPlaces: place[];
  relevantPlaces: place[];
  subcription: Subscription;
  isLoading = false;
  constructor(
    private placeService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.subcription = this.placeService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.placeService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu(){
    this.menuCtrl.open();
  }

  onSegmentChange(event: any){
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
      else{
        this.relevantPlaces = this.loadedPlaces.filter(
          p => {
            return p.userId !== userId;
          });
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
  }

  ngOnDestroy(){
    if (this.subcription){
      this.subcription.unsubscribe();
    }
  }
}
