export interface Region {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdUserId: number | null;
  updatedUserId: number | null;
  productRegions?: any[]; // Optional field that appears in single region response
}

export interface RegionResponse {
  success: boolean;
  data: Region[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface SingleRegionResponse {
  success: boolean;
  data: Region;
  message?: { en: string; ar: string };
}

export interface RegionFilters {
  offset?: number;
  limit?: number;
  isActive?: boolean;
}
