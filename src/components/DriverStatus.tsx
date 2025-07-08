import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import baseUrl from "@/contexts/BaseUrl";

interface Passenger {
  name: string;
  rating: number;
}

interface Location {
  type: string;
  coordinates: number[];
  address: string;
}

interface Trip {
  _id: string;
  passenger: Passenger;
  pickupLocation: Location;
  dropoffLocation: Location;
  distance: number;
  estimatedDuration: number;
  routePath: string;
  estimatedPrice: number;
  vehicleType: string;
  seletedTunnel: string[];
  seletedOption: string[];
}

interface TripData {
  trips: Trip[];
}

interface DriverStatusProps {
  showMap: (trip: Trip) => void;
  noshowMap: () => void;
}

import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CircleDollarSign, Clock, Navigation, User, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import socketIOClient from 'socket.io-client';

// Ride states for driver
enum RideState {
  NONE = "NONE",
  REQUEST_RECEIVED = "REQUEST_RECEIVED",
  EN_ROUTE_TO_PICKUP = "EN_ROUTE_TO_PICKUP",
  ARRIVED_AT_PICKUP = "ARRIVED_AT_PICKUP",
  RIDE_IN_PROGRESS = "RIDE_IN_PROGRESS",
  ARRIVED = "ARRIVED",
  COMPLETED = "COMPLETED",
}

let socket: any = null;

