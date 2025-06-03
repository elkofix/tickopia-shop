import axios from 'axios'
import { CreatePresentationDto, Presentation,UpdatePresentationDto } from '@/shared/types/presentation'
import axiosClient from '@/shared/lib/axiosClient';

const prefix = '/presentation'

export async function createPresentation(dto: CreatePresentationDto) {
  const res = await axiosClient.post(`${prefix}`, dto);
  return res.data;
}

export async function getPresentations(): Promise<Presentation[]> {
  const res = await axiosClient.get('/presentation')
  return res.data
}

export async function updatePresentation(id: string, data: UpdatePresentationDto): Promise<Presentation> {
  const res = await axiosClient.put(`${prefix}/${id}`, data);
  return res.data;
}

export async function getPresentationById(id: string): Promise<Presentation> {
  const res = await axiosClient.get(`${prefix}/manager/${id}`);
  return res.data;
}