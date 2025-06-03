import axiosClient from '../../../shared/lib/axiosClient';
import {

// src/features/presentation/presentations.api.test.ts
  createPresentation,
  getPresentations,
  updatePresentation,
  getPresentationById,
} from '../presentations.api';

jest.mock('../../../shared/lib/axiosClient');

const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('presentations.api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPresentation', () => {
    it('should POST to /presentation and return data', async () => {
      const dto = { title: 'Test', date: '2024-01-01' };
      const mockData = { id: '1', ...dto };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await createPresentation(dto as any);

      expect(mockedAxios.post).toHaveBeenCalledWith('/presentation', dto);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPresentations', () => {
    it('should GET /presentation and return data', async () => {
      const mockData = [{ id: '1', title: 'A' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await getPresentations();

      expect(mockedAxios.get).toHaveBeenCalledWith('/presentation');
      expect(result).toEqual(mockData);
    });
  });

  describe('updatePresentation', () => {
    it('should PUT to /presentation/:id and return data', async () => {
      const id = '123';
      const data = { title: 'Updated' };
      const mockData = { id, ...data };
      mockedAxios.put.mockResolvedValueOnce({ data: mockData });

      const result = await updatePresentation(id, data as any);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/presentation/${id}`, data);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPresentationById', () => {
    it('should GET /presentation/manager/:id and return data', async () => {
      const id = 'abc';
      const mockData = { id, title: 'Test' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await getPresentationById(id);

      expect(mockedAxios.get).toHaveBeenCalledWith(`/presentation/manager/${id}`);
      expect(result).toEqual(mockData);
    });
  });
});