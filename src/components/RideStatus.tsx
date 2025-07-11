
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import socketIOClient from 'socket.io-client';
import baseUrl from "@/contexts/BaseUrl";
// Simulated ride status
enum RideState {
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  DRIVER_EN_ROUTE = "DRIVER_EN_ROUTE",
  ARRIVED_AT_PICKUP = "ARRIVED_AT_PICKUP",
  IN_PROGRESS = "IN_PROGRESS",
  ARRIVED = "ARRIVED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

interface RideStatusProps {
  pickup: string;
  destination: string;
  tripId: string;
  vehiclePrice: number;
  extraSelections: any[];
  driver: any;
  passTunnel: any[];
  tunnelFeeSum: number;
  getTripData: () => void;
  onCancelBooking: () => void;
  onComplete: () => void;
}

const RideStatus = ({ pickup, destination, extraSelections, tripId, vehiclePrice, driver, passTunnel, tunnelFeeSum, getTripData, onComplete, onCancelBooking }: RideStatusProps) => {
  const [rideState, setRideState] = useState<RideState>(null);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // minutes
  const [isTakeOrder, setIsTakeOrder] = useState<boolean>(localStorage.getItem("isTakeOrder") === "true");
  //const [driver, setDriver] = useState<any>(null);

  const socketRef = useRef<any>(null);
  useEffect(()=>{
    const storedTrip = localStorage.getItem('currentTrip');
    console.log("storedTrip1",storedTrip)
    if(storedTrip){
      const trip = JSON.parse(storedTrip);  
      setRideState(trip.rideState);
    }
  },[])
  useEffect(()=>{
    const storedTrip = localStorage.getItem('currentTrip');
    if(storedTrip){
      const trip = JSON.parse(storedTrip);  
      trip.rideState=rideState;
      localStorage.setItem('currentTrip', JSON.stringify(trip));
    }
  },[rideState])

  useEffect(() => {
    console.log(tripId)
    if (tripId) {

      // Initialize socket connection
      if (!socketRef.current) {
        console.log("connecting socket")
        socketRef.current = socketIOClient(baseUrl);
        socketRef.current.emit("join_trip", { tripId });

      }
      socketRef.current.on("in_trip_status_update", (data: { message: string, status: string }) => {
        console.log(data);
        if (data.status === 'cancelled') {
          setIsTakeOrder(false);
          localStorage.setItem("isTakeOrder", "false");
          onCancelBooking();
          setRideState(null);
        }
        if (data.status === "accepted") {
          setIsTakeOrder(true);
          localStorage.setItem("isTakeOrder", "true");
          getTripData();
          setRideState(RideState.DRIVER_ASSIGNED);
        }
        if (data.status === "en_route_to_pickup") {
          setRideState(RideState.DRIVER_EN_ROUTE);
        }
        if (data.status === "arrived_at_pickup") {
          setRideState(RideState.ARRIVED_AT_PICKUP);
        }
        if (data.status === "in_progress") {
          setRideState(RideState.IN_PROGRESS);
        }
        if (data.status === "arrived") {
          setRideState(RideState.ARRIVED);
        }
        if (data.status === "completed") {
          setIsTakeOrder(false);
          localStorage.setItem("isTakeOrder", "false");
          setRideState(RideState.COMPLETED);
        }

      })


    } else {
      console.log("leaving driver room");

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
  }, [tripId]);


  const handleRating = (stars: number) => {
    setRating(stars);
  };

  const submitRating = () => {
    toast.success(`Thanks for your ${rating}-star rating!`);
    onComplete();
  };

  const getStatusText = () => {
    switch (rideState) {
      case RideState.DRIVER_ASSIGNED:
        return "Driver assigned";
      case RideState.DRIVER_EN_ROUTE:
        return "Driver on the way";
      case RideState.ARRIVED_AT_PICKUP:
        return "Driver has arrived";
      case RideState.IN_PROGRESS:
        return "En route to destination";
      case RideState.ARRIVED:
        return "Driver has arrived";
      case RideState.COMPLETED:
        return "Ride completed";
      default:
        return "Processing";
    }
  };

  return (
    <div className="glass-card p-5 h-full">
      {!showRating && (
        <div className="space-y-4">
          {isTakeOrder && (<div>
            <h2 className="text-xl font-semibold text-white">Your Ride</h2>
            {/* driver */}
            <div className="flex items-center space-x-3 mb-4">
              {/* <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?img=59" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar> */}
              {driver && (<div>

                <div>
                  <p className="font-medium">{driver.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= 4.8 ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                        />
                      ))}
                    </div>
                    <span className="ml-1">4.8</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-medium">{driver.vehicle.type}</p>
                  <p className="text-xs text-muted-foreground">{driver.vehicle.plateNumber}</p>
                </div>
              </div>)}
            </div>
            {/* progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{getStatusText()}</span>
                <span>
                  {rideState !== RideState.COMPLETED ? (
                    `${timeLeft.toFixed(1)} min${timeLeft === 1 ? "" : "s"}`
                  ) : (
                    "Arrived"
                  )}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-muted/30" />
            </div>
          </div>)}

          {/* pickup and destination */}
          <div className="space-y-3 mt-6">
            <div className="flex items-start space-x-3">
              <div>
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
              </div>
              <div>
                <p className="font-medium">Pickup Location</p>
                <p className="text-sm text-muted-foreground">{pickup}</p>
              </div>
            </div>
            <br />
            <div className="flex items-start space-x-3">
              <div>
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
              </div>
              <div>
                <p className="font-medium">Destination</p>
                <p className="text-sm text-muted-foreground">{destination}</p>
              </div>
            </div>
          </div>
          {/* tunnel */}
          {passTunnel.length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-start space-x-3">
                <div>
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                </div>
                <div>
                  <p className="font-medium"> Tunnel</p>
                  <p className="text-sm text-muted-foreground">{passTunnel.join(", ")}</p>
                  
                </div>
              </div>
            </div>
          )}

          {/* extra */}
          {extraSelections.length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-start space-x-3">
                <div>
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-1"></div>
                </div>
                <div>
                  <p className="font-medium">Extra</p>
                  <p className="text-sm text-muted-foreground">{extraSelections.map((extra) => extra.name).join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-uber-background/50 rounded-lg p-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fare estimate:</span>
              <span className="font-medium">${vehiclePrice}</span>
            </div>
          </div>
          {!isTakeOrder && (<div className="flex space-x-3 mt-4">
            <Button variant="outline" className="flex-1" disabled>
              Waiting...
            </Button>
            <Button variant="outline" className="flex-1" onClick={onCancelBooking}>
              Cancel Booking
            </Button>
          </div>)}  
          { rideState === RideState.DRIVER_ASSIGNED && (<div className="flex space-x-3 mt-4">
            <Button variant="outline" className="flex-1">
             Contact Driver
            </Button>
            <Button variant="outline" className="flex-1" onClick={onCancelBooking}>Cancel Booking</Button>
          </div>)}
          { rideState === RideState.ARRIVED_AT_PICKUP && (<div className="flex space-x-3 mt-4">
            
            <Button variant="outline" className="flex-1" >Trip in progress</Button>
          </div>)}
          {  rideState === RideState.ARRIVED && (<div className="flex space-x-3 mt-4">
            
            <Button variant="outline" className="flex-1" onClick={onComplete} >Completed Trip</Button>
          </div>)}
          
        </div>
      )}
      {showRating && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-white">Rate Your Ride</h2>

          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                />
              </button>
            ))}
          </div>

          <p className="text-center text-muted-foreground">
            How was your experience with {driver.name}?
          </p>

          <Button
            className="w-full bg-uber-accent hover:bg-uber-accent/90 text-black font-medium"
            disabled={!rating}
            onClick={submitRating}
          >
            Submit Rating
          </Button>
        </div>
      )}
    </div>
  );
};

export default RideStatus;
