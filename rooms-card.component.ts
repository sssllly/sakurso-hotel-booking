// src/app/room-card/room-card.component.ts

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Rooms } from '../interface/rooms';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms-card.component.html',
  styleUrls: ['./rooms-card.component.css']
})
export class RoomCardComponent {
  @Input() room!: Rooms;

  constructor(private router: Router) {}

  bookRoom(roomId: number): void {
    console.log('Navigating to booking page for room ID:', roomId);
    this.router.navigate(['/booking', roomId]).then(
      (success) => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.error('Navigation failed');
        }
      }
    ).catch(error => {
      console.error('Navigation error:', error);
    });
  }


  bookRoomWithState(room: Rooms): void {
    console.log('Navigating to booking page with room data:', room);

    this.router.navigate(['/booking', room.id], {
      state: { room: room }
    }).then(
      (success) => {
        if (success) {
          console.log('Navigation with state successful');
        } else {
          console.error('Navigation failed');
        }
      }
    ).catch(error => {
      console.error('Navigation error:', error);
    });
  }
}
