import React, { useRef, useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Libraries, Marker } from "@react-google-maps/api";
import { MapIcon, Navigation } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

// Define map libraries as constant
const MAP_LIBRARIES: Libraries = ['places', 'geometry', 'marker'] as const;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    }
  }
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '20px',
  overflow: 'hidden',
};

const center = {
  lat: 22.3193, // Hong Kong latitude
  lng: 114.1694, // Hong Kong longitude
};



interface MapProps {
  showDrivers?: boolean;
  pickupLocation?: google.maps.LatLngLiteral | null;
  dropoffLocation?: google.maps.LatLngLiteral | null;
  onPickupSelect?: (location: google.maps.LatLngLiteral) => void;
  onDropoffSelect?: (location: google.maps.LatLngLiteral) => void;
  mapRef?: React.MutableRefObject<google.maps.Map>;
  routePath?: string;
  setRoutePath?: (path: string) => void;
  routeDistance?: string;
  setRouteDistance?: (distance: string) => void;
  routeDuration?: string;
  setRouteDuration?: (duration: string) => void;
  routeSteps?: any[];
  setRouteSteps?: (steps: any[]) => void;
}

const Map = ({ 
  pickupLocation = null, 
  dropoffLocation = null,
  routePath = null,
  setRoutePath,
  routeDistance = null,
  setRouteDistance,
  routeDuration = null,
  setRouteDuration,
  routeSteps = null,
  setRouteSteps,
}: MapProps) => {
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 清理資源
  useEffect(() => {
    return () => {
      console.log('Cleaning up map resources...');
      // 清理 marker
      markersRef.current.forEach(marker => {
        try {
          if (marker.getMap()) {
            marker.setMap(null);
          }
        } catch (error) {
          console.error('Error cleaning marker:', error);
        }
      });
      markersRef.current = [];

      // 清理 polyline
      if (polylineRef.current) {
        try {
          if (polylineRef.current.getMap()) {
            polylineRef.current.setMap(null);
          }
        } catch (error) {
          console.error('Error cleaning polyline:', error);
        }
        polylineRef.current = null;
      }

      // 清理 map
      if (mapRef.current) {
        try {
          // 移除所有事件監聽器
          if (window.google?.maps?.event) {
            window.google.maps.event.clearInstanceListeners(mapRef.current);
          }
          // 移除地圖實例
          mapRef.current = null;
        } catch (error) {
          console.error('Error cleaning map:', error);
        }
      }

      // 重置狀態
      setMapLoaded(false);
    };
  }, []);

  // 處理地圖加載
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      console.log('Map loaded, creating markers...');
      
      // 清理現有標記和路徑
      markersRef.current.forEach(marker => {
        try {
          if (marker.getMap()) {
            marker.setMap(null);
          }
        } catch (error) {
          console.error('Error cleaning marker:', error);
        }
      });
      markersRef.current = [];

      if (polylineRef.current) {
        try {
          if (polylineRef.current.getMap()) {
            polylineRef.current.setMap(null);
          }
        } catch (error) {
          console.error('Error cleaning polyline:', error);
        }
        polylineRef.current = null;
      }

      // 創建新的標記和路徑
      try {
        if (pickupLocation?.lat && pickupLocation?.lng) {
          const pickupMarker = new google.maps.Marker({
            position: pickupLocation,
            map: mapRef.current,
            label: {
              text: 'P', 
              color: '#000',
              fontSize: '16px'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#00C851',
              fillOpacity: 0.8,
              scale: 10,
              strokeColor: '#000',
              strokeWeight: 1
            }
          });
          pickupMarker.set('type', 'pickup');
          markersRef.current.push(pickupMarker);
        }

        if (dropoffLocation?.lat && dropoffLocation?.lng) {
          const dropoffMarker = new google.maps.Marker({
            position: dropoffLocation,
            map: mapRef.current,
            label: {
              text: 'D', 
              color: '#000',
              fontSize: '16px'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#FF4081',
              fillOpacity: 0.8,
              scale: 10,
              strokeColor: '#000',
              strokeWeight: 1
            }
          });
          dropoffMarker.set('type', 'dropoff');
          markersRef.current.push(dropoffMarker);
        }

        if (routePath) {
          const path = google.maps.geometry.encoding.decodePath(routePath);
          const polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7,
            strokeWeight: 4
          });

          polyline.setMap(mapRef.current);
          polylineRef.current = polyline;

          const bounds = new google.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          mapRef.current.fitBounds(bounds);
        }
      } catch (error) {
        console.error('Error creating map elements:', error);
      }
    }
  }, [mapLoaded, pickupLocation, dropoffLocation, routePath]);

  // // Create marker icon configuration
  // const createMarkerIcon = (color: string, label: string, map: google.maps.Map) => ({
  //   path: google.maps.SymbolPath.CIRCLE,
  //   fillColor: color,
  //   fillOpacity: 1,
  //   scale: 7,
  //   strokeColor: color,
  //   strokeWeight: 1,
  //   label: {
  //     text: label,
  //     color: '#fff'
  //   }
  // });

  // Handle map load
  const handleMapLoad = (map: google.maps.Map) => {
    console.log('Map instance loaded');
    
    // 確保地圖對象存在
    if (!map) {
      console.error('Map instance is null');
      return;
    }

    // 設置地圖引用
    mapRef.current = map;
    setMapLoaded(true);
  };

  // Update markers when pickup location changes
  useEffect(() => {
    
    if (mapRef.current) {
      // Remove existing pickup marker
      const pickupMarker = markersRef.current.find(marker => marker.get('type') === 'pickup');
      if (pickupMarker) {
        pickupMarker.setMap(null);
        markersRef.current = markersRef.current.filter(marker => marker.get('type') !== 'pickup');
      }

      // Add new pickup marker if location exists
      if (pickupLocation.lat && pickupLocation.lng) {
        const newPickupMarker = new google.maps.Marker({
          position: pickupLocation,
          map: mapRef.current,
          label: {
            text: 'P', 
            color: '#000',
            fontSize: '16px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#00C851',
            fillOpacity: 0.8,
            scale: 10,
            strokeColor: '#000',
            strokeWeight: 1
          }
        });
        newPickupMarker.set('type', 'pickup'); // 添加標籤來區分marker類型
        markersRef.current.push(newPickupMarker);
      }
    }
  }, [pickupLocation]);

  // Update markers when dropoff location changes
  useEffect(() => {
    if (mapRef.current) {
      // Remove existing dropoff marker
      const dropoffMarker = markersRef.current.find(marker => marker.get('type') === 'dropoff');
      if (dropoffMarker) {
        dropoffMarker.setMap(null);
        markersRef.current = markersRef.current.filter(marker => marker.get('type') !== 'dropoff');
      }
      
    
      // Add new dropoff marker if location exists
      if (dropoffLocation?.lat && dropoffLocation?.lng) {
        const newDropoffMarker = new google.maps.Marker({
          position: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
          map: mapRef.current,
          label: 'D',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          }
        });
        newDropoffMarker.set('type', 'dropoff'); // 添加標籤來區分marker類型
        markersRef.current.push(newDropoffMarker);
      }
    }

    // Cleanup when component unmounts

  }, [dropoffLocation]);

 

  // Update markers when dropoff location changes
  useEffect(() => {
    if (mapRef.current) {
      // Remove existing dropoff marker
      const dropoffMarker = markersRef.current.find(marker => marker.get('type') === 'dropoff');
      if (dropoffMarker) {
        dropoffMarker.setMap(null);
        markersRef.current = markersRef.current.filter(marker => marker.get('type') !== 'dropoff');
      }

      // Add new dropoff marker if location exists
      if (dropoffLocation.lat && dropoffLocation.lng) {
        const newDropoffMarker = new google.maps.Marker({
          position: dropoffLocation,
          map: mapRef.current,
          label: {
            text: 'D',
            color: '#000',
            fontSize: '16px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF4081',
            fillOpacity: 0.8,
            scale: 10,
            strokeColor: '#000',
            strokeWeight: 1
          }
        });
        newDropoffMarker.set('type', 'dropoff'); // 添加標籤來區分marker類型
        markersRef.current.push(newDropoffMarker);
      }
    }
  }, [dropoffLocation]);

 

  // 繪製路線
  useEffect(() => {
    // 移除舊的路線
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    if (mapRef.current && routePath) {
      

      // 解碼路徑
      const path = google.maps.geometry.encoding.decodePath(routePath);
      
      // 創建新的路線
      const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.7,
        strokeWeight: 4
      });

      polyline.setMap(mapRef.current);
      polylineRef.current = polyline;

      // 設置地圖視野以包含整個路線
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      mapRef.current.fitBounds(bounds);
    }
  }, [routePath]);

  

  return (
    <>
      <div className="relative w-full h-full min-h-[300px] rounded-[20px] overflow-hidden">
        <LoadScript
          id="google-maps-script"
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={MAP_LIBRARIES}
          version="weekly"
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            options={{
              mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
            }}
            onLoad={handleMapLoad}
          >
            {/* Markers will be created in handleMapLoad */}
          </GoogleMap>
        </LoadScript>
        {pickupLocation && (
          <div 
            className="absolute"
            style={{
              left: `${(pickupLocation.lng + 180) / 360 * 100}%`,
              top: `${(1 - (pickupLocation.lat + 90) / 180) * 100}%`
            }}
          >
           
          </div>
        )}
        
      </div>
    {/* <div className="absolute bottom-4 right-4 glass-card px-3 py-2 text-xs flex items-center space-x-2 font-kawaii">
      <Navigation size={14} className="text-kawaii-pink" />
      <span>Hong Kong Service Only</span>
    </div> */}
    </>
  );
};

export default Map;
