import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Hotel } from '../interface/hotel';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIfContext } from '@angular/common';

@Component({
  selector: 'app-hotel-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.css'
})
export class HotelCardComponent {
  @Input() product!: Hotel;
  @Input() customPath!: any;

  @Output() deleteBtnClick = new EventEmitter<void>();

  isLoading: boolean = false;
  imageError: boolean = false;
  errorBlock: TemplateRef<NgIfContext<Hotel>> | null | undefined;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  navigateToDetails(): void {
    if (this.product?.id) {
      this.router.navigate(['/hotel', this.product.id.toString()]);
    }
  }

  navigateToRooms(): void {
    if (this.product?.id) {
      this.router.navigate(['/rooms'], {
        queryParams: { hotelId: this.product.id }
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  onImageLoad(): void {
    this.imageError = false;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
