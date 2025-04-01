import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { themes } from '@/config/themes';
type ThemeKey = keyof typeof themes;
interface SettingsPanelProps {
  currentTheme: ThemeKey;
    handleThemeChange: (theme: ThemeKey) => void;
  fontSize: string;
  handleFontSizeChange: (size: string) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  themes: Record<string, { primary: string }>;
}

const SettingsPanel = ({
  currentTheme,
  handleThemeChange,
  fontSize,
  handleFontSizeChange,
  isSoundEnabled,
  setIsSoundEnabled,
  themes
}: SettingsPanelProps) => {
  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-40 bg-gray-700 border-gray-600 rounded-md text-white hover:bg-gray-600 transition-colors">
          <div className="flex items-center">
            <SelectValue placeholder="Select theme" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md">
          {Object.keys(themes).map((theme) => (
            <SelectItem 
              key={theme} 
              value={theme} 
              className="hover:bg-gray-600 focus:bg-gray-600"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: themes[theme].primary || '#fff' }}
                />
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger className="w-32 bg-gray-700 border-gray-600 rounded-md text-white hover:bg-gray-600 transition-colors">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Aa</span>
            <SelectValue placeholder="Size" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md">
          <SelectItem value="text-sm" className="hover:bg-gray-600 focus:bg-gray-600">Small</SelectItem>
          <SelectItem value="text-lg" className="hover:bg-gray-600 focus:bg-gray-600">Medium</SelectItem>
          <SelectItem value="text-xl" className="hover:bg-gray-600 focus:bg-gray-600">Large</SelectItem>
          <SelectItem value="text-2xl" className="hover:bg-gray-600 focus:bg-gray-600">X-Large</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        onClick={() => {setIsSoundEnabled(!isSoundEnabled)}}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
      >
        {isSoundEnabled ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            Mute
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            Unmute
          </>
        )}
      </Button>
    </div>
  );
};

export default SettingsPanel;