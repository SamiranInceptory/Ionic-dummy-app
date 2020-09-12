import { Injectable } from '@angular/core';
import { place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap, first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface placeData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

// new place(
//   'p1',
//   'Manhattan Mansion',
//   'In the heart of New York City.',
//   'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
//   149.99,
//   new Date('2020-01-01'),
//   new Date('2020-12-31'),
//   'abc'),
//   new place(
//   'p2',
//   "L'Amour Toujours",
//   'A romantic place in Paris!',
//   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
//   189.99,
//   new Date('2020-01-01'),
//   new Date('2020-12-31'),
//   'xyz'
//   ),
//   new place(
//   'p3',
//   'The Foggy Palace',
//   'Not your average city trip!',
//   'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
//   99.99,
//   new Date('2020-01-01'),
//   new Date('2020-12-31'),
//   'abc'
//   )

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  constructor(
    private authService: AuthService,
    private http: HttpClient){

  }
  private _places = new BehaviorSubject<place[]>([]);
  get places(){
    return this._places.asObservable();
  }
  getPlace(id: string) {
    return this.authService.token.pipe(take(1),
    switchMap(token => {
      return this.http.get<placeData>(`https://ionic-angular-placebookingapp.firebaseio.com/offered-places/${id}.json?auth=${token}`)
    }),
    take(1),
    map(placeData => {
      return new place(
        id,
        placeData.title,
        placeData.description,
        placeData.imageUrl,
        placeData.price,
        new Date(placeData.availableFrom),
        new Date(placeData.availableTo),
        placeData.userId
        );
    }));
  }
  fetchPlaces(){
    return this.authService.token.pipe(take(1),
    switchMap(token => {
      return this.http.get<{ [key: string]: placeData }>(`https://ionic-angular-placebookingapp.firebaseio.com/offered-places.json?auth=${token}`)
    }),
    take(1),
    map(resData => {
      const places = [];
      for(const key in resData){
        if(resData.hasOwnProperty(key)){
          places.push(new place(key,
            resData[key].title,
            resData[key].description,
            resData[key].imageUrl,
            resData[key].price,
            new Date(resData[key].availableFrom),
            new Date(resData[key].availableTo),
            resData[key].userId));
        }
      }
      return places;
    }),
    take(1),
    tap(resData => {
      this._places.next(resData);
    }));
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);
    return this.authService.token.pipe(take(1),
    switchMap(token => {
      return this.http.post<{imageUrl: string, imagePath: string}>('https://us-central1-ionic-angular-placebookingapp.cloudfunctions.net/storeImage',
      uploadData, { headers: { Authorization: 'Bearer ' + token } });
    }));
  }

  addPlace(title: string, description: string, price: number, availableFrom: Date, availableTo: Date, imageUrl: string) {
    let generatedId: string;
    let newPlace: place;
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1),
    switchMap(userId => {
      fetchedUserId = userId;
      return this.authService.token;
    }),
    take(1),
    switchMap(token => {
      if (!fetchedUserId){
        throw new Error('User id not found');
      }
      newPlace = new place(Math.random().toString(),
      title,
      description,
      imageUrl,
      price,
      availableFrom,
      availableTo,
      fetchedUserId);
      return this.http.post<{name: string}>(`https://ionic-angular-placebookingapp.firebaseio.com/offered-places.json?auth=${token}`,
     { ...newPlace, id: null});
    }),
    take(1),
    switchMap(resData => {
      generatedId = resData.name;
      return this.places;
    }),
    take(1),
    tap(places => {
      newPlace.id = generatedId;
      this._places.next((places.concat(newPlace)));
    }));
}
  updateOffer(placeId: string, title: string, description: string){
    var updatedPlaces: place[];
    let generatedToken: string;
    return this.authService.token.pipe(take(1),
    switchMap(token => {
      generatedToken = token;
      return this.places;
    }),
    take(1),
    switchMap(places => {
      if (!places || places.length <= 0){
        return this.fetchPlaces();
      }
      else{
        return of(places);
      }
    }),
    take(1),
    switchMap(places => {
      var updatedPlaceIndex = places.findIndex(p => p.id === placeId);
      updatedPlaces = [...places];
      var oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new place(placeId,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId);
      return this.http.put(`https://ionic-angular-placebookingapp.firebaseio.com/offered-places/${placeId}.json?auth=${generatedToken}`,
      { ...updatedPlaces[updatedPlaceIndex], id: null });
    }),
    tap(() => {
      this._places.next(updatedPlaces);
    }));
  }
}
