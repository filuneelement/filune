# Filune

A React application built with Vite and TypeScript.

## Getting started

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Japanese municipality data

`src/data/japanMunicipalities.json` contains prefecture and municipality representative coordinates derived from [Geolonia japanese-addresses-v2](https://github.com/geolonia/japanese-addresses-v2). The data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and is based on the Japan Digital Agency Address Base Registry.

## Korean region and municipality data

`src/data/koreaLocations.json` contains Korean region and municipality representative coordinates derived from the South Korea extract published by [GeoNames](https://www.geonames.org/export/). GeoNames data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source names are retained as aliases, and Hangul alternate names are used for Korean display names where available.
