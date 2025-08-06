import { TransportMode } from './navigation';

export interface FavoriteRoute {
  id: string;
  title: string;
  startLocation: string;
  endLocation: string;
  mode: TransportMode;
  lastUsed: string;
  stops: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
}

export interface RouteData {
  id: string;
  name: string;
  mode: TransportMode;
  stops: Array<{
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  schedule: {
    weekday: {
      firstService: string;
      lastService: string;
      frequency: number;
    };
    weekend: {
      firstService: string;
      lastService: string;
      frequency: number;
    };
  };
  fare: {
    base: number;
    perKm: number;
  };
}