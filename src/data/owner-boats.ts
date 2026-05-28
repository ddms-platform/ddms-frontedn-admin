// ── Types matching database schema ──

export type BoatStatus = 'idle' | 'running';

export interface BoatCabin {
  id: string;
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

export interface BoatService {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface BoatImage {
  id: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
}

export interface BoatMaintenance {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface OwnerBoat {
  id: string;
  name: string;
  type: string;
  maxPassengers: number;
  status: BoatStatus;
  createdAt: string;
  updatedAt: string;
  cabins: BoatCabin[];
  services: BoatService[];
  images: BoatImage[];
  maintenances: BoatMaintenance[];
  // Computed / aggregated
  totalCabins: number;
  totalServices: number;
  activeTours: number;
  totalBookings: number;
  revenue: number;
}

// ── Boat Types ──
export const BOAT_TYPES = [
  { value: 'cruise', label: 'Du thuyền' },
  { value: 'standard', label: 'Thuyền tiêu chuẩn' },
  { value: 'luxury', label: 'Cao cấp' },
  { value: 'party', label: 'Thuyền tiệc' },
  { value: 'speedboat', label: 'Ca nô cao tốc' },
] as const;

// ── Mock Data ──
export const MOCK_OWNER_BOATS: OwnerBoat[] = [
  {
    id: 'boat-1',
    name: 'Rồng Vàng',
    type: 'cruise',
    maxPassengers: 40,
    status: 'running',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2025-05-10T14:30:00Z',
    cabins: [
      {
        id: 'c1',
        name: 'VIP Suite',
        capacity: 4,
        price: 2500000,
        totalRooms: 2,
        description: 'Phòng VIP view sông Hàn',
      },
      {
        id: 'c2',
        name: 'Deluxe Double',
        capacity: 2,
        price: 1500000,
        totalRooms: 5,
        description: 'Phòng đôi tiện nghi',
      },
      {
        id: 'c3',
        name: 'Standard Twin',
        capacity: 2,
        price: 900000,
        totalRooms: 8,
      },
    ],
    services: [
      {
        id: 's1',
        name: 'Buffet Hải sản',
        price: 450000,
        description: 'Thực đơn hải sản tươi sống',
        isActive: true,
      },
      {
        id: 's2',
        name: 'Nước uống miễn phí',
        price: 0,
        description: 'Nước suối, trà',
        isActive: true,
      },
      { id: 's3', name: 'DJ & Âm nhạc', price: 200000, isActive: true },
      {
        id: 's4',
        name: 'Nhiếp ảnh gia',
        price: 350000,
        description: 'Chụp ảnh chuyên nghiệp',
        isActive: false,
      },
    ],
    images: [
      {
        id: 'i1',
        imageUrl:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
        caption: 'Tổng quan',
        sortOrder: 0,
      },
      {
        id: 'i2',
        imageUrl:
          'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=600&h=400&fit=crop',
        caption: 'Khu VIP',
        sortOrder: 1,
      },
      {
        id: 'i3',
        imageUrl:
          'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=600&h=400&fit=crop',
        caption: 'Sân thượng',
        sortOrder: 2,
      },
    ],
    maintenances: [
      {
        id: 'm1',
        startTime: '2025-03-01T00:00:00Z',
        endTime: '2025-03-05T00:00:00Z',
        reason: 'Bảo trì định kỳ động cơ',
      },
    ],
    totalCabins: 15,
    totalServices: 4,
    activeTours: 3,
    totalBookings: 128,
    revenue: 245000000,
  },
  {
    id: 'boat-2',
    name: 'Sông Hàn 01',
    type: 'standard',
    maxPassengers: 30,
    status: 'idle',
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2025-05-12T10:00:00Z',
    cabins: [
      {
        id: 'c4',
        name: 'Cabin Đôi',
        capacity: 2,
        price: 800000,
        totalRooms: 6,
      },
      {
        id: 'c5',
        name: 'Cabin Gia đình',
        capacity: 4,
        price: 1200000,
        totalRooms: 3,
        description: 'Phù hợp gia đình nhỏ',
      },
    ],
    services: [
      { id: 's5', name: 'Đồ ăn nhẹ', price: 150000, isActive: true },
      {
        id: 's6',
        name: 'Áo phao trẻ em',
        price: 0,
        description: 'Miễn phí cho trẻ dưới 12 tuổi',
        isActive: true,
      },
    ],
    images: [
      {
        id: 'i4',
        imageUrl:
          'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600&h=400&fit=crop',
        caption: 'Bên ngoài',
        sortOrder: 0,
      },
      {
        id: 'i5',
        imageUrl:
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop',
        caption: 'Cabin',
        sortOrder: 1,
      },
    ],
    maintenances: [],
    totalCabins: 9,
    totalServices: 2,
    activeTours: 2,
    totalBookings: 87,
    revenue: 156000000,
  },
  {
    id: 'boat-3',
    name: 'Phượng Hoàng',
    type: 'luxury',
    maxPassengers: 20,
    status: 'idle',
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2025-04-28T09:00:00Z',
    cabins: [
      {
        id: 'c6',
        name: 'Royal Suite',
        capacity: 2,
        price: 5000000,
        totalRooms: 2,
        description: 'Phòng hoàng gia với bồn tắm',
      },
      { id: 'c7', name: 'Premium', capacity: 2, price: 3000000, totalRooms: 4 },
    ],
    services: [
      {
        id: 's7',
        name: 'Fine Dining',
        price: 1200000,
        description: 'Set menu 5 món Pháp',
        isActive: true,
      },
      { id: 's8', name: 'Rượu vang', price: 800000, isActive: true },
      { id: 's9', name: 'Spa trên thuyền', price: 600000, isActive: false },
    ],
    images: [
      {
        id: 'i6',
        imageUrl:
          'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&h=400&fit=crop',
        caption: 'Tổng quan',
        sortOrder: 0,
      },
    ],
    maintenances: [
      {
        id: 'm2',
        startTime: '2025-04-20T00:00:00Z',
        endTime: '2025-05-20T00:00:00Z',
        reason: 'Nâng cấp nội thất',
      },
    ],
    totalCabins: 6,
    totalServices: 3,
    activeTours: 0,
    totalBookings: 42,
    revenue: 189000000,
  },
  {
    id: 'boat-4',
    name: 'Bạch Đằng Star',
    type: 'party',
    maxPassengers: 50,
    status: 'running',
    createdAt: '2023-11-10T08:00:00Z',
    updatedAt: '2025-05-14T16:00:00Z',
    cabins: [],
    services: [
      { id: 's10', name: 'DJ Set', price: 500000, isActive: true },
      { id: 's11', name: 'LED Show', price: 300000, isActive: true },
      {
        id: 's12',
        name: 'Cocktail Bar',
        price: 250000,
        description: 'Quầy bar cocktail',
        isActive: true,
      },
    ],
    images: [
      {
        id: 'i7',
        imageUrl:
          'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=600&h=400&fit=crop',
        caption: 'Party deck',
        sortOrder: 0,
      },
      {
        id: 'i8',
        imageUrl:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
        caption: 'Sân khấu',
        sortOrder: 1,
      },
    ],
    maintenances: [],
    totalCabins: 0,
    totalServices: 3,
    activeTours: 2,
    totalBookings: 95,
    revenue: 320000000,
  },
  {
    id: 'boat-5',
    name: 'Hải Âu',
    type: 'speedboat',
    maxPassengers: 12,
    status: 'idle',
    createdAt: '2024-09-05T08:00:00Z',
    updatedAt: '2025-05-13T11:00:00Z',
    cabins: [],
    services: [
      { id: 's13', name: 'Áo phao chuyên dụng', price: 0, isActive: true },
    ],
    images: [
      {
        id: 'i9',
        imageUrl:
          'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&h=400&fit=crop',
        caption: 'Ca nô',
        sortOrder: 0,
      },
    ],
    maintenances: [],
    totalCabins: 0,
    totalServices: 1,
    activeTours: 1,
    totalBookings: 63,
    revenue: 78000000,
  },
  {
    id: 'boat-6',
    name: 'Cá Chép Đỏ',
    type: 'standard',
    maxPassengers: 25,
    status: 'idle',
    createdAt: '2023-07-20T08:00:00Z',
    updatedAt: '2025-05-01T08:00:00Z',
    cabins: [
      {
        id: 'c8',
        name: 'Cabin Đơn',
        capacity: 1,
        price: 500000,
        totalRooms: 4,
      },
      {
        id: 'c9',
        name: 'Cabin Đôi',
        capacity: 2,
        price: 750000,
        totalRooms: 5,
      },
    ],
    services: [
      { id: 's14', name: 'Nước giải khát', price: 50000, isActive: true },
      { id: 's15', name: 'Hướng dẫn viên', price: 200000, isActive: true },
    ],
    images: [
      {
        id: 'i10',
        imageUrl:
          'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=600&h=400&fit=crop',
        sortOrder: 0,
      },
    ],
    maintenances: [
      {
        id: 'm3',
        startTime: '2025-05-01T00:00:00Z',
        endTime: '2025-05-10T00:00:00Z',
        reason: 'Bảo trì định kỳ',
      },
    ],
    totalCabins: 9,
    totalServices: 2,
    activeTours: 1,
    totalBookings: 156,
    revenue: 112000000,
  },
];