const DriverStatus: React.FC<DriverStatusProps> = ({ showMap, noshowMap }) => {
  const [isOnline, setIsOnline] = useState(localStorage.getItem("isOnline") === "true");
  const [rideState, setRideState] = useState<RideState>(RideState.NONE);
  const [activeRides, setActiveRides] = useState<number>(0);
  const [earnings, setEarnings] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [tripData, setTripData] = useState<any>(null);
  const [currentTripId, setCurrentTripId] = useState<string>("");
  const [routePath, setRoutePath] = useState<string | null>(null);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [passenger, setPassenger] = useState<any>(null);
  const [isTakeOrder, setIsTakeOrder] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [vehicleType, setVehicleType] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<google.maps.LatLngLiteral | null>(
    { lat: undefined, lng: undefined }
  );
  const [dropoffLocation, setDropoffLocation] = useState<google.maps.LatLngLiteral | null>(
    { lat: undefined, lng: undefined }
  );
  const [isStatusChange, setIsStatusChange] = useState<boolean>(false);
  const socketRef = useRef<any>(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [showOnline, setShowOnline] = useState(true);
  const [isShowMap, setIsShowMap] = useState(false);

  const checkTripStatus = async () => {
    const storedTrip = localStorage.getItem("selectedTrip");
    if (storedTrip) {
      const token = localStorage.getItem("token");
      const trip = JSON.parse(storedTrip);
    if (!token) {
      throw new Error("No authentication token found");
    }
    try {
      const response = await axios.get(`${baseUrl}/api/trips/${trip._id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      if (response.data.trip.status === "cancelled" || response.data.trip.status === "completed" || response.data.trip.status === "arrived") {
        setShowOnline(true);
        setIsOnline(true);
        localStorage.removeItem("selectedTrip");
        setSelectedTrip(null);
        setSelectedTripId(null);
        setRideState(RideState.NONE);
        noshowMap();
        setIsShowMap(false);
        return;
      }
    } catch (error) {
      console.error("Error checking trip status:", error);
    }
      
      setSelectedTrip(trip);
      setSelectedTripId(trip._id);
      setShowOnline(false);
      setRideState(trip.status);
      setIsOnline(false);
      if(!isShowMap){
        setIsShowMap(true);
        showMap(trip);
      }

    }
    
    
  }
  useEffect(() => {

    checkTripStatus();
  }, []);


  const requestRideData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }
    try {
      const response = await axios.get(`${baseUrl}/api/trips/available`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data.trips);
      if (response.data.trips.length > 0) {
        setTripData(response.data);
        setRideState(RideState.REQUEST_RECEIVED);
      } else {
        if (!selectedTrip) {
          setRideState(RideState.NONE);
          noshowMap();
          setIsShowMap(false);
        }
      }
    } catch (error) {
      console.error("Error fetching available trips:", error);
    }


  };



  useEffect(() => {
    localStorage.setItem("isOnline", isOnline.toString());
    if (isOnline) {

      // Initialize socket connection
      if (!socketRef.current) {
        console.log("connecting socket")
        socketRef.current = socketIOClient(baseUrl);
        socketRef.current.emit("join_driver_room");

      }
      socketRef.current.on("trip_status_update", (data: { message: string }) => {
        console.log(data);
        requestRideData();
      })
      requestRideData();


    } else {
      console.log("leaving driver room");
      if (!selectedTrip) {
        setRideState(RideState.NONE);
        noshowMap();
        setIsShowMap(false);
        setSelectedTripId(null);
      }
    }


    return () => {
      if (socketRef.current) {
        // 移除所有事件監聽器
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        console.log("disconnecting socket")
        socketRef.current = null;
        noshowMap();
        setIsShowMap(false);
      }
    };
  }, [isOnline]);

  const toggleOnlineStatus = async () => {

    setIsOnline(!isOnline);


    toast.info(`You are now ${!isOnline ? "online" : "offline"}`);

  };

  useEffect(() => {
    if (selectedTrip) {
      takeOrder();
      if (!socketRef.current) {
        console.log("connecting socket")
        socketRef.current = socketIOClient(baseUrl);
        socketRef.current.emit("join_trip", { tripId: selectedTrip._id });

      }
      socketRef.current.on("in_trip_status_update", (data: { message: string, status: string }) => {
        console.log(data);
        if (data.status === "cancelled") {
          setShowOnline(true);
          setIsOnline(true);
          localStorage.removeItem("selectedTrip");
          setSelectedTrip(null);
          setSelectedTripId(null);
          noshowMap();
          setIsShowMap(false);
        }
      })

    }
    return () => {
      if (socketRef.current) {
        // 移除所有事件監聽器
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        console.log("disconnecting socket")
        socketRef.current = null;
      }
    };
  }, [selectedTrip]);

  const takeOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await axios.patch(
        `${baseUrl}/api/trips/${selectedTrip._id}/status`,
        { status: 'accepted' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("response.data:", response.data);
      if (response.data && response.data.trip) {
        console.log('Trip updated:', response.data.trip);
        toast.success("Order taken!");
        // 更新本地狀態
        //setSelectedTrip(response.data.trip);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to update trip status');
      }
    } catch (error: any) {
      console.error('Error taking order:', error);
      const errorMessage = error.response?.data?.message ||
        (error instanceof Error ? error.message : 'Failed to take order');
      toast.error(errorMessage);
    }
  }
  useEffect(() => {
    const storedTrip = localStorage.getItem('selectedTrip');
    if(storedTrip){
      const trip = JSON.parse(storedTrip);  
      trip.status=rideState;
      localStorage.setItem('selectedTrip', JSON.stringify(trip));
    } 
  }, [rideState]);

  const acceptRide = (trip: Trip) => {
    setRideState(RideState.EN_ROUTE_TO_PICKUP);
    toast.success("Ride accepted!");
    setShowOnline(false);
    setSelectedTrip(trip);
   
    localStorage.setItem("selectedTrip", JSON.stringify(trip));
   

   
  };

  const declineRide = async () => {
    setRideState(RideState.NONE);
    toast.info("Ride declined");
    await axios.patch(`${baseUrl}/api/trips/${selectedTrip._id}/status`,
      {
        status: 'cancelled',
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }
    );
    setShowOnline(true);
    setIsOnline(true);
    localStorage.removeItem("selectedTrip");
    setSelectedTrip(null);
    setSelectedTripId(null);
    noshowMap();
    setIsShowMap(false);
  };

  const handleTripClick = (trip: Trip) => {
    console.log("trip checked");
    setSelectedTripId(trip._id);

      showMap(trip);
    
  }


  const arrivedAtPickup = async () => {
    setRideState(RideState.ARRIVED_AT_PICKUP);
    toast.success("Arrived at pickup!");
    await axios.patch(`${baseUrl}/api/trips/${selectedTrip._id}/status`,
      {
        status: 'arrived_at_pickup',
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
  }

  const arrivedAtDestination=async()=>{
    setRideState(RideState.ARRIVED);
    toast.success("Arrived at destination!");
    await axios.patch(`${baseUrl}/api/trips/${selectedTrip._id}/status`,
      {
        status: 'arrived',
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }
    );
    localStorage.removeItem("selectedTrip");
    setSelectedTrip(null);
    setSelectedTripId(null);
    noshowMap();
    setIsShowMap(false);
    setShowOnline(true);
    setIsOnline(true);
  }

  return (
    <div className="glass-card p-5 h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">Recive Ride</h2>
          {showOnline && (<div className="flex items-center space-x-2">
            <Label htmlFor="online-mode" className={isOnline ? "text-uber-accent" : "text-muted-foreground"}>
              {isOnline ? "Online" : "Offline"}
            </Label>
            <Switch
              id="online-mode"
              checked={isOnline}
              onCheckedChange={toggleOnlineStatus}
              className={isOnline ? "bg-uber-accent" : ""}
            />
          </div>)}
        </div>

        {rideState === RideState.NONE && isOnline && !selectedTrip && (
          <div className="bg-uber-background/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px]">
            <div className="animate-pulse text-lg font-medium text-muted-foreground">
              Waiting for ride requests...
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You'll be notified when a new request arrives
            </p>
          </div>
        )}

        {rideState === RideState.REQUEST_RECEIVED && (
          <div className="bg-uber-background/50 rounded-lg p-4 animate-slide-up">
            <h3 className="font-medium text-center mb-3">New Ride Request</h3>
            {tripData && tripData.trips && tripData.trips.length > 0 && (
              tripData.trips.map((trip: Trip) => (
                <div key={trip._id} className="space-y-3">
                  <div
                    className={`space-y-3 p-4 border-2 ${selectedTripId === trip._id ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => handleTripClick(trip)}
                    style={{ background: "#fff", borderRadius: "10px", padding: "10px", cursor: "pointer" }}>
                    {/* user */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User size={18} className="text-uber-light" />
                        <span>{trip.passenger.name}</span>
                      </div>
                      {/* rating */}
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= trip.passenger.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                          />
                        ))}
                      </div>
                    </div>
                    {/* distance and duration */}
                    <div className="flex items-center justify-between text-sm">
                      {/* <div className="flex items-center space-x-2">
                      <Navigation size={18} className="text-uber-light" />
                      <span>{trip.distance.toFixed(1)} miles away</span>
                    </div> */}
                      <div className="flex items-center space-x-2">
                        <Clock size={18} className="text-uber-light" />
                        <span>Est. {(trip.estimatedDuration / 60).toFixed(0)} min ride</span>
                      </div>
                    </div>
                    {/* price */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <CircleDollarSign size={18} className="text-uber-light" />
                        <span>Est. earnings: ${trip.estimatedPrice}</span>
                      </div>
                    </div>
                    {/* location */}
                    <div className="space-y-2 mt-2">
                      <div className="flex items-start space-x-3">
                        <div>
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                        </div>
                        <div className="text-sm text-muted-foreground">{trip.pickupLocation.address}</div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div>
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1"></div>
                        </div>
                        <div className="text-sm text-muted-foreground">{trip.dropoffLocation.address}</div>
                      </div>
                    </div>
                    {/* Extra */}
                    {trip.seletedOption.length > 0 && <div className="flex items-start space-x-3">
                      <div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                      </div>
                      <div className="text-sm text-muted-foreground">{trip.seletedOption.join(", ")}</div>
                    </div>}
                    {/* action buttons */}
                    <div className="flex space-x-3 mt-4">
                      <Button variant="outline" className="flex-1" onClick={() => declineRide()}>
                        Decline
                      </Button>
                      <Button className="flex-1 bg-uber-accent hover:bg-uber-accent/90 text-black" onClick={() => acceptRide(trip)}>
                        Accept
                      </Button>
                    </div>
                  </div>
                  <br />
                </div>
              ))
            )}
          </div>
        )}

        {(rideState === RideState.EN_ROUTE_TO_PICKUP ||
          rideState === RideState.ARRIVED_AT_PICKUP ||
          selectedTripId ||
          rideState === RideState.RIDE_IN_PROGRESS) && (
            <div className="bg-uber-background/50 rounded-lg p-4">
              <h3 className="font-medium mb-3">Current Ride</h3>

              <div className="flex items-center space-x-3 mb-4">
                {/* <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/150?img=33" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar> */}
                <div>
                  <p className="font-medium">Passenger: {selectedTrip?.passenger.name}</p>
                  <p className="text-xs text-muted-foreground">Vehicle Type: {selectedTrip?.vehicleType}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {rideState === RideState.EN_ROUTE_TO_PICKUP && "En route to pickup"}
                    {rideState === RideState.ARRIVED_AT_PICKUP && "Arrived at pickup"}
                    {rideState === RideState.RIDE_IN_PROGRESS && "Ride in progress"}
                  </span>
                </div>
                <Progress value={progress} className="h-2 bg-muted/30" />
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-start space-x-3">
                  <div>
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Pickup</p>
                    <p>{selectedTrip?.pickupLocation.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div>
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1"></div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Destination</p>
                    <p>{selectedTrip?.dropoffLocation.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <Button variant="outline" className="flex-1">
                  Contact Rider
                </Button>
                <Button variant="outline" className="flex-1">
                  Navigation
                </Button>
              </div>

              <div className="flex space-x-3 mt-4">
                {rideState === RideState.EN_ROUTE_TO_PICKUP && (<Button variant="default" className="flex-1" onClick={arrivedAtPickup}>
                  Arrived at pickup
                </Button>)}
                {rideState === RideState.ARRIVED_AT_PICKUP && (<Button variant="default" className="flex-1" onClick={arrivedAtDestination}>
                  Arrive at destination
                </Button>)}
                
                <Button onClick={declineRide} variant="destructive" className="flex-1">
                  Cancel Ride
                </Button>
              </div>
            </div>
          )}

        {rideState === RideState.ARRIVED && (
          <div className="bg-uber-accent/20 rounded-lg p-4 border-2 border-uber-accent">
            <div className="text-center space-y-2">
              <h3 className="font-medium">Ride Completed!</h3>
              <p className="text-sm">You earned $18.50</p>
              <p className="text-xs text-muted-foreground">Finding new rides...</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="earnings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 rounded-lg">
                <h4 className="text-xs text-muted-foreground">Today's earnings</h4>
                <p className="text-2xl font-semibold">${earnings.toFixed(2)}</p>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <h4 className="text-xs text-muted-foreground">Completed rides</h4>
                <p className="text-2xl font-semibold">{activeRides}</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-lg">
              <h4 className="text-xs text-muted-foreground mb-2">This Week</h4>
              <div className="h-24 flex items-end space-x-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-uber-light/30 rounded-t"
                      style={{
                        height: `${Math.max(5, Math.random() * 80)}%`,
                        opacity: i === new Date().getDay() ? 1 : 0.6
                      }}
                    ></div>
                    <span className="text-xs mt-1">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 rounded-lg">
                <h4 className="text-xs text-muted-foreground">Rating</h4>
                <div className="flex items-center mt-1">
                  <p className="text-2xl font-semibold mr-2">4.95</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= 4.95 ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <h4 className="text-xs text-muted-foreground">Acceptance Rate</h4>
                <p className="text-2xl font-semibold">98%</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-lg">
              <h4 className="text-xs text-muted-foreground">Recent Activity</h4>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Total online time</span>
                  <span>5h 23m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total distance</span>
                  <span>78.3 mi</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. ride time</span>
                  <span>12m 30s</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverStatus;
