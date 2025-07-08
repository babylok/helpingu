import React, { useState, useEffect, useRef } from "react";
import baseUrl from "@/contexts/BaseUrl";
import Navbar from "@/components/Navbar";
import Map from "@/components/Map";
import RideBooking from "@/components/RideBooking";
import RideStatus from "@/components/RideStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, User, Star, History, MapPin, Car, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import axios from "axios";
import RideHistory from "@/components/RideHistory";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

declare global {
  interface Window {
    google: any;
  }
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

const PassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [rideState, setRideState] = useState<"booking" | "ongoing" | "none">("none");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupLocation, setPickupLocation] = useState<LatLngLiteral | null>({ lat: undefined, lng: undefined });
  const [dropoffLocation, setDropoffLocation] = useState<LatLngLiteral | null>({ lat: undefined, lng: undefined });
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [lastInputTime, setLastInputTime] = useState(0);
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);
  const [bookstatus, setBookstatus] = useState("none");
  const [routePath, setRoutePath] = useState<string | null>(null);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [selectedVehicleData, setSelectedVehicleData] = useState<any>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  // State declarations
  const [price, setPrice] = useState<number>(0);
  const [selectedTunnels, setSelectedTunnels] = useState<any[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<any[]>([]);

  // Refs
  const mapRef = useRef<google.maps.Map>(null);

  // Hooks
  const isMobile = useIsMobile();

  // 初始化車輛選項
  // useEffect(() => {
  //   const fetchVehicleOptions = async () => {
  //     try {
  //       const response = await axios.get(`${baseUrl}/api/vehicle-options`);
  //       setVehicleOptions(response.data);
  //     } catch (error) {
  //       console.error('Error fetching vehicle options:', error);
  //       toast.error('Failed to load vehicle options');
  //     }
  //   };
  //   fetchVehicleOptions();
  // }, []);

  // Save selected tunnels to localStorage when changed
  // useEffect(() => {
  //   localStorage.setItem('selectedTunnels', JSON.stringify(selectedTunnels));
  // }, [selectedTunnels]);


  // 清理地圖資源
  useEffect(() => {
    return () => {
      // 清理地圖實例
      if (mapRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }

      // 清理全局對象
      if (window.google?.maps) {
        // 清理 Places API
        try {
          if (window.google.maps.places) {
            // 直接設置為 null，避免創建新的 PlacesService 實例
            window.google.maps.places = null;
          }
        } catch (error) {
          console.error('Error cleaning up Places API:', error);
        }
        // 清理其他 Google Maps 對象
        window.google.maps = null;
      }
    };
  }, []);

  useEffect(() => {
    const storedTrip = localStorage.getItem('currentTrip');
    console.log('storedTrip',storedTrip);
    if (storedTrip) {
      setCurrentTripId(JSON.parse(storedTrip).id || JSON.parse(storedTrip)._id);
      setRideState("booking");
      setDestination(JSON.parse(storedTrip).dropoffLocation.address);
      setPickup(JSON.parse(storedTrip).pickupLocation.address);
      setDropoffLocation({ lat: JSON.parse(storedTrip).dropoffLocation.coordinates[1], lng: JSON.parse(storedTrip).dropoffLocation.coordinates[0] });
      setPickupLocation({ lat: JSON.parse(storedTrip).pickupLocation.coordinates[1], lng: JSON.parse(storedTrip).pickupLocation.coordinates[0] });
      setRoutePath(JSON.parse(storedTrip).routePath);
      //console.log('storedTrip',JSON.parse(storedTrip).routePath);
      setRouteDistance(JSON.parse(storedTrip).TotalDistance);
      setRouteDuration(JSON.parse(storedTrip).TotalDuration);
      setPrice(JSON.parse(storedTrip).TotalPrice);
    }
  }, []);

  const handlePickupSelect = (suggestion: any) => {
    //console.log(suggestion);
    let items = suggestion.display_name.split(',');
    let modifiedString = items.slice(0, -3).join(',');
    setPickup(modifiedString);
    setPickupSuggestions([]);
    setPickupLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    // Update map center to pickup location
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      });
    }
  };

  const handleDropoffSelect = (suggestion: any) => {
    let items = suggestion.display_name.split(',');
    let modifiedString = items.slice(0, -3).join(',');
    setDestination(modifiedString);
    setDropoffSuggestions([]);
    setDropoffLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    // Update map center to pickup location
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      });
    }
  };


  const handlePickupSearch = (query: string) => {
    setPickupLocation({ lat: undefined, lng: undefined });
    setRoutePath(null);
    setPickup(query);
    if (query.trim() === '') {
      setPickupSuggestions([]);
      return;
    }

    // 更新最後輸入時間
    const currentTime = Date.now();
    setLastInputTime(currentTime);

    // 清除之前的計時器
    let timeout: NodeJS.Timeout | null = null;
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }

    // 建立新的計時器
    timeout = setTimeout(async () => {
      // 檢查是否還有新的輸入
      const timeSinceLastInput = Date.now() - lastInputTime;
      if (timeSinceLastInput >= 500) {
        try {
          //console.log('searching for:', query)
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&bounded=1&viewbox=113.8342,22.1967,114.3908,22.5747&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          //console.log(data)
          setPickupSuggestions(data);
        } catch (error) {
          console.error('Error searching for locations:', error);
        }
      }
    }, 500);

    setInputTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  };

  const handleDropoffSearch = (query: string) => {
    setDropoffLocation({ lat: undefined, lng: undefined });
    setRoutePath(null);
    setDestination(query);
    if (query.trim() === '') {
      setDropoffSuggestions([]);
      return;
    }

    // 更新最後輸入時間
    const currentTime = Date.now();
    setLastInputTime(currentTime);

    // 清除之前的計時器
    let timeout: NodeJS.Timeout | null = null;
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }

    // 建立新的計時器
    timeout = setTimeout(async () => {
      // 檢查是否還有新的輸入
      const timeSinceLastInput = Date.now() - lastInputTime;
      if (timeSinceLastInput >= 500) {
        try {
          //console.log('searching for:', query)
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&bounded=1&viewbox=113.8342,22.1967,114.3908,22.5747&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          //console.log(data)
          setDropoffSuggestions(data);
        } catch (error) {
          console.error('Error searching for locations:', error);
        }
      }
    }, 500);

    setInputTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  };
  const reSelectLocation = () => {
    setBookstatus("none");
  }


  const quoteSearch = async () => {
    console.log(pickupLocation, dropoffLocation);
    if (!pickupLocation.lat || !pickupLocation.lng || !dropoffLocation.lat || !dropoffLocation.lng) {
      toast.error("Please enter both pickup and destination locations");
      return;
    }

    // 獲取選擇的隧道
    // const selectedTunnels = localStorage.getItem('selectedTunnels');
    // const tunnels = selectedTunnels ? JSON.parse(selectedTunnels) : [];
    console.log(selectedTunnels)
    try {
      const response = await axios.post(`${baseUrl}/api/calculate-route`, {
        origin: pickupLocation,
        destination: dropoffLocation,
        tunnels: selectedTunnels
      });
      console.log(response.data);
      if (response.data.path) {
        setRoutePath(response.data.path);
        console.log("TotalDistance",response.data.totalDistance);
        setRouteDistance(response.data.totalDistance);
        setRouteDuration(response.data.totalDuration);

        // 更新總價格（車輛價格 + 隧道費用）
        const vehiclePrice = vehicleOptions.find(v => v.id === selectedVehicleData?.id)?.price || 0;
        const totalPrice = Number(vehiclePrice)*Number(response.data.totalDistance)/1000;
        
        setPrice(totalPrice);

        // 保存選擇的隧道到當前行程
        if (currentTripId) {
          await axios.patch(
            `${baseUrl}/api/trips/${currentTripId}`,
            { selectedTunnels: selectedTunnels },
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
    setBookstatus("quote");
  }


  const handleRideConfirmed = async (vehicleData: any) => {

    setSelectedVehicleData(vehicleData);

    try {
      // Get token and user data
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User data not found');
      }
      const user: any = JSON.parse(userStr);




      // Create trip

      const response = await axios.post(`${baseUrl}/api/trips`, {
        passenger: user.id, // Use user ID from localStorage
        pickupLocation: {
          type: 'Point',
          coordinates: pickupLocation ? [pickupLocation.lng, pickupLocation.lat] : [0, 0],
          address: pickup
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: dropoffLocation ? [dropoffLocation.lng, dropoffLocation.lat] : [0, 0],
          address: destination
        },
        vehicleType: vehicleData.name,
        estimatedPrice: Math.round(Number(vehicleData.price) * Number(routeDistance) / 1000),
        estimatedDuration: routeDuration,
        status: 'pending',
        paymentStatus: 'pending',
        routePath: routePath,
      },

        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }

      );

      const data = await response.data;
      // console.log('Trip created:', data);
      setCurrentTripId(data.trip.id || data.trip._id);
      setRoutePath(data.trip.routePath);
      setRouteDistance(data.trip.estimatedDistance);
      setRouteDuration(data.trip.estimatedDuration);
      setPrice(Math.round(Number(vehicleData.price) * Number(routeDistance) / 1000));
      localStorage.setItem('currentTrip', JSON.stringify(data.trip));
      console.log('currentTrip',JSON.stringify(data.trip));
      setRideState("booking");
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to confirm ride. Please try again.');
    }
  };

  const handleRideComplete = () => {
    setRideState("none");
    setBookstatus("none");
    setPickup("");
    setDestination("");
    setPickupLocation({ lat: undefined, lng: undefined });
    setDropoffLocation({ lat: undefined, lng: undefined });
    setActiveTab("history");

  };

  const handleCancelBooking = async (tripId: string) => {
    const token = localStorage.getItem('token');
    // console.log(token);
    //console.log(tripId);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.patch(
      `${baseUrl}/api/trips/${tripId}/status`,
      { status: 'cancelled' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    setRideState("none");
    setBookstatus("none");
    setCurrentTripId("");
    setRoutePath(null);
    setRouteDistance("0");
    setRouteDuration("0");
    setRouteSteps([]);
    setPickup("");
    setDestination("");
    setPickupLocation({ lat: undefined, lng: undefined });
    setDropoffLocation({ lat: undefined, lng: undefined });
    localStorage.setItem("isTakeOrder", "false");
    localStorage.setItem("rideState", "none");
    setActiveTab("history");
    localStorage.removeItem('currentTrip');
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 mt-20 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Passenger Dashboard</h1>

          {/* <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Selected Tunnels:</span>
              <div className="flex space-x-2">
                {selectedTunnels.map((tunnel, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm bg-gray-100 rounded-full"
                  >
                    {tunnel.name} (${tunnel.price})
                  </span>
                ))}
              </div>
            </div>
            {selectedTunnels.length > 0 && (
              <span className="text-sm text-gray-600">
                Total Tunnel Fee: ${selectedTunnels.reduce((total, tunnel) => total + Number(tunnel.price), 0)}
              </span>
            )}
          </div> */}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <div className="glass-card rounded-lg overflow-hidden h-[450px] md:h-[600px]">
              <Map
                showDrivers={true}
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                mapRef={mapRef}
                routePath={routePath}
                routeDistance={routeDistance}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-[450px] md:h-[600px] flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="book" key="tab-book">Book</TabsTrigger>
                <TabsTrigger value="history" key="tab-history">History</TabsTrigger>
                <TabsTrigger value="profile" key="tab-profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="book" className="flex-grow overflow-auto">
                <div className="flex flex-col gap-6">
                  {/* <div className="space-y-2">
                    {selectedTunnels.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Total Tunnel Fee: ${selectedTunnels.reduce((total, tunnel) => total + Number(tunnel.price), 0)}
                      </div>
                    )}
                  </div> */}
                  <div className="flex flex-col gap-6">
                    {rideState === "none" && (
                      <RideBooking
                        pickup={pickup}
                        destination={destination}
                        suggestionsPickup={pickupSuggestions}
                        suggestionsDestination={dropoffSuggestions}
                        bookstatus={bookstatus}
                        routeDistance={routeDistance}
                        quoteSearch={quoteSearch}
                        reSelectLocation={reSelectLocation}
                        handlePickupSearch={handlePickupSearch}
                        handleDestinationSearch={handleDropoffSearch}
                        onRideConfirmed={handleRideConfirmed}
                        handlePickupSelect={handlePickupSelect}
                        handleDropoffSelect={handleDropoffSelect}
                        selectedTunnels={selectedTunnels}
                        onTunnelSelect={(tunnels) => setSelectedTunnels(tunnels)}
                      />
                    )}
                    {rideState === "booking" && (
                      <RideStatus tripId={currentTripId} pickup={pickup} destination={destination}
                        onCancelBooking={() => handleCancelBooking(currentTripId)}
                        vehiclePrice={price} onComplete={handleRideComplete} />
                    )}
                    <Map
                      pickupLocation={pickupLocation}
                      dropoffLocation={dropoffLocation}
                      routePath={routePath}
                      routeSteps={routeSteps}
                      routeDistance={routeDistance}
                      routeDuration={routeDuration}
                      showDrivers={true}
                      mapRef={mapRef}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" key="history-tab" className="flex-grow overflow-auto">
                <RideHistory />

              </TabsContent>

              <TabsContent value="profile" className="flex-grow overflow-auto">
                <div className="glass-card p-5 h-full">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-uber-DEFAULT flex items-center justify-center">
                      <User size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Alex Johnson</h2>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={star <= 4.7 ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                            />
                          ))}
                        </div>
                        <span className="text-xs ml-1">4.7</span>
                      </div>
                    </div>
                    <Button variant="outline" className="ml-auto">
                      Edit Profile
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-2">Account Information</h3>
                      <div className="bg-uber-background/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="text-sm">alex@example.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          <span className="text-sm">+1 (555) 123-4567</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Member since</span>
                          <span className="text-sm">May 2023</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm text-muted-foreground mb-2">Payment Methods</h3>
                      <div className="bg-uber-background/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span className="text-sm">Visa ending in 4242</span>
                          </div>
                          <span className="text-xs bg-uber-accent/30 text-uber-accent px-2 py-0.5 rounded">Default</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span className="text-sm">Mastercard ending in 8888</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Set Default
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm text-muted-foreground mb-2">Saved Places</h3>
                      <div className="bg-uber-background/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-uber-DEFAULT" />
                            <span className="text-sm">Home</span>
                          </div>
                          <span className="text-xs text-muted-foreground">123 Main St, City</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-uber-light" />
                            <span className="text-sm">Work</span>
                          </div>
                          <span className="text-xs text-muted-foreground">456 Market St, City</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Add Saved Place
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PassengerDashboard;
