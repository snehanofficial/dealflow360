import { api } from './client.js';
import { DashboardResponseDto } from '@dealflow360/contracts';

export async function fetchDashboardData(): Promise<DashboardResponseDto> {
  const response = await api.get<{ success: boolean; data: DashboardResponseDto }>('/dashboard');
  return response.data.data;
}
