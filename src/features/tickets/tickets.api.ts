import axiosClient from '@/shared/lib/axiosClient';
import { BuyTicketDto, Ticket, TicketInput, UserOption, PresentationOption  } from '@/shared/types/ticket';


const prefix = '/tickets';

function getAuthToken(): string | null {
  // Opción 1: Si usas localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
  }
  
  // Opción 2: Si usas cookies, podrías usar js-cookie
  // return Cookies.get('token');
  
  return null;
}

// Función helper para crear headers con autenticación
function createAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

interface BuyTicketsResponse {
  url: string;
  checkoutSession: string;
  tickets: { id: string }[];
}
/**
 * Compra de tickets con Stripe Checkout - Server Action
 */
export async function buyTickets(ticket: BuyTicketDto): Promise<BuyTicketsResponse> {
  console.log('🎫 Comprando tickets:', ticket);
  console.log('🌐 URL del API:', `${prefix}/buy`);
  
  try {
    const res = await axiosClient.post(`${prefix}/buy`, ticket);
    console.log('✅ Respuesta exitosa:', res.data.url);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error en buyTickets:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    throw error;
  }
}
/**
 * Obtener tickets del usuario autenticado (activos) - Server Action
 */
// tickets.api.ts - versión con debug completo
export async function getMyTickets(): Promise<Ticket[]> {
  try {
    console.log('🔍 === DEBUG getMyTickets ===')
    console.log('📍 URL:', `${prefix}`) // Deberías ver algo como '/api/tickets'
    
    // Verificar headers de autenticación
    console.log('🔐 Auth headers:', axiosClient.defaults.headers.common)
    
    const res = await axiosClient.get(`${prefix}`);
    
    console.log('✅ Response status:', res.status)
    console.log('📋 Raw response:', res.data)
    console.log('📊 Tickets count:', res.data?.length || 0)
    
    // Si es array, mostrar detalles de cada ticket
    if (Array.isArray(res.data)) {
      res.data.forEach((ticket: any, index: number) => {
        console.log(`🎫 Ticket ${index + 1}:`, {
          id: ticket.id,
          userId: ticket.userId,
          presentationId: ticket.presentationId,
          status: ticket.status,
          createdAt: ticket.createdAt
        })
      })
    }
    
    console.log('=== END DEBUG ===')
    return res.data;
  } catch (error: any) {
    console.error('❌ === ERROR DEBUG ===')
    console.error('Status:', error.response?.status)
    console.error('Data:', error.response?.data)
    console.error('Headers:', error.response?.headers)
    console.error('=== END ERROR DEBUG ===')
    throw error;
  }
}

/**
 * Obtener tickets históricos del usuario - Server Action
 */
export async function getMyHistoricTickets(): Promise<Ticket[]> {
  try {
    const res = await axiosClient.get('/tickets/historic');
    return res.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo tickets históricos:', error.response?.data || error.message);
    throw error;
  }
}


/**
 * Obtener un ticket específico por ID - Server Action
 */
export async function getTicketById(id: string): Promise<Ticket> {
  try {
    const res = await axiosClient.get(`${prefix}/${id}`);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo ticket por ID:', error.response?.data || error.message);
    throw error;
  }
}


export async function createTicket(data: TicketInput) {
  try {
    const res = await axiosClient.post(`${prefix}/admin`, data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creando ticket:', error.response?.data || error.message);
    
    // Extraer mensaje de error más específico
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Error al crear el ticket';
    
    throw new Error(errorMessage);
  }
}

export async function getUsers(): Promise<UserOption[]> {
  const res = await axiosClient.get('/auth/users') // ✅ Usa axiosClient con token
  return res.data
}

export async function getPresentations(): Promise<PresentationOption[]> {
  const res = await axiosClient.get('/presentation') // ✅ Usa axiosClient con token
  return res.data
}