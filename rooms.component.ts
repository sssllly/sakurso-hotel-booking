import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Rooms } from '../../interface/rooms';
import { Hotel } from '../../interface/hotel';
import { RoomCardComponent } from '../../rooms-card/rooms-card.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-rooms-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RoomCardComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
})
export class RoomsComponent implements OnInit {

  maxGuests: string = 'all';
  minPrice: number = 0;
  maxPrice: number = 99999;
  minDateFilter: string;
  checkInDateFilter: string;
  checkOutDateFilter: string;
  hotelId: number | null = null;
  Hotelname: string = '';

  isLoading: boolean = false;
  errorMessage: string | null = null;

  roomsData: Rooms[] = [];
  filteredRooms: Rooms[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  )
  {
    this.minDateFilter = this.formatDate(new Date());
    this.checkInDateFilter = this.minDateFilter;
    this.checkOutDateFilter = this.formatDate(this.getDefaultCheckoutDate());
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['hotelId']) {
        this.hotelId = parseInt(params['hotelId']);
        this.getHotelDetails();
      }
      this.getAllRooms();
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getDefaultCheckoutDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  getAllRooms(): void {
    this.isLoading = true;
    this.apiService.getAllRooms().subscribe({
      next: (data: Rooms[]) => {
        this.roomsData = data;
        if (this.hotelId) {
          this.roomsData = this.roomsData.filter(
            (room) => room.hotelId === this.hotelId
          );
        }
        this.applyFilters();
        this.isLoading = false;
        console.log('Fetched rooms:', this.roomsData);
      },
      error: (error: any) => {
        console.error('Error fetching rooms:', error);
        this.errorMessage = 'Failed to load rooms. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  getAvailableRooms(): void {
    if (!this.checkInDateFilter || !this.checkOutDateFilter) {
      this.errorMessage =
        'Please select both check-in and check-out dates for availability check.';
      return;
    }

    const checkIn = new Date(this.checkInDateFilter);
    const checkOut = new Date(this.checkOutDateFilter);
    if (checkIn >= checkOut) {
      this.errorMessage =
        'Check-out date must be after check-in date for availability check.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const guestCount = this.maxGuests === 'all' ? 1 : parseInt(this.maxGuests);

    this.apiService
      .getAvailableRooms(
        this.checkInDateFilter,
        this.checkOutDateFilter,
        guestCount
      )
      .subscribe({
        next: (data: Rooms[]) => {
          this.roomsData = data;
          if (this.hotelId) {
            this.roomsData = this.roomsData.filter(
              (room) => room.hotelId === this.hotelId
            );
          }
          this.applyFilters(true);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching available rooms:', error);
          this.errorMessage =
            'Failed to check availability. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  private hasDateConflict(bookedDates: any[], checkIn: string, checkOut: string): boolean {
    if (!bookedDates || bookedDates.length === 0) {
      return false;
    }

    const selectedCheckIn = new Date(checkIn);
    const selectedCheckOut = new Date(checkOut);

    return bookedDates.some((booking: any) => {
      let bookingCheckIn: Date;
      let bookingCheckOut: Date;

      if (typeof booking === 'string') {
        bookingCheckIn = new Date(booking);
        bookingCheckOut = new Date(booking);
      } else if (booking.checkIn && booking.checkOut) {
        bookingCheckIn = new Date(booking.checkIn);
        bookingCheckOut = new Date(booking.checkOut);
      } else if (booking.startDate && booking.endDate) {
        bookingCheckIn = new Date(booking.startDate);
        bookingCheckOut = new Date(booking.endDate);
      } else if (booking.date) {
        bookingCheckIn = new Date(booking.date);
        bookingCheckOut = new Date(booking.date);
      } else {
        return false;
      }
      return selectedCheckIn < bookingCheckOut && selectedCheckOut > bookingCheckIn;
    });
  }

  applyFilters(checkAvailability: boolean = false): void {
    this.filteredRooms = [...this.roomsData];

    if (this.maxGuests !== 'all') {
      const guestCount = parseInt(this.maxGuests);
      this.filteredRooms = this.filteredRooms.filter(
        (room) => room.maximumGuests >= guestCount
      );
    }

    this.filteredRooms = this.filteredRooms.filter(
      (room) =>
        room.pricePerNight >= this.minPrice &&
        room.pricePerNight <= this.maxPrice
    );

    if (checkAvailability && this.checkInDateFilter && this.checkOutDateFilter) {
      this.filteredRooms = this.filteredRooms.filter((room) => {
        if (!room.available) {
          return false;
        }

        if (room.bookedDates && Array.isArray(room.bookedDates)) {
          return !this.hasDateConflict(
            room.bookedDates,
            this.checkInDateFilter,
            this.checkOutDateFilter
          );
        }

        return true;
      });
    }

    console.log(
      'Applied filters. Displaying:',
      this.filteredRooms.length,
      'rooms'
    );
  }

  clearHotelFilter(): void {
    this.hotelId = null;
    this.Hotelname = '';
    this.getAllRooms();
  }

  getHotelDetails(): void {
    if (this.hotelId) {
      this.apiService.getHotelById(this.hotelId).subscribe({
        next: (hotel: Hotel) => {
          this.Hotelname = hotel.name;
        },
        error: (error) => {
          console.error('Error fetching hotel details:', error);
          this.Hotelname = `Hotel ID: ${this.hotelId}`;
        },
      });
    }
  }

}
