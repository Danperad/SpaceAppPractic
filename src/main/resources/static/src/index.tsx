import React from 'react';
import ReactDOM from 'react-dom/client';
import GeoMap from './GeoMap'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GeoMap />
  </React.StrictMode>
);

