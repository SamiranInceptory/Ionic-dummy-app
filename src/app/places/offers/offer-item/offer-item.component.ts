import { Component, OnInit, Input } from '@angular/core';
import { place } from '../../place.model';

@Component({
  selector: 'app-offer-item',
  templateUrl: './offer-item.component.html',
  styleUrls: ['./offer-item.component.scss'],
})
export class OfferItemComponent implements OnInit {
  @Input() offer: place;
  constructor() { }

  ngOnInit() {}
  getDummyDate() {
    return new Date();
  }
}
