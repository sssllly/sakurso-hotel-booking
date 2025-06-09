import { Rooms } from './../interface/rooms';
import { Hotel } from './../interface/hotel';
import { Booking, CreateBooking } from './../interface/booking';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://hotelbooking.stepprojects.ge/api';
  hotelId: any;
  Hotelname: string | undefined;

  constructor(private http: HttpClient) {}

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.baseUrl}/Hotels/GetAll`);
  }

  getHotelById(hotelId: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.baseUrl}/Hotels/GetAll/${hotelId}`);
  }

  postHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(`${this.baseUrl}/Hotels/GetAll`, hotel);
  }

  getAllRooms(): Observable<Rooms[]> {
    return this.http.get<Rooms[]>(`${this.baseUrl}/Rooms/GetAll`);
  }

  getAvailableRooms(
    checkInDate: string,
    checkOutDate: string,
    guests: number
  ): Observable<Rooms[]> {
    let params = new HttpParams()
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate)
      .set('guests', guests.toString());

    return this.http.get<Rooms[]>(`${this.baseUrl}/Rooms/GetAvailableRooms`, { params });
  }

  getRoomTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Rooms/GetRoomTypes`);
  }

  getFilteredRooms(
    minPrice?: number,
    maxPrice?: number,
    roomTypeId?: number
  ): Observable<Rooms[]> {
    let params = new HttpParams();
    if (minPrice !== undefined) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params = params.set('maxPrice', maxPrice.toString());
    }
    if (roomTypeId !== undefined) {
      params = params.set('roomTypeId', roomTypeId.toString());
    }

    return this.http.get<Rooms[]>(`${this.baseUrl}/Rooms/GetFiltered`, { params });
  }

  getRoomById(id: number): Observable<Rooms> {
    return this.http.get<Rooms>(`${this.baseUrl}/Rooms/getRoom/${id}`);
  }

  
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/Booking`);
  }

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/Booking/${bookingId}`);
  }

  createBooking(booking: CreateBooking): Observable<any> {
    const formattedBooking = {
      ...booking,
      checkInDate: new Date(booking.checkInDate).toISOString(),
      checkOutDate: new Date(booking.checkOutDate).toISOString(),
      customerName: booking.customerName.trim(),
      customerPhone: booking.customerPhone.trim(),
    };

    return this.http.post(`${this.baseUrl}/Booking`, formattedBooking, {
      responseType: 'text',
    });
  }

  updateBooking(bookingId: number, booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/Booking/${bookingId}`, booking);
  }

  deleteBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Booking/${bookingId}`);
  }

  getHotelDetails(): void {
    if (this.hotelId) {
      this.getHotelById(this.hotelId).subscribe({
        next: (hotel: Hotel) => {
          this.Hotelname = hotel.name;
        },
        error: (error: any) => {
          console.error('Error fetching hotel details:', error);
          this.Hotelname = `Hotel (ID: ${this.hotelId})`;
        },
      });
    }
  }

  checkApiHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  validateRoomAvailability(
    roomId: number,
    checkInDate: string,
    checkOutDate: string
  ): Observable<boolean> {
    const params = new HttpParams()
      .set('roomId', roomId.toString())
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate);

    return this.http.get<boolean>(`${this.baseUrl}/Rooms/CheckAvailability`, { params });
  }
}
