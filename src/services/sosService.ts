import { Axios } from '@/services/axios';
import type {
  TriggerSosPayload,
  SosAlert,
  PagedResult,
} from '@/interfaces/sos';

export type { TriggerSosPayload, SosAlert, PagedResult };

export const sosService = {
  triggerSos: async (payload: TriggerSosPayload): Promise<SosAlert> => {
    const res = await Axios.post('/Sos/trigger', payload);
    return res.data.result;
  },

  getActiveAlerts: async (): Promise<SosAlert[]> => {
    const res = await Axios.get('/Sos/active');
    return res.data.result || [];
  },

  getPagedAlerts: async (
    page = 1,
    pageSize = 10,
    status?: string,
  ): Promise<PagedResult<SosAlert>> => {
    const res = await Axios.get('/Sos/all', {
      params: {
        page,
        pageSize,
        status: status && status !== 'ALL' ? status : undefined,
      },
    });
    return (
      res.data.result || {
        items: [],
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      }
    );
  },

  resolveSos: async (id: string, note?: string): Promise<SosAlert> => {
    const res = await Axios.put(`/Sos/${id}/resolve`, { note });
    return res.data.result;
  },

  deleteSos: async (id: string): Promise<void> => {
    await Axios.delete(`/Sos/${id}`);
  },
};
