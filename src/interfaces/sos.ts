export interface SosButtonProps {
  boatId?: string;
  className?: string;
}

export interface TriggerSosPayload {
  boat_id?: string;
  latitude: number;
  longitude: number;
  note?: string;
}

export interface SosAlert {
  id: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  boat_id?: string;
  boat_name?: string;
  registration_number?: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  note?: string;
  created_at: string;
  resolved_at?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
