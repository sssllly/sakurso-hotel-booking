import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ApiService } from '../services/api.service';
import { Rooms } from '../interface/rooms';
import { CreateBooking } from '../interface/booking';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  roomID: number | undefined;
  bookingForm!: FormGroup;
  selectedRoom: Rooms | undefined;
  minDate: string;
  bookingSuccess: boolean = false;
  bookingError: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    this.minDate = this.formatDate(new Date());
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roomID = +id;
        this.loadRoomDetails(this.roomID);
      } else {
        this.bookingError = 'Room ID not found in the URL. Please navigate from a room card.';
      }
    });

    this.initForm();
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerPhone: ['', [Validators.required, this.phoneValidator()]],
      checkInDate: [null, Validators.required],
      checkOutDate: [null, Validators.required],
    }, { validator: this.dateRangeAndAvailabilityValidator });
  }

  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;


      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const isValid = phoneRegex.test(control.value.replace(/[\s\-\(\)]/g, ''));

      return isValid ? null : { 'invalidPhone': true };
    };
  }

  dateRangeAndAvailabilityValidator: ValidatorFn = (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const checkIn = formGroup.get('checkInDate')?.value;
    const checkOut = formGroup.get('checkOutDate')?.value;

    if (!checkIn || !checkOut) {
      return null;
    }

    const checkInDateObj = new Date(checkIn);
    const checkOutDateObj = new Date(checkOut);
    const today = new Date();


    checkInDateObj.setUTCHours(0, 0, 0, 0);
    checkOutDateObj.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);


    if (checkInDateObj < today) {
      return { 'pastDate': true };
    }

    if (checkOutDateObj <= checkInDateObj) {
      return { 'invalidDateRange': true };
    }


    if (this.selectedRoom && this.selectedRoom.bookedDates) {
      for (let d = new Date(checkInDateObj); d < checkOutDateObj; d.setDate(d.getDate() + 1)) {
        if (this.selectedRoom.bookedDates.some((booked: { date: string | number | Date; }) =>
            new Date(booked.date).toDateString() === d.toDateString())) {
          return { 'roomNotAvailable': true };
        }
      }
    }
    return null;
  };

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadRoomDetails(roomId: number): void {
    this.apiService.getRoomById(roomId).subscribe({
      next: (room: Rooms) => {
        this.selectedRoom = room;

        this.bookingForm.updateValueAndValidity();
      },
      error: (err) => {
        console.error('Error loading room details:', err);
        this.bookingError = `Could not load room details for ID ${roomId}. Please check if the room exists and the API is running.`;
      }
    });
  }

  getNumberOfNights(): number {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    if (checkIn && checkOut) {
      const checkInDateObj = new Date(checkIn);
      const checkOutDateObj = new Date(checkOut);
      checkInDateObj.setUTCHours(0, 0, 0, 0);
      checkOutDateObj.setUTCHours(0, 0, 0, 0);

      const diffTime = Math.abs(checkOutDateObj.getTime() - checkInDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  }

  getTotalPrice(): number {
    if (this.selectedRoom) {
      const nights = this.getNumberOfNights();
      return nights * this.selectedRoom.pricePerNight;
    }
    return 0;
  }

  onDateChange(): void {
    this.bookingForm.updateValueAndValidity();
    this.bookingForm.get('checkInDate')?.markAsTouched();
    this.bookingForm.get('checkOutDate')?.markAsTouched();
  }


  resetForm(): void {
    this.bookingForm.reset();
    this.bookingForm.get('checkInDate')?.setValue(null);
    this.bookingForm.get('checkOutDate')?.setValue(null);
    this.bookingSuccess = false;
    this.bookingError = '';
  }


  goBack(): void {
    this.router.navigate(['/rooms']);
  }

  onSubmit(): void {
    this.bookingSuccess = false;
    this.bookingError = '';
    this.isSubmitting = true;

    if (this.bookingForm.invalid) {
      this.bookingError = 'Please fill in all required fields and correct any errors.';
      this.bookingForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }

    if (!this.roomID || !this.selectedRoom) {
      this.bookingError = 'Room information is missing. Cannot proceed with booking.';
      this.isSubmitting = false;
      return;
    }

    if (this.getTotalPrice() <= 0) {
      this.bookingError = 'Please select valid check-in and check-out dates for at least one night.';
      this.isSubmitting = false;
      return;
    }

    const formValues = this.bookingForm.value;

    const checkInDateObj = new Date(formValues.checkInDate);
    const checkOutDateObj = new Date(formValues.checkOutDate);
    checkInDateObj.setUTCHours(0, 0, 0, 0);
    checkOutDateObj.setUTCHours(0, 0, 0, 0);

    const checkInDateISO = checkInDateObj.toISOString();
    const checkOutDateISO = checkOutDateObj.toISOString();

    const bookingPayload: CreateBooking = {
      roomID: this.roomID,
      checkInDate: checkInDateISO,
      checkOutDate: checkOutDateISO,
      totalPrice: this.getTotalPrice(),
      isConfirmed: true,
      customerName: formValues.customerName.trim(),
      customerPhone: formValues.customerPhone.trim(),
      customerId: ''
    };

    console.log('Attempting to create booking with payload:', bookingPayload);

    this.apiService.createBooking(bookingPayload).subscribe({
      next: (response) => {
        console.log('Booking successful:', response);
        this.bookingSuccess = true;
        this.isSubmitting = false;
        this.resetForm();

        setTimeout(() => {
          this.router.navigate(['/rooms']);
        }, 1000);
      },
    });
  }


  getFormControlError(controlName: string): string {
    const control = this.bookingForm.get(controlName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${controlName} is required.`;
      }
      if (control.errors['minlength']) {
        return `${controlName} must be at least ${control.errors['minlength'].requiredLength} characters.`;
      }
      if (control.errors['invalidPhone']) {
        return 'Please enter a valid phone number.';
      }
    }
    return '';
  }

  getFormErrors(): string[] {
    const errors: string[] = [];
    if (this.bookingForm.errors) {
      if (this.bookingForm.errors['pastDate']) {
        errors.push('Check-in date cannot be in the past.');
      }
      if (this.bookingForm.errors['invalidDateRange']) {
        errors.push('Check-out date must be after check-in date.');
      }
      if (this.bookingForm.errors['roomNotAvailable']) {
        errors.push('The room is already booked for one or more dates within this range. Please choose different dates.');
      }
    }
    return errors;
  }
}
