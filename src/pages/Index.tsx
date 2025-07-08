
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Car, Globe, Clock, Shield, ArrowRight, Star, Heart, Smile, Umbrella } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import HongKongBoundary from "@/components/HongKongBoundary";

const Index = () => {
  const { t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePassengerClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      setAuthMode('signin');
    } else if (user.role === 'passenger') {
      navigate('/passenger/dashboard');
    }
  };

  const handleDriverClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      setAuthMode('signin');
    } else if (user.role === 'driver') {
      navigate('/driver/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-kawaii-pink/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center py-20 mt-24">
        <div className="absolute inset-0 animated-bg"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background"></div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-block bg-kawaii-yellow/30 px-4 py-1 rounded-full text-sm font-medium text-kawaii-pink mb-2">
                🚖 Hong Kong Only
              </div>
              <h1 className="text-4xl md:text-5xl font-kawaii leading-tight text-kawaii-pink">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-foreground max-w-lg">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={handlePassengerClick}
                  size="lg" 
                  className="bg-kawaii-pink hover:bg-kawaii-pink/90 text-white rounded-full font-medium"
                >
                  {t('rideNow')} <Heart className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleDriverClick}
                  variant="outline" 
                  size="lg" 
                  className="border-kawaii-pink/50 text-kawaii-pink hover:bg-kawaii-pink/10 rounded-full"
                >
                  {t('becomeDriver')}
                </Button>
              </div>
            </div>
            
            <div className="hidden md:block relative">
              <div className="glass-card p-6 rounded-[20px] border border-kawaii-pink/20 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&w=600&q=80" 
                  alt="Hong Kong skyline" 
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-kawaii-yellow text-foreground p-4 rounded-[15px] shadow-lg font-kawaii">
                  <p className="text-2xl font-bold">250K+</p>
                  <p className="text-sm">Daily Rides in HK</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="glass-card p-4 rounded-[20px] text-center border border-kawaii-pink/20 hover:border-kawaii-pink/50 transition-all">
              <Car className="mx-auto text-kawaii-pink mb-2" size={28} />
              <h3 className="font-kawaii text-kawaii-pink">{t('premiumVehicles')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('topTier')}</p>
            </div>
            <div className="glass-card p-4 rounded-[20px] text-center border border-kawaii-pink/20 hover:border-kawaii-pink/50 transition-all">
              <Globe className="mx-auto text-kawaii-blue mb-2" size={28} />
              <h3 className="font-kawaii text-kawaii-blue">{t('hkCoverage')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('available')}</p>
            </div>
            <div className="glass-card p-4 rounded-[20px] text-center border border-kawaii-pink/20 hover:border-kawaii-pink/50 transition-all">
              <Clock className="mx-auto text-kawaii-green mb-2" size={28} />
              <h3 className="font-kawaii text-kawaii-green">{t('service247')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('alwaysAvailable')}</p>
            </div>
            <div className="glass-card p-4 rounded-[20px] text-center border border-kawaii-pink/20 hover:border-kawaii-pink/50 transition-all">
              <Shield className="mx-auto text-kawaii-purple mb-2" size={28} />
              <h3 className="font-kawaii text-kawaii-purple">{t('secureRides')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('safetyFirst')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-kawaii-pink/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-kawaii mb-4 text-kawaii-pink">{t('experienceService')}</h2>
            <p className="text-foreground max-w-2xl mx-auto">
              {t('experienceService')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-[20px] card-hover border border-kawaii-pink/20">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-kawaii-yellow/20 flex items-center justify-center mr-3">
                  <Smile className="text-kawaii-yellow h-5 w-5" />
                </div>
                <h3 className="text-xl font-kawaii text-kawaii-pink">{t('forPassengers')}</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-pink">✿</div>
                  <span>Book rides with just a few taps</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-pink">✿</div>
                  <span>Track your driver in real-time</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-pink">✿</div>
                  <span>Choose from multiple vehicle types</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-pink">✿</div>
                  <span>Schedule rides in advance</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-pink">✿</div>
                  <span>Transparent pricing with no surprises</span>
                </li>
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-6 border-kawaii-pink/30 text-kawaii-pink hover:bg-kawaii-pink/10 rounded-full">
                <Link to="/passenger/dashboard" className="w-full">
                  {t('openPassenger')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="glass-card p-6 rounded-[20px] border-2 border-kawaii-blue card-hover relative">
              <div className="bg-kawaii-blue text-white text-xs py-1 px-3 rounded-full absolute -mt-9 ml-2 font-kawaii">
                ✦ POPULAR ✦
              </div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-kawaii-blue/20 flex items-center justify-center mr-3">
                  <Star className="text-kawaii-blue h-5 w-5" />
                </div>
                <h3 className="text-xl font-kawaii text-kawaii-blue">{t('forDrivers')}</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-blue">✿</div>
                  <span>Flexible working hours on your schedule</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-blue">✿</div>
                  <span>Earn competitive rates with bonus opportunities</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-blue">✿</div>
                  <span>Get paid instantly with fast transfers</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-blue">✿</div>
                  <span>Advanced route optimization</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-blue">✿</div>
                  <span>Comprehensive driver support 24/7</span>
                </li>
              </ul>
              <Button asChild size="sm" className="w-full mt-6 bg-kawaii-blue hover:bg-kawaii-blue/90 text-white rounded-full">
                <Link to="/driver/dashboard">
                  {t('startDriving')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="glass-card p-6 rounded-[20px] card-hover border border-kawaii-purple/20">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-kawaii-purple/20 flex items-center justify-center mr-3">
                  <Umbrella className="text-kawaii-purple h-5 w-5" />
                </div>
                <h3 className="text-xl font-kawaii text-kawaii-purple">{t('features')}</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-purple">✿</div>
                  <span>AI-powered ride matching algorithm</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-purple">✿</div>
                  <span>Carbon-neutral ride options</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-purple">✿</div>
                  <span>Priority support and special requests</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-purple">✿</div>
                  <span>Customizable ride preferences</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-kawaii-purple">✿</div>
                  <span>VIP access to special events and locations</span>
                </li>
              </ul>
              <Button variant="outline" size="sm" className="w-full mt-6 border-kawaii-purple/30 text-kawaii-purple hover:bg-kawaii-purple/10 rounded-full">
                {t('learnMore')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Hong Kong Boundary Info */}
          <div className="mt-10">
            <HongKongBoundary />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 kawaii-gradient"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card max-w-3xl mx-auto p-8 text-center rounded-[20px] border border-kawaii-pink/30">
            <h2 className="text-3xl font-kawaii mb-4 text-kawaii-pink">{t('readyForFuture')}</h2>
            <p className="text-foreground mb-8">
              Join thousands of satisfied passengers and drivers on our platform.
              Experience transportation reimagined for Hong Kong.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-kawaii-pink hover:bg-kawaii-pink/90 text-white rounded-full">
                <Link to="/passenger/dashboard">{t('bookFirst')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-kawaii-pink/50 text-kawaii-pink hover:bg-kawaii-pink/10 rounded-full">
                <Link to="/driver/dashboard">{t('joinDriver')}</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-5 left-5 animate-float">
          <Star className="text-kawaii-yellow h-6 w-6" />
        </div>
        <div className="absolute top-10 right-10 animate-float" style={{ animationDelay: "1s" }}>
          <Heart className="text-kawaii-pink h-8 w-8" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float" style={{ animationDelay: "2s" }}>
          <Umbrella className="text-kawaii-blue h-7 w-7" />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-kawaii-pink/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-kawaii flex items-center justify-center">
                  <Smile className="text-white h-5 w-5" />
                </div>
                <span className="text-xl font-kawaii text-kawaii-pink">{t('appName')}</span>
              </div>
              <p className="text-muted-foreground max-w-xs text-sm">
                Reinventing transportation in Hong Kong with cute vehicles and exceptional service.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-kawaii mb-3 text-kawaii-pink">{t('appName')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-kawaii-pink">{t('about')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-pink">{t('howWorks')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-pink">{t('safety')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-pink">{t('careers')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-kawaii mb-3 text-kawaii-blue">{t('helpCenter')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-kawaii-blue">{t('helpCenter')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-blue">{t('blog')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-blue">{t('driverGuide')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-blue">{t('press')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-kawaii mb-3 text-kawaii-purple">{t('terms')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-kawaii-purple">{t('terms')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-purple">{t('privacy')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-purple">{t('cookie')}</a></li>
                  <li><a href="#" className="hover:text-kawaii-purple">{t('licenses')}</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-kawaii-pink/10 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t('appName')}. {t('reserved')}
            </p>
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-kawaii-pink transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-kawaii-blue transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-kawaii-yellow transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
        setMode={setAuthMode}
      />
    </div>
  );
};

export default Index;

