import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../../lib/api/dashboardApi.js';
import { DashboardResponseDto } from '@dealflow360/contracts';

export function useDashboard() {
  return useQuery<DashboardResponseDto, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}
