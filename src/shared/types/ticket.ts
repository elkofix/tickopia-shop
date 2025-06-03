export interface User {
  id: string;
  email: string;
  name: string;
  lastname: string;
  isActive: boolean;
  roles: string[];
}

export interface Ticket {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    lastname: string;
  };
  presentation: {
    idPresentation: string;
    place: string;
    startDate: string;
    event: {
      id: string;
      name: string;
      bannerPhotoUrl: string;
    };
  };
  isActive: boolean;
  isRedeemed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuyTicketDto {
  presentationId: string;
  quantity: number;
}

export type TicketInput = {
  userId: string
  presentationId: string
}

export type UserOption = {
  id: string
  email: string
}

export interface PresentationOption {
idPresentation: string;
startDate: string; // ISO format e.g. '2025-05-06T10:00:00Z'
place: string;
city: string;
event?: {
name: string;
};
}
