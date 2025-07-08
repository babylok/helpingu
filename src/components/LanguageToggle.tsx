
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-2 rounded-full border-kawaii-pink/30 hover:border-kawaii-pink text-sm"
    >
      {language === 'en' ? '繁體中文' : 'English'}
    </Button>
  );
};

export default LanguageToggle;
