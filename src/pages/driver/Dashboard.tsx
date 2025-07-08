import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Map from "@/components/Map";
import DriverStatus from "@/components/DriverStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreditCard, User, ChevronDown, Clock, Calendar, Star, CircleDollarSign, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";
import baseUrl from "@/contexts/BaseUrl";


interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface Passenger {
  name: string;
  rating: number;
}

interface Location {
  type: string;
  coordinates: number[];
  address: string;
}
interface MapTrip {
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
  seletedOption : string[];
}

// Sample earnings data
const earningsData = [
  { day: "Mon", amount: 124.50 },
  { day: "Tue", amount: 87.75 },
  { day: "Wed", amount: 156.30 },
  { day: "Thu", amount: 110.25 },
  { day: "Fri", amount: 195.60 },
  { day: "Sat", amount: 210.45 },
  { day: "Sun", amount: 178.90 },
];


// Sample completed rides
const completedRides = [
  {
    id: 1,
    date: "Today, 11:32 AM",
    passenger: "Mary Smith",
    from: "123 Main St",
    to: "456 Market St",
    earnings: "$18.50",
    rating: 5,
  },
  {
    id: 2,
    date: "Today, 9:45 AM",
    passenger: "John Davis",
    from: "789 Park Ave",
    to: "555 Tech Blvd",
    earnings: "$22.75",
    rating: 4,
  },
  {
    id: 3,
    date: "Yesterday, 4:20 PM",
    passenger: "Sarah Johnson",
    from: "222 Pine St",
    to: "888 Ocean Ave",
    earnings: "$15.30",
    rating: 5,
  },
  {
    id: 4,
    date: "Yesterday, 1:15 PM",
    passenger: "Robert Lee",
    from: "333 Lake Dr",
    to: "777 Mountain Rd",
    earnings: "$28.90",
    rating: 4,
  },
];

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState("status");
  const isMobile = useIsMobile();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupLocation, setPickupLocation] = useState<google.maps.LatLngLiteral | null>(
    { lat: undefined, lng: undefined }
  );
  const [dropoffLocation, setDropoffLocation] = useState<LatLngLiteral | null>(
    { lat: undefined, lng: undefined }
  );
  const [isShowMap, setIsShowMap] = useState<boolean>(false);
  const [routePath, setRoutePath] = useState<string | null>(null);


  
  
 
  const mapRef = useRef<google.maps.Map>(null);
  
  const totalEarnings = earningsData.reduce((sum, day) => sum + day.amount, 0);
  const weeklyGoal = 1000;
  const goalProgress = (totalEarnings / weeklyGoal) * 100;

  const requestRide = async () => {
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
      console.log(response.data);
      
    
    } catch (error) {
      console.error("Error fetching available trips:", error);
    }
    

  };

  const handleDeclineRide = async (tripId: string) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    try {
      await axios.post(
        `${baseUrl}/api/trips/${tripId}/decline`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      // Refresh the available rides
      requestRide();
    } catch (error) {
      console.error("Error declining ride:", error);
    }
  };

  const handleAcceptRide = async (tripId: string) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    try {
      await axios.post(
        `${baseUrl}/api/trips/${tripId}/accept`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      // Refresh the available rides
      requestRide();
    } catch (error) {
      console.error("Error accepting ride:", error);
    }
  };
  const noshowMap = () => {
    setIsShowMap(false);
    setPickupLocation(null);
    setDropoffLocation(null);
    setRoutePath(null);
  }

  const showMap = (trip: MapTrip) => {
    setIsShowMap(true);
    setPickupLocation({ lat: trip.pickupLocation.coordinates[0], lng: trip.pickupLocation.coordinates[1] });
    setDropoffLocation({ lat: trip.dropoffLocation.coordinates[0], lng: trip.dropoffLocation.coordinates[1] });
    setRoutePath(trip.routePath);
  }
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 mt-24 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          
          {!isMobile && (
            <div className="flex space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    This Week <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>This Week</DropdownMenuItem>
                  <DropdownMenuItem>Last Week</DropdownMenuItem>
                  <DropdownMenuItem>This Month</DropdownMenuItem>
                  <DropdownMenuItem>Last Month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/driver/profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </div>
          )}
          
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="py-4 space-y-4">
                  <Link to="/driver/profile" className="flex items-center w-full justify-start space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <CircleDollarSign className="mr-2 h-4 w-4" />
                    Earnings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="mr-2 h-4 w-4" />
                    Performance
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <div className="glass-card rounded-lg overflow-hidden h-[450px] md:h-[600px]">
            {isShowMap && <Map
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                mapRef={mapRef}
                routePath={routePath}
              /> }
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="h-[450px] md:h-[600px] flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="rides">Rides</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status" className="flex-grow overflow-auto">
                <DriverStatus 
                  showMap={showMap}
                  noshowMap={noshowMap}
                  />
              </TabsContent>
              
              <TabsContent value="earnings" className="flex-grow overflow-auto">
                <div className="glass-card p-5 h-full">
                  <h2 className="text-xl font-semibold mb-4 text-white">Your Earnings</h2>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Weekly goal: ${weeklyGoal.toFixed(2)}</span>
                      <span className="text-sm">${totalEarnings.toFixed(2)}</span>
                    </div>
                    <Progress value={goalProgress} className="h-2" />
                    <p className="text-xs text-right mt-1 text-muted-foreground">
                      {goalProgress.toFixed(1)}% of weekly goal
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="bg-uber-background/50 border-none">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <p className="text-2xl font-semibold">${totalEarnings.toFixed(2)}</p>
                        <p className="text-xs text-green-400 mt-1">↑ 12% from last week</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-uber-background/50 border-none">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-semibold">$2,854.70</p>
                        <p className="text-xs text-green-400 mt-1">↑ 8% from last month</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <h3 className="text-sm text-muted-foreground mb-3">Daily Earnings</h3>
                  <div className="bg-uber-background/50 rounded-lg p-4">
                    <div className="h-40 flex items-end space-x-1">
                      {earningsData.map((day) => {
                        const maxAmount = Math.max(...earningsData.map(d => d.amount));
                        const height = (day.amount / maxAmount) * 100;
                        
                        return (
                          <div key={day.day} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-uber-light/50 hover:bg-uber-light transition-colors rounded-t cursor-help relative group"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                ${day.amount.toFixed(2)}
                              </div>
                            </div>
                            <span className="text-xs mt-1">{day.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm text-muted-foreground mb-3">Recent Payouts</h3>
                    <div className="bg-uber-background/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Weekly Payout</p>
                          <p className="text-xs text-muted-foreground">May 10, 2025</p>
                        </div>
                        <p className="font-medium">$986.45</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Weekly Payout</p>
                          <p className="text-xs text-muted-foreground">May 3, 2025</p>
                        </div>
                        <p className="font-medium">$892.30</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View All Payouts
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rides" className="flex-grow overflow-auto">
                <div className="glass-card p-5 h-full">
                  <h2 className="text-xl font-semibold mb-4 text-white">Completed Rides</h2>
                  
                  <div className="flex justify-between mb-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Recent <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>Recent</DropdownMenuItem>
                        <DropdownMenuItem>This Week</DropdownMenuItem>
                        <DropdownMenuItem>Last Week</DropdownMenuItem>
                        <DropdownMenuItem>This Month</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button variant="ghost" size="sm">
                      <Clock className="mr-2 h-4 w-4" />
                      Scheduled
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {completedRides.map((ride) => (
                      <div 
                        key={ride.id} 
                        className="bg-uber-background/50 rounded-lg p-4 hover:bg-uber-background transition-colors"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">{ride.passenger}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= ride.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">{ride.date}</div>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">{ride.from}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm">{ride.to}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            Completed
                          </Badge>
                          <span className="font-medium text-uber-accent">{ride.earnings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View All Rides
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
