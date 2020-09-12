import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient) { }

  ngOnInit() {}

  onPickLocation(){
    this.modalCtrl.create({component: MapModalComponent}).then(modalEl => {
      modalEl.present();
      modalEl.onDidDismiss().then(modaldata => {
        if (modaldata.data){
          console.log(modaldata.data);
          // this.getAddress(modaldata.data.lat, modaldata.data.lng).subscribe();
        }
      });
    });
  }
  private getAddress(lat: number, lng: number) {
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=`)
    .pipe(map(geoData => {
      console.log(geoData);
    }));
  }

}
