import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { place } from '../../place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss']
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: place;
  placeId: string;
  form: FormGroup;
  subscription: Subscription;
  isLoading = false;
  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.subscription = this.placesService.getPlace(this.placeId).subscribe(place => {
        this.place = place;
        console.log(this.place);
        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          })
        });
        this.isLoading = false;
      },
      error => {
        this.alertCtrl.create({
          header: 'Error!',
          message: `Place couldn't be fetched`,
          buttons: [{text: 'Okay',
            handler: () => {
                this.router.navigate(['/', 'places', 'tabs', 'offers']);
            }}]
        }).then(alertEl => alertEl.present());
      });
    });
  }
  onEditOffer(){
    if (!this.form.valid){
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating Offer...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updateOffer(this.place.id, this.form.value.title, this.form.value.description).subscribe(() => {
        loadingEl.dismiss();
        this.router.navigate(['/places/tabs/offers']);
      });
    });
  }
  ngOnDestroy(){
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }

}