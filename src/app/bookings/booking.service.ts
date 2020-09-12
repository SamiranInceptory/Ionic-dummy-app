import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData{
    placeId: string,
    userId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    bookedFrom: string,
    bookedTo: string
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(
    private authService: AuthService,
    private http: HttpClient) { }
    private _bookings = new BehaviorSubject<Booking[]>([]) ;
    get bookings() {
      return this._bookings.asObservable();
    }
  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date){
      var generatedId: string;
      let newBooking: Booking;
      let generatedToken: string;
      return this.authService.token.pipe(take(1),
      switchMap(token => {
        generatedToken = token;
        return this.authService.userId;
      }),
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('No user id found');
        }
        generatedId = userId;
        newBooking = new Booking(Math.random().toString(),
        placeId,
        userId,
        placeTitle,
        placeImage,
        firstName,
        lastName,
        guestNumber,
        dateFrom,
        dateTo);
        return this.http.post<{ name: string}>(`https://ionic-angular-placebookingapp.firebaseio.com/booked-places.json?auth=${generatedToken}`,
        { ...newBooking, id: null });
      }),
      take(1),
      switchMap(resData => {
        generatedId = resData.name;
        newBooking.id = generatedId;
        return this.bookings;
      }),
      take(1),
      tap((bookings => {
        this._bookings.next(bookings.concat(newBooking));
      })));
  }
  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(take(1),
    switchMap(token => {
      return this.http.delete(`https://ionic-angular-placebookingapp.firebaseio.com/booked-places/${bookingId}.json?auth=${token}`)
    }),
    take(1),
    switchMap(bookings => {
      return this.bookings;
    }),
    take(1),
    tap(bookings => {
      this._bookings.next(bookings.filter(updatedBookings => updatedBookings.id !== bookingId));
    }));
  }
  fetchBookings() {
    let fetchedToken: string;
    return this.authService.token.pipe(take(1),
    switchMap(token => {
      fetchedToken = token;
      return this.authService.userId;
    }),
    take(1),
    switchMap(userId => {
      if (!userId) {
        throw new Error('User not found');
      }
      return this.http.get<{[key: string]: BookingData}>
      (`https://ionic-angular-placebookingapp.firebaseio.com/booked-places.json?orderBy="userId"&equalTo="${userId}"&auth=${fetchedToken}`);
    }),
    map(bookingData => {
      const bookings = [];
      for (const key in bookingData){
        if (bookingData.hasOwnProperty(key)){
          bookings.push(new Booking(key,
            bookingData[key].placeId,
            bookingData[key].userId,
            bookingData[key].placeTitle,
            bookingData[key].placeImage,
            bookingData[key].firstName,
            bookingData[key].lastName,
            bookingData[key].guestNumber,
            new Date(bookingData[key].bookedFrom),
            new Date(bookingData[key].bookedTo)));
        }
      }
      return bookings;
    }),
    tap(bookings => {
      this._bookings.next(bookings);
    }));
  }
}
