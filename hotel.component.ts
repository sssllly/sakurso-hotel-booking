import { Component, OnInit } from '@angular/core';
import { HotelCardComponent } from '../../hotel-card/hotel-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hotel } from '../../interface/hotel';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hotel',
  imports: [CommonModule, FormsModule, HotelCardComponent],
  templateUrl: './hotel.component.html',
  styleUrl: './hotel.component.css',
})
export class HotelComponent implements OnInit {
  productsData: Hotel[] = [];
  filteredData: Hotel[] = [];

  isLoading: boolean = true;
  errorMessage: string | null = null;


  selectedCity: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  searchTerm: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchHotels();
  }

  fetchHotels(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.getHotels().subscribe({
      next: (data: Hotel[]) => {
        this.productsData = data;
        this.filteredData = [...data];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching hotels:', error);
        this.errorMessage = 'Failed to load hotels. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  filterHotels(): void {
    this.filteredData = this.productsData.filter((hotel) => {
      if (this.minPrice !== null && hotel.price < this.minPrice) {
        return false;
      }

      if (this.maxPrice !== null && hotel.price > this.maxPrice) {
        return false;
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesName = hotel.name.toLowerCase().includes(searchLower);
        const matchesAddress = hotel.address
          .toLowerCase()
          .includes(searchLower);

        if (!matchesName && !matchesAddress) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(): void {
    this.selectedCity = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.searchTerm = '';
    this.filteredData = [...this.productsData];
  }

  getUniqueCities(): string[] {
    const cities = this.productsData.map((hotel) => hotel.city);
    return [...new Set(cities)].sort();
  }

  retryLoading(): void {
    this.fetchHotels();
  }

  trackByHotelId(index: number, hotel: Hotel): number {
    return hotel.id;
  }
}
