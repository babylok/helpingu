import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import axios from 'axios';
import { Calendar, Clock, CreditCard, User, Star, History, MapPin, Car, Menu } from "lucide-react";
import baseUrl from "@/contexts/BaseUrl";

interface Ride {
  id: string;
  date: string;
  time: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  status: string;
  vehicleType: string;
  driver?: {
    name: string;
    avatar: string;
  };
  rating?: number;
  review?: string;
}

const RideHistory = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  

  useEffect(() => {
    // Monitor tripHistory changes
    //console.log( tripHistory);
  }, [tripHistory]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { 
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${baseUrl}/api/trips/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

       // console.log('API Response:', response.data);
        //console.log('Response Status:', response.status);
        
        setTripHistory(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip history:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', error.response?.data);
        }
      }
    };

    fetchHistory();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="glass-card p-5 h-full">
          <h2 className="text-xl font-semibold mb-4 text-white">Ride History</h2>
          <div className="space-y-4">
            {tripHistory.length > 0 ? tripHistory.map((ride) => (
              <div key={ride.id} className="bg-uber-background/50 rounded-lg p-4 hover:bg-uber-background transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{ride.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ride.status === "completed"
                    ? "bg-green-900/20 text-green-400"
                    : ride.status === "pending" ? "bg-yellow-900/20 text-yellow-400" : "bg-red-900/20 text-red-400"
                    }`}>
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{ride.time}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-green-500 mt-0.5" />
                    <span className="text-sm">{ride.pickupLocation}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-red-500 mt-0.5" />
                    <span className="text-sm">{ride.dropoffLocation}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-3">
                  <div className="flex items-center space-x-1">
                    <Car size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{ride.vehicleType}</span>
                  </div>
                  <span className="font-medium">$ {ride.fare}</span>
                </div>
                {ride.driver && (
                  <div className="flex items-center gap-2 mt-2">
                    <img 
                      src={ride.driver.avatar} 
                      alt={ride.driver.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">{ride.driver.name}</span>
                  </div>
                )}
                {ride.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`text-sm ${
                          star <= ride.rating ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <p key="no-history" className="text-center text-muted-foreground">No ride history available</p>
            )}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
};
export default RideHistory;