import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const center = {
    lat: -3.745,
    lng: -73.589
};

const MyMapComponent = () => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);
    const mapRef = useRef(null);

    const handleMapLoad = (map) => {
        setMapLoaded(true);
        mapRef.current = map;
        console.log("Map Loaded:", map);
    };

    useEffect(() => {
        return () => {
            if (mapLoaded) {
                // 清理 markers
                markersRef.current.forEach(marker => {
                    marker.setMap(null);
                });
                markersRef.current = [];

                // 清理 polyline
                if (polylineRef.current) {
                    polylineRef.current.setMap(null);
                    polylineRef.current = null;
                }

                // 清理 map
                if (mapRef.current) {
                    window.google.maps.event.clearInstanceListeners(mapRef.current);
                    mapRef.current = null;
                }
            }
        };
    }, [mapLoaded]);

    return (
        <LoadScript
            id="google-maps-script"
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={['geometry', 'places']}
            version="weekly"
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={handleMapLoad}
            />
        </LoadScript>
    );
};

export default MyMapComponent;