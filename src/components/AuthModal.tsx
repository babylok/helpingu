
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthProvider';
import { z } from "zod";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  setMode: React.Dispatch<React.SetStateAction<"signin" | "signup">>;
}

interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "passenger" | "driver";
  phoneNumber: string;
  countryCode: string;
}

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  name: z.string().min(1),
  userType: z.enum(["passenger", "driver"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

const AuthModal = ({ isOpen, onClose, mode, setMode }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [countryCode, setCountryCode] = useState("+852");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const { login, signUp } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsInvalid(false);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          setIsInvalid(true);
          throw new Error('Please fill in email and password');
        }
      } else { // signup
        if (!email.trim() || !password.trim() || !confirmPassword.trim() || !name.trim() || !phoneNumber.trim() || !countryCode.trim()) {
          setIsInvalid(true);
          throw new Error('Please fill in all required fields:\n- Email\n- Password\n- Confirm Password\n- Name\n- Phone Number\n- Country Code');
        }
        if (password !== confirmPassword) {
          setIsInvalid(true);
          throw new Error('Passwords do not match');
        }
      }

      if (mode === 'signin') {
        await login({
          email: email.trim(),
          password: password.trim()
        });
      } else {
        await signUp({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          phoneNumber,
          countryCode
        });
      }

      setIsLoading(false);
      toast.success(
        mode === 'signin' 
          ? 'Successfully signed in!' 
          : 'Account created successfully!'
      );
      onClose();

      setEmail("");
      setPassword("");
      setName("");
      setConfirmPassword("");
      setRole('passenger');
      setCountryCode('+852');
      setPhoneNumber('');

    } catch (error) {
      setIsLoading(false);
      setIsInvalid(true);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'signin' 
              ? 'Enter your credentials to sign in'
              : 'Create your account'}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={mode} onValueChange={(value: "signin" | "signup") => setMode(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="w-full">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="w-full">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={isInvalid ? 'border-red-500' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={isInvalid ? 'border-red-500' : ''}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Loading...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={isInvalid ? 'border-red-500' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "passenger" | "driver")}
                    className="w-full rounded-md border-2 border-input bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="passenger" className="text-gray-700">Passenger</option>
                    <option value="driver" className="text-gray-700">Driver</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <select
                      id="countryCode"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[30%] rounded-md border-2 border-input bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="+852" className="text-gray-700">+852</option>
                      <option value="+86" className="text-gray-700">+86</option>
                      <option value="+1" className="text-gray-700">+1</option>
                      <option value="+886" className="text-gray-700">+886</option>
                    </select>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`flex-1 rounded-md border-2 border-input bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isInvalid ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={isInvalid ? 'border-red-500' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={isInvalid ? 'border-red-500' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={isInvalid ? 'border-red-500' : ''}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Loading...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
