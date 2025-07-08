export interface Location {
  display_name: string;
  lat: number;
  lng: number;
}

// Add a type guard for Location
export function isLocation(obj: any): obj is Location {
  return obj && typeof obj === 'object' && 
         'display_name' in obj &&
         typeof obj.lat === 'number' &&
         typeof obj.lng === 'number';
}
