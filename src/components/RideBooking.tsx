
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Car, CreditCard, Calendar, Axe } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import socketIOClient from 'socket.io-client';
import axios from "axios";
import baseUrl from "@/contexts/BaseUrl";

const vehicleOptions = [
  {
    id: "standard",
    name: "Standard",
    price: "12.50",
    time: "4 min away",
    icon: "🚗",
  },
  {
    id: "premium",
    name: "Premium",
    price: "18.75",
    time: "6 min away",
    icon: "🚙",
  },
  {
    id: "suv",
    name: "SUV",
    price: "22.30",
    time: "8 min away",
    icon: "🚐",
  },
  {
    id: "electric",
    name: "Electric",
    price: "16.90",
    time: "5 min away",
    icon: "⚡",
  },
];

const RideBooking = ({ pickup, destination, suggestionsPickup = [], suggestionsDestination = [],
  bookstatus, routeDistance, isTunnelOption1, isTunnelOption2, isTunnelOption3, passTunnel, tunnelFeeSum, setSeletectedTunnel, quoteSearch, reSelectLocation,
  handlePickupSearch, handleDestinationSearch, onRideConfirmed, handlePickupSelect, handleDropoffSelect,
  selectedExtra = [], onExtraSelect }:
  {
    pickup: string; destination: string; suggestionsPickup?: any[]; suggestionsDestination?: any[];
    bookstatus: string;
    routeDistance: string;
    isTunnelOption1: boolean;
    isTunnelOption2: boolean;
    isTunnelOption3: boolean;
    passTunnel: any[];
    tunnelFeeSum: number;
    setSeletectedTunnel: (tunnels: any[]) => void;
    quoteSearch: () => void;
    reSelectLocation: () => void;
    handlePickupSearch: (query: string) => void; handleDestinationSearch: (query: string) => void;
    handlePickupSelect: (suggestion: any) => void; handleDropoffSelect: (suggestion: any) => void;
    onRideConfirmed: (vehicleData: any) => void;
    selectedExtra?: any[];
    onExtraSelect?: (extras: any[]) => void;
  }) => {
  const [scheduleMode, setScheduleMode] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleOptions[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const socketRef = useRef<any>(null);
  const [optionOpen, setOptionOpen] = useState(false);
  const [total, setTotal] = useState(0);


  const [isExtraDefault, setIsExtraDefault] = useState(true);
  const [extraSelections, setExtraSelections] = useState(selectedExtra);
  const [option1, setOption1] = useState("Default");
  const [option2, setOption2] = useState("Default");
  const [option3, setOption3] = useState("Default");
  useEffect(() => {
    setSelectedVehicle(vehicleOptions[0].id);
    setTotal(0);
    setExtraSelections([]);
    setOption1("Default");
    setOption2("Default");
    setOption3("Default");
    console.log("useEffect")
  }, [bookstatus]);

  useEffect(() => {
    let selectedTunnels = [];
    if (option1 !== "Default") {
      selectedTunnels.push({ name: option1, price: "0" });
    }
    if (option2 !== "Default") {
      selectedTunnels.push({ name: option2, price: "0" });
    }
    if (option3 !== "Default") {
      selectedTunnels.push({ name: option3, price: "0" });
    }
    setSeletectedTunnel(selectedTunnels);
  }, [option1, option2, option3]);

  useEffect(() => {
    if (!isTunnelOption1) {
      setOption1("Default");
    }
    if (!isTunnelOption2) {
      setOption2("Default");
    }
    if (!isTunnelOption3) {
      setOption3("Default");
    }
  }, [isTunnelOption1, isTunnelOption2, isTunnelOption3]);

  useEffect(() => {
    const vehiclePrice = vehicleOptions.find(v => v.id === selectedVehicle)?.price || 0;
    const totalPrice = Math.round(Number(vehiclePrice) * Number(routeDistance) / 1000);
    const extraPrice = extraSelections.reduce((total, extra) => total + Number(extra.price), 0);

    setTotal(totalPrice + extraPrice + tunnelFeeSum);
  }, [selectedVehicle, extraSelections, tunnelFeeSum]);
  // 
  const handleTestEvent = async () => {
    const response = await axios.get(`${baseUrl}/api/trips/test`);
    console.log(response.data);
  }


  const handlePickup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handlePickupSearch(value);
    setShowPickupSuggestions(true);
  };

  const handleDestination = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleDestinationSearch(value);
    setShowDestinationSuggestions(true);
  };

  const handlePickupSuggestionClick = (suggestion: any) => {
    handlePickupSelect(suggestion);
    setShowPickupSuggestions(false);
  };

  const handleDestinationSuggestionClick = (suggestion: any) => {
    handleDropoffSelect(suggestion);
    setShowDestinationSuggestions(false);
  };


  const handleBookRide = () => {
    if (!pickup || !destination) {
      toast.error("Please enter both pickup and destination locations");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      toast.success(
        scheduleMode
          ? "Your ride has been scheduled!"
          : "Your ride has been confirmed! Driver is on the way."
      );
      setIsLoading(false);
      const selectedVehicleData = vehicleOptions.find((option) => option.id === selectedVehicle);
      onRideConfirmed(selectedVehicleData);
    }, 1500);
  };

  const handleQuote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await quoteSearch();
  };
  // useEffect(() => {
  //   console.log(selectedTunnels)
  //   if (selectedTunnels.length === 0) {
  //     setIsDefault(true);
  //   }
  // }, [selectedTunnels]);

  // const handleTunnelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newTunnel = { name: e.target.name, price: e.target.value };
  //   const updatedTunnels = selectedTunnels.filter((tunnel) => tunnel.name !== newTunnel.name);
  //   if (!selectedTunnels.some((tunnel) => tunnel.name === newTunnel.name)) {
  //     updatedTunnels.push(newTunnel);
  //   }
  //   setTunnelSelections(updatedTunnels);
  //   if (onTunnelSelect) {
  //     onTunnelSelect(updatedTunnels);
  //   }
  //   setIsDefault(false);
  // };

  // const handleDefault = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const checked = e.target.checked;
  //   setIsDefault(checked);

  //   if (checked) {
  //     setTunnelSelections([]);
  //     if (onTunnelSelect) {
  //       onTunnelSelect([]);
  //     }
  //   }
  // };

  const handleExtraSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExtra = { name: e.target.name, price: e.target.value };
    const updatedExtras = selectedExtra.filter((extra) => extra.name !== newExtra.name);
    if (!selectedExtra.some((extra) => extra.name === newExtra.name)) {
      updatedExtras.push(newExtra);
    }
    setExtraSelections(updatedExtras);
    if (onExtraSelect) {
      onExtraSelect(updatedExtras);
    }
    setIsExtraDefault(false);
    console.log(updatedExtras);
  };

  const handleExtraDefault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsExtraDefault(checked);

    if (checked) {
      setExtraSelections([]);
      if (onExtraSelect) {
        onExtraSelect([]);
      }
    }
  };

  // 

  return (
    <div className="glass-card p-5 rounded-lg ">
      <h2 className="text-xl font-semibold mb-4 ">Book a Ride</h2>
      {/* <button onClick={handleTestEvent} style={{backgroundColor: "#FF0000", color: "white", padding: "10px 20px", borderRadius: "5px"}}>Test Event</button>
        */}
      {bookstatus === "none" && (<div className="space-y-4">
        <div className="relative">
          <div className="relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <Input
                placeholder="Pickup location"
                className="pl-8 input-field"
                value={pickup || ''}
                onChange={handlePickup}
                onFocus={() => setShowPickupSuggestions(true)}
                onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
              />
              {showPickupSuggestions && (
                <div className="absolute w-full bg-white border rounded-b-lg shadow-lg z-10 mt-1">
                  {suggestionsPickup?.length > 0 ? (
                    suggestionsPickup.map((suggestion: any, index: number) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePickupSuggestionClick(suggestion)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{suggestion.display_name}</span>
                          <span className="text-sm text-gray-500">{suggestion.lat}, {suggestion.lon}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No suggestions found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <br />

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <Input
              placeholder="Destination"
              className="pl-8 input-field"
              value={destination || ''}
              onChange={handleDestination}
              onFocus={() => setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
            />
            {showDestinationSuggestions && (
              <div className="absolute w-full bg-white border rounded-b-lg shadow-lg z-10 mt-1">
                {suggestionsDestination?.length > 0 ? (
                  suggestionsDestination.map((suggestion: any, index: number) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleDestinationSuggestionClick(suggestion)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{suggestion.display_name}</span>
                        <span className="text-sm text-gray-500">{suggestion.lat}, {suggestion.lon}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No suggestions found</div>
                )}
              </div>
            )}
          </div>
        </div>
        {isTunnelOption1 && (<div className="grid gap-2">
          <label htmlFor="option1">Yuen Long Tunnel Option</label>
          <select
            id="option1"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            className="w-full rounded-md border-2 border-input bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Default" className="text-gray-700">Default</option>
            <option value="Tai Lam Tunnel" className="text-gray-700">Tai Lam Tunnel $43</option>
            <option value="Tuen Mun Road" className="text-gray-700">Tuen Mun Road $0</option>
          </select>
        </div>)}
        {isTunnelOption2 && (<div className="grid gap-2">
          <label htmlFor="option2">Sha Tin Tunnel Option</label>
          <select
            id="option2"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            className="w-full rounded-md border-2 border-input bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Default" className="text-gray-700">Default</option>
            <option value="Shing Mun Tunnels" className="text-gray-700">Shing Mun Tunnels $5</option>
            <option value="Lion Rock Tunnel" className="text-gray-700">Lion Rock Tunnel $8</option>
            <option value="Eagle's Nest Tunnel" className="text-gray-700">Eagle's Nest Tunnel $8</option>
            <option value="Tate's Cairn Tunnel" className="text-gray-700">Tate's Cairn Tunnel $24</option>
            <option value="Tai Po Road" className="text-gray-700">Tai Po Road $0</option>
          </select>
        </div>)}
        {isTunnelOption3 && (<div className="grid gap-2">
          <label htmlFor="option3">Hong Kong Tunnel Option</label>
          <select
            id="option3"
            value={option3}
            onChange={(e) => setOption3(e.target.value)}
            className="w-full rounded-md border-2 border-input bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Default" className="text-gray-700">Default</option>
            <option value="Cross-Harbour Tunnel" className="text-gray-700">Cross-Harbour Tunnel $50</option>
            <option value="Eastern Harbour Crossing" className="text-gray-700">Eastern Harbour Crossing $50</option>
            <option value="Western Harbour Tunnel" className="text-gray-700">Western Harbour Tunnel $50</option>

          </select>
        </div>)}
        {/* <div className="cursor-pointer" onClick={() => setTunnelOpen(!tunnelOpen)}>
          Tunnel Options
        </div>
        {tunnelOpen && (
          <div className="w-full bg-white border rounded-b-lg shadow-lg z-10 mt-1">
            <div className="space-y-2">
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  name="Default"
                  value="0"
                  checked={isDefault}
                  onChange={(e) => handleDefault(e)}
                />
                <label htmlFor="default">Default (HK$0)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Cross-Harbour"
                  name="Cross-Harbour Tunnel"
                  value="50"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Cross-Harbour Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Cross-Harbour">Cross-Harbour Tunnel (HK$50)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Eastern"
                  name="Eastern Harbour Crossing"
                  value="50"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Eastern Harbour Crossing")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Eastern">Eastern Harbour Crossing (HK$50)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Western"
                  name="Western Harbour Tunnel"
                  value="60"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Western Harbour Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Western">Western Harbour Tunnel (HK$60)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Lion"
                  name="Lion Rock Tunnel"
                  value="8"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Lion Rock Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Lion">Lion Rock Tunnel (HK$8)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Eagle"
                  name="Eagle's Nest Tunnel"
                  value="8"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Eagle's Nest Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Eagle">Eagle's Nest Tunnel (HK$8)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Tate"
                  name="Tate's Cairn Tunnel"
                  value="24"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Tate's Cairn Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Tate">Tate's Cairn Tunnel (HK$24)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Shing"
                  name="Shing Mun Tunnels"
                  value="5"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Shing Mun Tunnels")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Shing">Shing Mun Tunnels (HK$5)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Tai"
                  name="Tai Lam Tunnel"
                  value="43"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Tai Lam Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Tai">Tai Lam Tunnel (HK$43)</label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="Aberdeen"
                  name="Aberdeen Tunnel"
                  value="5"
                  checked={selectedTunnels.some((tunnel) => tunnel.name === "Aberdeen Tunnel")}
                  onChange={(e) => handleTunnelSelect(e)}
                />
                <label htmlFor="Aberdeen">Aberdeen Tunnel (HK$5)</label>
              </div>
            </div>
          </div>
        )} */}
      </div>)}
      {bookstatus === "quote" && (<Tabs defaultValue="now">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="now" onClick={() => setScheduleMode(false)}>Ride Now</TabsTrigger>
          <TabsTrigger value="schedule" onClick={() => setScheduleMode(true)}>Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="now" className="space-y-4">


          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Choose a ride type:</p>
            <div className="grid grid-cols-2 gap-3">
              {vehicleOptions.map((option) => (
                <button
                  key={option.id}
                  className={`p-3 rounded-lg transition-all ${selectedVehicle === option.id
                    ? "border-2 border-uber-accent bg-uber-accent/10"
                    : "border border-white/10 hover:border-white/30 bg-card/50"
                    }`}
                  onClick={() => setSelectedVehicle(option.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">$ {Math.round(Number(option.price) * Number(routeDistance) / 1000)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{option.name}</span>
                    {/* <span className="text-xs text-muted-foreground">{option.time}</span> */}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {passTunnel.length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-start space-x-3">
                <div>
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                </div>
                <div>
                  <p className="font-medium"> Tunnel</p>
                  <p className="text-sm text-muted-foreground">{passTunnel.join(", ")}</p>
                  <p className="text-sm text-muted-foreground">Tunnel fee: HK$ {tunnelFeeSum}</p>
                </div>
              </div>
            </div>
          )}
          <div className="cursor-pointer" onClick={() => setOptionOpen(!optionOpen)}>

            Extra Options(click to choose)
          </div>
          {optionOpen && (
            <div className="w-full bg-white border rounded-b-lg shadow-lg z-10 mt-1">
              <div className="space-y-2">
                <div className="space-x-2">
                  <input
                    type="checkbox"
                    id="extraDefault"
                    name="Default"
                    value="0"
                    checked={isExtraDefault}
                    onChange={(e) => handleExtraDefault(e)}
                  />
                  <label htmlFor="extraDefault">No Extra (HK$0)</label>
                </div>
                <div className="space-x-2">
                  <input
                    type="checkbox"
                    id="Pet"
                    name="Pet Friendly"
                    value="10"
                    checked={selectedExtra.some((extra) => extra.name === "Pet Friendly")}
                    onChange={(e) => handleExtraSelect(e)}
                  />
                  <label htmlFor="Pet">Pet Friendly (HK$10)</label>
                </div>
                <div className="space-x-2">
                  <input
                    type="checkbox"
                    id="English"
                    name="English Friendly"
                    value="5"
                    checked={selectedExtra.some((extra) => extra.name === "English Friendly")}
                    onChange={(e) => handleExtraSelect(e)}
                  />
                  <label htmlFor="English">English Friendly (HK$5)</label>
                </div>
                <div className="space-x-2">
                  <input
                    type="checkbox"
                    id="Wheelchair"
                    name="Wheelchair"
                    value="15"
                    checked={selectedExtra.some((extra) => extra.name === "Wheelchair")}
                    onChange={(e) => handleExtraSelect(e)}
                  />
                  <label htmlFor="Wheelchair">Wheelchair (HK$15)</label>
                </div>

              </div>
            </div>
          )}
          <hr />
          <div className="flex justify-between">
            <p className="font-medium">Total</p>
            <p className="font-medium">HK$ {total}</p>
          </div>

          <hr />
          <div className="mt-4 bg-uber-background/50 rounded-lg p-3 text-sm">
            {/* <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estimated arrival</span>
              <span className="font-medium">12:43 PM</span>
            </div> */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-muted-foreground">Payment method</span>
              <div className="flex items-center">
                <CreditCard size={14} className="mr-1" />
                <span className="font-medium">Visa •••• 4242</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">


          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {/* Placeholder for calendar */}
                  <div className="p-4">
                    <p>Calendar would go here</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Time</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Select time</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {/* Placeholder for time picker */}
                  <div className="p-4">
                    <p>Time picker would go here</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Choose a ride type:</p>
            <div className="grid grid-cols-2 gap-3">
              {vehicleOptions.map((option) => (
                <button
                  key={option.id}
                  className={`p-3 rounded-lg transition-all ${selectedVehicle === option.id
                    ? "border-2 border-uber-accent bg-uber-accent/10"
                    : "border border-white/10 hover:border-white/30 bg-card/50"
                    }`}
                  onClick={() => setSelectedVehicle(option.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{option.name}</span>
                    {/* <span className="text-xs text-muted-foreground">{option.time}</span> */}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 bg-uber-background/50 rounded-lg p-3 text-sm">
            {/* <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estimated arrival</span>
              <span className="font-medium">12:43 PM</span>
            </div> */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-muted-foreground">Payment method</span>
              <div className="flex items-center">
                <CreditCard size={14} className="mr-1" />
                <span className="font-medium">Visa •••• 4242</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>)}

      {bookstatus === "none" && (<Button
        onClick={handleQuote}
        className="w-full mt-6 bg-uber-accent hover:bg-uber-accent/90 text-black">
        Quote
      </Button>)}
      {bookstatus === "quote" && (<div className="flex gap-4 mt-6">
        <Button
          onClick={reSelectLocation}
          className="flex-1 bg-uber-accent hover:bg-uber-accent/90 text-black">
          Back
        </Button>
        <Button
          className="flex-1 bg-uber-accent hover:bg-uber-accent/90 text-black"
          onClick={handleBookRide}
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : scheduleMode
              ? "Schedule Ride"
              : "Confirm Ride"
          }
        </Button>
      </div>)}
    </div>
  );
};

export default RideBooking;
