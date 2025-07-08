import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

type ApiError = AxiosError<{
  message: string;
  [key: string]: any;
}>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import baseUrl from "@/contexts/BaseUrl";
import axios  from "axios";

interface DriverProfile {
  _id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  driverLicense: {
    licenseNumber: string;
    issueDate: Date;
    expiryDate: Date;
    licenseType: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    registrationExpiry: Date;
    color: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<DriverProfile>>({
    user: {
      name: '',
      email: '',
      phone: '',
    },
    driverLicense: {
      licenseNumber: '',
      issueDate: new Date(),
      expiryDate: new Date(),
      licenseType: 'private'
    },
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      registrationExpiry: new Date(),
      color: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Error",
            description: "Please login first",
            variant: "destructive"
          });
          navigate("/login");
          return;
        }
        const response = await axios.get(`${baseUrl}/api/drivers/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.data) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.data;
        console.log(data);
        // Convert string dates to Date objects
        if (data.driverLicense) {
          data.driverLicense.issueDate = new Date(data.driverLicense.issueDate);
          data.driverLicense.expiryDate = new Date(data.driverLicense.expiryDate);
        }
        if (data.vehicle?.registrationExpiry) {
          data.vehicle.registrationExpiry = new Date(data.vehicle.registrationExpiry);
        }
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
  
      const response = await axios.put(
        `${baseUrl}/api/drivers/profile`,
        profile,  // 直接傳遞 profile 對象作為 data
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
  
      if (!response.data) {
        throw new Error("Failed to update profile");
      }
  
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedInputChange = (section: 'driverLicense' | 'vehicle', field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uber-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-uber-accent">司機資料</h1>
        <div>
          <Button
            onClick={() => navigate(-1)}
            className="bg-uber-accent hover:bg-uber-accent/90 text-white px-6 py-3 rounded-full"
            style={{ marginRight: '10px' }}
          >
            返回
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-uber-accent hover:bg-uber-accent/90 text-white px-6 py-3 rounded-full"
          >
            儲存變更
          </Button>
        </div>

      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">個人資料</TabsTrigger>
          <TabsTrigger value="license">駕駛執照</TabsTrigger>
          <TabsTrigger value="vehicle">車輛資料</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="personal">
            <Card className="bg-uber-background/50 border-none">
              <CardHeader>
                <CardTitle>個人資料</CardTitle>
                <CardDescription>更新您的個人資料</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">全名</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={profile.user.name || ''}
                      onChange={handleInputChange}
                      placeholder="請輸入全名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">電子郵件</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.user.email || ''}
                      onChange={handleInputChange}
                      placeholder="請輸入電子郵件"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">電話號碼</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profile.user.phone || ''}
                      onChange={handleInputChange}
                      placeholder="請輸入電話號碼"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="license">
            <Card className="bg-uber-background/50 border-none">
              <CardHeader>
                <CardTitle>駕駛執照資料</CardTitle>
                <CardDescription>更新您的駕駛執照資料</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>駕駛執照號碼</Label>
                    <Input
                      value={profile.driverLicense?.licenseNumber || ''}
                      onChange={(e) => handleNestedInputChange('driverLicense', 'licenseNumber', e.target.value)}
                      placeholder="請輸入駕駛執照號碼"
                    />
                  </div>
                  <div>
                    <Label>駕駛執照類型</Label>
                    <Select
                      value={profile.driverLicense?.licenseType || 'private'}
                      onValueChange={(value) => handleNestedInputChange('driverLicense', 'licenseType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇駕駛執照類型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">私家車</SelectItem>
                        <SelectItem value="commercial">商用車</SelectItem>
                        <SelectItem value="motorcycle">電單車</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>發證日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profile.driverLicense?.issueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profile.driverLicense?.issueDate ? (
                            format(profile.driverLicense.issueDate, "PPP")
                          ) : (
                            <span>選擇日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profile.driverLicense?.issueDate || new Date()}
                          onSelect={(date) => date && handleNestedInputChange('driverLicense', 'issueDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>到期日</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profile.driverLicense?.expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profile.driverLicense?.expiryDate ? (
                            format(profile.driverLicense.expiryDate, "PPP")
                          ) : (
                            <span>選擇日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profile.driverLicense?.expiryDate || new Date()}
                          onSelect={(date) => date && handleNestedInputChange('driverLicense', 'expiryDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicle">
            <Card className="bg-uber-background/50 border-none">
              <CardHeader>
                <CardTitle>車輛資料</CardTitle>
                <CardDescription>更新您的車輛資料</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>品牌</Label>
                    <Input
                      value={profile.vehicle?.make || ''}
                      onChange={(e) => handleNestedInputChange('vehicle', 'make', e.target.value)}
                      placeholder="請輸入車輛品牌"
                    />
                  </div>
                  <div>
                    <Label>型號</Label>
                    <Input
                      value={profile.vehicle?.model || ''}
                      onChange={(e) => handleNestedInputChange('vehicle', 'model', e.target.value)}
                      placeholder="請輸入車輛型號"
                    />
                  </div>
                  <div>
                    <Label>年份</Label>
                    <Input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={profile.vehicle?.year || ''}
                      onChange={(e) => handleNestedInputChange('vehicle', 'year', parseInt(e.target.value) || '')}
                      placeholder="請輸入車輛年份"
                    />
                  </div>
                  <div>
                    <Label>車牌號碼</Label>
                    <Input
                      value={profile.vehicle?.licensePlate || ''}
                      onChange={(e) => handleNestedInputChange('vehicle', 'licensePlate', e.target.value)}
                      placeholder="請輸入車牌號碼"
                    />
                  </div>
                  <div>
                    <Label>車身顏色</Label>
                    <Input
                      value={profile.vehicle?.color || ''}
                      onChange={(e) => handleNestedInputChange('vehicle', 'color', e.target.value)}
                      placeholder="請輸入車身顏色"
                    />
                  </div>
                  <div>
                    <Label>行車證到期日</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profile.vehicle?.registrationExpiry && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profile.vehicle?.registrationExpiry ? (
                            format(profile.vehicle.registrationExpiry, "PPP")
                          ) : (
                            <span>選擇日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profile.vehicle?.registrationExpiry || new Date()}
                          onSelect={(date) => date && handleNestedInputChange('vehicle', 'registrationExpiry', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
};

export default Profile;
