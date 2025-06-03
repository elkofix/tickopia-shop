import axiosClient from '@/shared/lib/axiosClient';
import * as ticketsApi from '../tickets.api';
import { BuyTicketDto, Ticket, TicketInput, UserOption, PresentationOption } from '../../../shared/types/ticket';

// src/features/tickets/tickets.api.test.ts

jest.mock('../../../shared/lib/axiosClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: { headers: { common: {} } }
}));

const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('tickets.api', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buyTickets', () => {
    const ticketDto: BuyTicketDto = { /* fill with required fields */ } as any;
    const response = {
      url: 'http://checkout',
      checkoutSession: 'sess_123',
      tickets: [{ id: 't1' }]
    };

    it('should call axiosClient.post with correct args and return data', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: response });
      const result = await ticketsApi.buyTickets(ticketDto);
      expect(mockedAxios.post).toHaveBeenCalledWith('/tickets/buy', ticketDto);
      expect(result).toEqual(response);
    });

    it('should throw error on failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('fail'));
      await expect(ticketsApi.buyTickets(ticketDto)).rejects.toThrow('fail');
    });
  });

  describe('getMyTickets', () => {
    const tickets: Ticket[] = [{ id: '1' } as any];

    it('should get tickets and return data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: tickets, status: 200 });
      const result = await ticketsApi.getMyTickets();
      expect(mockedAxios.get).toHaveBeenCalledWith('/tickets');
      expect(result).toEqual(tickets);
    });

    it('should throw error on failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 500, data: 'err', headers: {} } });
      await expect(ticketsApi.getMyTickets()).rejects.toBeDefined();
    });
  });

  describe('getMyHistoricTickets', () => {
    const tickets: Ticket[] = [{ id: '2' } as any];

    it('should get historic tickets', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: tickets });
      const result = await ticketsApi.getMyHistoricTickets();
      expect(mockedAxios.get).toHaveBeenCalledWith('/tickets/historic');
      expect(result).toEqual(tickets);
    });

    it('should throw error on failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { data: 'err' }, message: 'fail' });
      await expect(ticketsApi.getMyHistoricTickets()).rejects.toBeDefined();
    });
  });

  describe('getTicketById', () => {
    const ticket: Ticket = { id: '3' } as any;

    it('should get ticket by id', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: ticket });
      const result = await ticketsApi.getTicketById('3');
      expect(mockedAxios.get).toHaveBeenCalledWith('/tickets/3');
      expect(result).toEqual(ticket);
    });

    it('should throw error on failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { data: 'err' }, message: 'fail' });
      await expect(ticketsApi.getTicketById('3')).rejects.toBeDefined();
    });
  });

  describe('createTicket', () => {
    const input: TicketInput = { userId: 'u', presentationId: 'p' } as any;
    const ticket = { id: '4' };

    it('should create ticket', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: ticket });
      const result = await ticketsApi.createTicket(input);
      expect(mockedAxios.post).toHaveBeenCalledWith('/tickets/admin', input);
      expect(result).toEqual(ticket);
    });

    it('should throw error with specific message', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'bad' } },
        message: 'fail'
      });
      await expect(ticketsApi.createTicket(input)).rejects.toThrow('bad');
    });

    it('should throw error with fallback message', async () => {
      mockedAxios.post.mockRejectedValueOnce({ message: 'fail' });
      await expect(ticketsApi.createTicket(input)).rejects.toThrow('fail');
    });
  });

  describe('getUsers', () => {
    const users: UserOption[] = [{ id: 'u1', name: 'User' } as any];

    it('should get users', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: users });
      const result = await ticketsApi.getUsers();
      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/users');
      expect(result).toEqual(users);
    });
  });

  describe('getPresentations', () => {
    const presentations: PresentationOption[] = [{ id: 'p1', name: 'Pres' } as any];

    it('should get presentations', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: presentations });
      const result = await ticketsApi.getPresentations();
      expect(mockedAxios.get).toHaveBeenCalledWith('/presentation');
      expect(result).toEqual(presentations);
    });
  });
});

// We recommend installing an extension to run jest tests.