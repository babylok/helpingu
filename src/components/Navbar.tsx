import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Menu, User, X } from "lucide-react";
import AuthModal from "./AuthModal";
import { useIsMobile } from "@/hooks/use-mobile";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Umbrella, Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { user, token, login, logout, checkTokenValidity } = useAuth();

  // 監聽用戶狀態變化
  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  // 監聽token變化，但不再自動登出
  useEffect(() => {
    if (token) {
      checkTokenValidity().catch(console.error);
    }
  }, [token]);
 
  
  

  const handleOpenAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogOut = () => {
    logout();
  }

  // Add a small decoration that floats
  const decorations = [
    <div key="1" className="absolute top-6 left-10 hidden md:block animate-float">
      <Star size={16} className="text-kawaii-yellow" />
    </div>,
    <div key="2" className="absolute top-12 right-20 hidden md:block animate-float animation-delay-500">
      <Umbrella size={20} className="text-kawaii-blue" />
    </div>
  ];

  return (
    <header className="fixed w-full top-0 z-50 py-4">
      {decorations}
      <div className="container mx-auto px-4">
        <div className="glass-card px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-kawaii flex items-center justify-center">
                <Smile className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-kawaii text-kawaii-pink">{t('appName')}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4">
              <LanguageToggle />
              <Link to="/" className="text-kawaii-pink hover:text-kawaii-blue transition-colors">
                {t('home')}
              </Link>
              {user && user.role === 'passenger' && <Link to="/passenger/dashboard" className="text-kawaii-pink hover:text-kawaii-blue transition-colors">
                {t('passenger')}
              </Link>}
              {user && user.role === 'driver' && <Link to="/driver/dashboard" className="text-kawaii-pink hover:text-kawaii-blue transition-colors">
                {t('driver')}
              </Link>}
              <Button 
                variant="outline" 
                className="border-kawaii-pink/50 text-kawaii-pink hover:bg-kawaii-pink/10"
                onClick={() => {
                  if (user) {
                    handleLogOut();
                    // 導航到首頁
                    navigate('/');
                  } else {
                    handleOpenAuth("signin");
                  }
                }}
              >
                <User className="mr-2 h-4 w-4" /> {user ? t('signOut') : t('signIn')}
              </Button>
              {/*<Button 
                className="bg-kawaii-pink hover:bg-kawaii-pink/90 text-white rounded-full"
                onClick={() => handleOpenAuth("signup")}
              >
                {t('signUp')}
              </Button>*/}
            </nav>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <LanguageToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-kawaii-pink p-2 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && isOpen && (
          <div className="md:hidden glass-card mt-2 py-4 px-4 rounded-[20px] animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-kawaii-pink hover:text-kawaii-blue transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {t('home')}
              </Link>
              {user && user.role === 'passenger' &&(<Link 
                to="/passenger/dashboard" 
                className="text-kawaii-pink hover:text-kawaii-blue transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {t('passenger')}
              </Link>)}
              {user && user.role === 'driver' &&(<Link 
                to="/driver/dashboard" 
                className="text-kawaii-pink hover:text-kawaii-blue transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {t('driver')}
              </Link>)}
              <div className="pt-2 flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-kawaii-pink/50 text-kawaii-pink hover:bg-kawaii-pink/10"
                  onClick={() => {
                    if (user && token) {
                      checkTokenValidity();
                      if (token) {
                        handleLogOut();
                      } else {
                        handleOpenAuth("signin");
                      }
                    } else {
                      handleOpenAuth("signin");
                    }
                    setIsOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" /> {user && token ? t('signOut') : t('signIn')}
                </Button>
                {/*<Button 
                  className="w-full bg-kawaii-pink hover:bg-kawaii-pink/90 text-white rounded-full"
                  onClick={() => {
                    handleOpenAuth("signup");
                    setIsOpen(false);
                  }}
                >
                  {t('signUp')}
                </Button>*/}
              </div>
            </nav>
          </div>
        )}
      </div>
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
        setMode={setAuthMode}
      />
    </header>
  );
};

export default Navbar;
