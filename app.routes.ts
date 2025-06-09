import { Routes } from '@angular/router';

import { HotelComponent } from './pages/hotel/hotel.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { BookingFormComponent } from './booking-form/booking-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HotelComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'booking/:id', component: BookingFormComponent },
  { path: '**', redirectTo: '/home' }
];

