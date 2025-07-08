import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';

const MAP_LIBRARIES = ['places', 'geometry', 'marker'] as const;

declare global {
  interface Window {
    initMap?: () => void;
  }
}

interface GoogleMapsContextType {
  isMapsLoaded: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return;
    }

    console.log('Loading Google Maps script with key:', apiKey);

    // Create callback function first
    window.initMap = () => {
      console.log('Google Maps initialized');
      setIsMapsLoaded(true);
    };

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${MAP_LIBRARIES.join(',')}&callback=initMap`;
    script.async = true;
    
    // Add error handling
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      console.error('Script URL:', script.src);
      setIsMapsLoaded(false);
    };

    // Add load event handler
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.initMap;

      // Cleanup global Google Maps objects
      try {
        if (window.google?.maps?.places) {
          window.google.maps.places = null;
        }
        if (window.google?.maps) {
          window.google.maps = null;
        }
        if (window.google) {
          window.google = null;
        }
      } catch (error) {
        console.error('Error cleaning up Google Maps:', error);
      }
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup when component unmounts
    return () => {
      // Cleanup
      // Remove script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      // Cleanup callback
      delete window.initMap;

      // Cleanup global Google Maps objects
      if (window.google) {
        try {
          window.google.maps = null;
          window.google = null;
        } catch (error) {
          console.error('Error cleaning Google Maps:', error);
        }
      }
    };
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isMapsLoaded }}>
      {isMapsLoaded ? (
        children
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </GoogleMapsContext.Provider>
  );
};
