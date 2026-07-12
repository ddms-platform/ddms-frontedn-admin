import { Axios } from '@/services/axios';

export interface CheckInBookingResponse {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  tourName: string;
  boatName: string;
  numPeople: number;
  departureTime: string;
  status: string;
  checkedInAt: string;
}

interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

export const checkInService = {
  checkIn: async (bookingCode: string): Promise<CheckInBookingResponse> => {
    try {
      const res = await Axios.put<ApiResponse<CheckInBookingResponse>>(
        '/public/tours/bookings/check-in',
        { bookingCode },
      );

      if (res.status !== 200 || res.data?.code !== 1000) {
        throw new Error(res.data?.message ?? 'Check-in thất bại');
      }

      return res.data.result;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        throw new Error(
          axiosErr.response?.data?.message ?? 'Không thể kết nối API check-in',
          { cause: err },
        );
      }
      throw err instanceof Error
        ? err
        : new Error('Check-in thất bại', { cause: err });
    }
  },
};
