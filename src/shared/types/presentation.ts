// shared/types/presentation.ts
import { Event } from './event'
export interface CreatePresentationDto {
  place: string;
  capacity: number;
  openDate: string;
  startDate: string;
  price: number;
  latitude: number;
  longitude: number;
  description: string;
  ticketAvailabilityDate: string;
  ticketSaleAvailabilityDate: string;
  city: string;
  eventId: string;
}

export interface Presentation {
  presentationId: string
  startDate: string
  capacity: number
  place: string
  city: string
  price: number
  latitude: number
  longitude: number
  description: string
  openDate: string
  ticketAvailabilityDate: string
  ticketSaleAvailabilityDate: string
  event: Event
}

export interface UpdatePresentationDto {
  city?: string
  place?: string
  startDate?: string
  capacity?: number
  price?: number
  latitude?: number
  longitude?: number
  description?: string
  openDate?: string
  ticketAvailabilityDate?: string
  ticketSaleAvailabilityDate?: string
  eventId?: string
}
