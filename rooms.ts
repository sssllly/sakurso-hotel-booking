export interface Rooms {
  some(arg0: (booked: { date: string | number | Date; }) => boolean): unknown;
  images: any;
  bookedDates: Rooms | undefined;
  id: number;
  name: string;
  description?: string;
  pricePerNight: number;
  available: boolean;
  maximumGuests: number;
  roomType: string;
  roomTypeId?: number;
  hotelId?: number;
  imageUrl?: string;
}
