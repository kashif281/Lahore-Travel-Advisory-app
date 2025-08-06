export type RootStackParamList = {
  Home: undefined;
  JourneyPlanner: undefined;
  NearbyStops: undefined;
  RouteExplorer: undefined;
  MapView: undefined;
  Timings: undefined;
  FareCalculator: undefined;
  Settings: undefined;
  Favorites: undefined;
};

export type TransportMode = 'speedo' | 'metrobus' | 'orange-line';

export type Station = {
  name: string;
  lat: number;
  lng: number;
  modes: TransportMode[];
};

export type Route = {
  mode: TransportMode;
  routeId: string;
  name: string;
  stops: Station[];
  firstService: string;
  lastService: string;
  frequencyMin: number;
  fare: number;
};

export type JourneyStep = {
  mode: TransportMode | 'walk';
  from: Station;
  to: Station;
  route?: Route;
  duration: number;
  fare: number;
  distance?: number;
};

export type Journey = {
  steps: JourneyStep[];
  totalDuration: number;
  totalFare: number;
  totalDistance: number;
};