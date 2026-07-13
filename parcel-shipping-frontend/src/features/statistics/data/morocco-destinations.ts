export type DestinationCoordinates = {
  latitude: number;
  longitude: number;
};

export const destinationCoordinates: Readonly<
  Record<string, DestinationCoordinates>
> = {
  Casablanca: {
    latitude: 33.5731,
    longitude: -7.5898,
  },
  Rabat: {
    latitude: 34.0209,
    longitude: -6.8416,
  },
  Marrakech: {
    latitude: 31.6295,
    longitude: -7.9811,
  },
  Tangier: {
    latitude: 35.7595,
    longitude: -5.834,
  },
  Agadir: {
    latitude: 30.4278,
    longitude: -9.5981,
  },
  Fes: {
    latitude: 34.0331,
    longitude: -4.9998,
  },
  Oujda: {
    latitude: 34.6814,
    longitude: -1.9114,
  },
};
