'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Language = 'en' | 'hi' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary for English, Hindi, and Malayalam
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'home': 'Home',
    'products': 'Products',
    'categories': 'Categories',
    'orders': 'Orders',
    'wishlist': 'Wishlist',
    'cart': 'Cart',
    'profile': 'Profile',
    'settings': 'Settings',
    'logout': 'Logout',
    'login': 'Login',
    'signup': 'Sign Up',
    'search': 'Search',
    
    // Account
    'my_account': 'My Account',
    'account_settings': 'Account Settings',
    'personal_info': 'Personal Information',
    'shipping_address': 'Shipping Address',
    'payment_methods': 'Payment Methods',
    'order_history': 'Order History',
    
    // Theme & Language
    'language': 'Language',
    'theme': 'Theme',
    'light': 'Light',
    'dark': 'Dark',
    'auto': 'Auto',
    'language_appearance': 'Language & Appearance',
    'customize_interface': 'Customize your interface language and theme',
    
    // Notifications
    'notifications': 'Notifications',
    'email_notifications': 'Email Notifications',
    'push_notifications': 'Push Notifications',
    'sms_notifications': 'SMS Notifications',
    'order_updates': 'Order Updates',
    'promotional_offers': 'Promotional Offers',
    
    // Privacy
    'privacy': 'Privacy',
    'profile_visibility': 'Profile Visibility',
    'public': 'Public',
    'private': 'Private',
    'show_activity': 'Show Activity',
    
    // Accessibility
    'accessibility': 'Accessibility',
    'font_size': 'Font Size',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'high_contrast': 'High Contrast',
    'reduced_motion': 'Reduced Motion',
    
    // Common actions
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'remove': 'Remove',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'submit': 'Submit',
    'confirm': 'Confirm',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    
    // Messages
    'settings_saved': 'Settings saved successfully',
    'settings_error': 'Failed to save settings',
    'settings_reset': 'Settings reset to default',
    'welcome': 'Welcome',
    'goodbye': 'Goodbye',
    
    // Product related
    'price': 'Price',
    'quantity': 'Quantity',
    'total': 'Total',
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    'out_of_stock': 'Out of Stock',
    'in_stock': 'In Stock',
    'description': 'Description',
    'reviews': 'Reviews',
    'rating': 'Rating',
    
    // Payment
    'payments': 'Payments',
    'wallet': 'Wallet',
    'balance': 'Balance',
    'checkout': 'Checkout',
    'payment_method': 'Payment Method',
    'shipping': 'Shipping',
    'billing': 'Billing',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'malayalam': 'മലയാളം',
    
    // Settings page specific
    'customize_shopping_experience': 'Customize your shopping experience with language, theme, and notification preferences.',
    'back_to_profile': 'Back to profile',
    'manage_notification_preferences': 'Manage your notification preferences',
    'control_privacy_settings': 'Control your privacy settings',
    'show_activity_status': 'Show activity status',
    'customize_accessibility_options': 'Customize accessibility options',
    'high_contrast_mode': 'High contrast mode',
    'save_changes': 'Save Changes',
    'reset_to_default': 'Reset to Default',
    'saving': 'Saving...',
    'loading_settings': 'Loading settings...',
    'account': 'Account',
  },
  hi: {
    // Navigation
    'home': 'होम',
    'products': 'उत्पाद',
    'categories': 'श्रेणियाँ',
    'orders': 'ऑर्डर',
    'wishlist': 'इच्छा सूची',
    'cart': 'कार्ट',
    'profile': 'प्रोफ़ाइल',
    'settings': 'सेटिंग्स',
    'logout': 'लॉग आउट',
    'login': 'लॉग इन',
    'signup': 'साइन अप',
    'search': 'खोजें',
    
    // Account
    'my_account': 'मेरा खाता',
    'account_settings': 'खाता सेटिंग्स',
    'personal_info': 'व्यक्तिगत जानकारी',
    'shipping_address': 'शिपिंग पता',
    'payment_methods': 'भुगतान विधियाँ',
    'order_history': 'ऑर्डर इतिहास',
    
    // Theme & Language
    'language': 'भाषा',
    'theme': 'थीम',
    'light': 'लाइट',
    'dark': 'डार्क',
    'auto': 'ऑटो',
    'language_appearance': 'भाषा और दिखावट',
    'customize_interface': 'अपनी इंटरफ़ेस भाषा और थीम को कस्टमाइज़ करें',
    
    // Notifications
    'notifications': 'नोटिफिकेशन',
    'email_notifications': 'ईमेल नोटिफिकेशन',
    'push_notifications': 'पुश नोटिफिकेशन',
    'sms_notifications': 'एसएमएस नोटिफिकेशन',
    'order_updates': 'ऑर्डर अपडेट',
    'promotional_offers': 'प्रोमोशनल ऑफर',
    
    // Privacy
    'privacy': 'गोपनीयता',
    'profile_visibility': 'प्रोफ़ाइल दृश्यता',
    'public': 'सार्वजनिक',
    'private': 'निजी',
    'show_activity': 'गतिविधि दिखाएं',
    
    // Accessibility
    'accessibility': 'पहुंच',
    'font_size': 'फ़ॉन्ट आकार',
    'small': 'छोटा',
    'medium': 'मध्यम',
    'large': 'बड़ा',
    'high_contrast': 'उच्च कंट्रास्ट',
    'reduced_motion': 'कम गति',
    
    // Common actions
    'save': 'सहेजें',
    'cancel': 'रद्द करें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'add': 'जोड़ें',
    'remove': 'हटाएं',
    'back': 'वापस',
    'next': 'अगला',
    'previous': 'पिछला',
    'submit': 'जमा करें',
    'confirm': 'पुष्टि करें',
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    
    // Messages
    'settings_saved': 'सेटिंग्स सफलतापूर्वक सहेजी गईं',
    'settings_error': 'सेटिंग्स सहेजने में विफल',
    'settings_reset': 'सेटिंग्स डिफ़ॉल्ट पर रीसेट की गईं',
    'welcome': 'स्वागत है',
    'goodbye': 'अलविदा',
    
    // Product related
    'price': 'मूल्य',
    'quantity': 'मात्रा',
    'total': 'कुल',
    'add_to_cart': 'कार्ट में जोड़ें',
    'buy_now': 'अभी खरीदें',
    'out_of_stock': 'स्टॉक में नहीं',
    'in_stock': 'स्टॉक में',
    'description': 'विवरण',
    'reviews': 'समीक्षाएं',
    'rating': 'रेटिंग',
    
    // Payment
    'payments': 'भुगतान',
    'wallet': 'वॉलेट',
    'balance': 'बैलेंस',
    'checkout': 'चेकआउट',
    'payment_method': 'भुगतान विधि',
    'shipping': 'शिपिंग',
    'billing': 'बिलिंग',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'malayalam': 'മലയാളം',
    
    // Settings page specific
    'customize_shopping_experience': 'भाषा, थीम और नोटिफिकेशन प्राथमिकताओं के साथ अपनी खरीदारी का अनुभव कस्टमाइज़ करें।',
    'back_to_profile': 'प्रोफ़ाइल पर वापस जाएं',
    'manage_notification_preferences': 'अपनी नोटिफिकेशन प्राथमिकताएं प्रबंधित करें',
    'control_privacy_settings': 'अपनी गोपनीयता सेटिंग्स नियंत्रित करें',
    'show_activity_status': 'गतिविधि स्थिति दिखाएं',
    'customize_accessibility_options': 'पहुंच विकल्प कस्टमाइज़ करें',
    'high_contrast_mode': 'उच्च कंट्रास्ट मोड',
    'save_changes': 'परिवर्तन सहेजें',
    'reset_to_default': 'डिफ़ॉल्ट पर रीसेट करें',
    'saving': 'सहेज रहा है...',
    'loading_settings': 'सेटिंग्स लोड हो रही हैं...',
    'account': 'खाता',
  },
  ml: {
    // Navigation
    'home': 'ഹോം',
    'products': 'ഉൽപ്പന്നങ്ങൾ',
    'categories': 'വിഭാഗങ്ങൾ',
    'orders': 'ഓർഡറുകൾ',
    'wishlist': 'ആഗ്രഹങ്ങൾ',
    'cart': 'കാർട്ട്',
    'profile': 'പ്രൊഫൈൽ',
    'settings': 'ക്രമീകരണങ്ങൾ',
    'logout': 'ലോഗ് ഔട്ട്',
    'login': 'ലോഗിൻ',
    'signup': 'സൈൻ അപ്പ്',
    'search': 'തിരയുക',
    
    // Account
    'my_account': 'എന്റെ അക്കൗണ്ട്',
    'account_settings': 'അക്കൗണ്ട് ക്രമീകരണങ്ങൾ',
    'personal_info': 'വ്യക്തിഗത വിവരങ്ങൾ',
    'shipping_address': 'ഷിപ്പിംഗ് വിലാസം',
    'payment_methods': 'പേയ്‌മെന്റ് രീതികൾ',
    'order_history': 'ഓർഡർ ചരിത്രം',
    
    // Theme & Language
    'language': 'ഭാഷ',
    'theme': 'തീം',
    'light': 'ലൈറ്റ്',
    'dark': 'ഡാർക്ക്',
    'auto': 'ഓട്ടോ',
    'language_appearance': 'ഭാഷയും രൂപഭംഗിയും',
    'customize_interface': 'നിങ്ങളുടെ ഇന്റർഫേസ് ഭാഷയും തീമും ഇഷ്ടാനുസരണം മാറ്റുക',
    
    // Notifications
    'notifications': 'അറിയിപ്പുകൾ',
    'email_notifications': 'ഇമെയിൽ അറിയിപ്പുകൾ',
    'push_notifications': 'പുഷ് അറിയിപ്പുകൾ',
    'sms_notifications': 'എസ്എംഎസ് അറിയിപ്പുകൾ',
    'order_updates': 'ഓർഡർ അപ്ഡേറ്റുകൾ',
    'promotional_offers': 'പ്രൊമോഷണൽ ഓഫറുകൾ',
    
    // Privacy
    'privacy': 'സ്വകാര്യത',
    'profile_visibility': 'പ്രൊഫൈൽ ദൃശ്യത',
    'public': 'പൊതു',
    'private': 'സ്വകാര്യ',
    'show_activity': 'പ്രവർത്തനം കാണിക്കുക',
    
    // Accessibility
    'accessibility': 'പ്രവേശനക്ഷമത',
    'font_size': 'ഫോണ്ട് വലുപ്പം',
    'small': 'ചെറുത്',
    'medium': 'ഇടത്തരം',
    'large': 'വലുത്',
    'high_contrast': 'ഉയർന്ന കോൺട്രാസ്റ്റ്',
    'reduced_motion': 'കുറഞ്ഞ ചലനം',
    
    // Common actions
    'save': 'സേവ്',
    'cancel': 'റദ്ദാക്കുക',
    'delete': 'ഇല്ലാതാക്കുക',
    'edit': 'എഡിറ്റ്',
    'add': 'ചേർക്കുക',
    'remove': 'നീക്കം ചെയ്യുക',
    'back': 'പിന്നോട്ട്',
    'next': 'അടുത്തത്',
    'previous': 'മുൻപത്തേത്',
    'submit': 'സമർപ്പിക്കുക',
    'confirm': 'സ്ഥിരീകരിക്കുക',
    'loading': 'ലോഡ് ചെയ്യുന്നു...',
    'error': 'പിശക്',
    'success': 'വിജയം',
    
    // Messages
    'settings_saved': 'ക്രമീകരണങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു',
    'settings_error': 'ക്രമീകരണങ്ങൾ സേവ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു',
    'settings_reset': 'ക്രമീകരണങ്ങൾ ഡിഫോൾട്ടിലേക്ക് റീസെറ്റ് ചെയ്തു',
    'welcome': 'സ്വാഗതം',
    'goodbye': 'വിട',
    
    // Product related
    'price': 'വില',
    'quantity': 'അളവ്',
    'total': 'ആകെ',
    'add_to_cart': 'കാർട്ടിലേക്ക് ചേർക്കുക',
    'buy_now': 'ഇപ്പോൾ വാങ്ങുക',
    'out_of_stock': 'സ്റ്റോക്കിലില്ല',
    'in_stock': 'സ്റ്റോക്കിലുണ്ട്',
    'description': 'വിവരണം',
    'reviews': 'അവലോകനങ്ങൾ',
    'rating': 'റേറ്റിംഗ്',
    
    // Payment
    'payments': 'പേയ്‌മെന്റുകൾ',
    'wallet': 'വാലറ്റ്',
    'balance': 'ബാലൻസ്',
    'checkout': 'ചെക്ക്ഔട്ട്',
    'payment_method': 'പേയ്‌മെന്റ് രീതി',
    'shipping': 'ഷിപ്പിംഗ്',
    'billing': 'ബില്ലിംഗ്',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'malayalam': 'മലയാളം',
    
    // Settings page specific
    'customize_shopping_experience': 'ഭാഷ, തീം, അറിയിപ്പ് മുൻഗണനകൾ എന്നിവയുമായി നിങ്ങളുടെ ഷോപ്പിംഗ് അനുഭവം ഇഷ്ടാനുസരണം മാറ്റുക.',
    'back_to_profile': 'പ്രൊഫൈലിലേക്ക് മടങ്ങുക',
    'manage_notification_preferences': 'നിങ്ങളുടെ അറിയിപ്പ് മുൻഗണനകൾ നിയന്ത്രിക്കുക',
    'control_privacy_settings': 'നിങ്ങളുടെ സ്വകാര്യത ക്രമീകരണങ്ങൾ നിയന്ത്രിക്കുക',
    'show_activity_status': 'പ്രവർത്തന നില കാണിക്കുക',
    'customize_accessibility_options': 'പ്രവേശനക്ഷമത ഓപ്ഷനുകൾ ഇഷ്ടാനുസരണം മാറ്റുക',
    'high_contrast_mode': 'ഉയർന്ന കോൺട്രാസ്റ്റ് മോഡ്',
    'save_changes': 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക',
    'reset_to_default': 'ഡിഫോൾട്ടിലേക്ക് റീസെറ്റ് ചെയ്യുക',
    'saving': 'സേവ് ചെയ്യുന്നു...',
    'loading_settings': 'ക്രമീകരണങ്ങൾ ലോഡ് ചെയ്യുന്നു...',
    'account': 'അക്കൗണ്ട്',
  },
};

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: Language | null | undefined }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // For authenticated users: prioritize server preferences (initialLanguage) over localStorage
    if (initialLanguage !== null && initialLanguage !== undefined) {
      const validLanguages: Language[] = ['en', 'hi', 'ml'];
      if (validLanguages.includes(initialLanguage)) {
        console.log('LanguageProvider: Initializing with server language:', initialLanguage);
        return initialLanguage;
      } else {
        console.log('LanguageProvider: Invalid server language, defaulting to en:', initialLanguage);
        return 'en';
      }
    }
    // For unauthenticated users or when initialLanguage is null: use localStorage or default
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('bellescart_language') as Language;
      const validLanguages: Language[] = ['en', 'hi', 'ml'];
      if (savedLanguage && validLanguages.includes(savedLanguage)) {
        console.log('LanguageProvider: Initializing with localStorage language:', savedLanguage);
        return savedLanguage;
      } else if (savedLanguage) {
        // Handle old language codes by resetting to default
        console.log('LanguageProvider: Old language code in localStorage, resetting to default:', savedLanguage);
        localStorage.setItem('bellescart_language', 'en');
      }
    }
    console.log('LanguageProvider: Initializing with default language: en');
    return 'en';
  });
  
  // Add a ref to track if we've applied the initial language
  const hasAppliedInitialLanguage = useRef(false);

  // Sync language state when initialLanguage prop changes (from UserPreferencesProvider)
  // Only update from initialLanguage if we haven't applied it yet
  useEffect(() => {
    if (initialLanguage !== null && initialLanguage !== undefined && !hasAppliedInitialLanguage.current) {
      const validLanguages: Language[] = ['en', 'hi', 'ml'];
      if (validLanguages.includes(initialLanguage)) {
        console.log('LanguageProvider: Applying initial language from server:', initialLanguage);
        setLanguageState(initialLanguage);
        localStorage.setItem('bellescart_language', initialLanguage);
        hasAppliedInitialLanguage.current = true;
      } else {
        console.log('LanguageProvider: Invalid initialLanguage prop, ignoring:', initialLanguage);
      }
    } else if (initialLanguage === null) {
      // User is not authenticated, clear localStorage and reset to default
      console.log('LanguageProvider: User not authenticated, resetting to default language');
      setLanguageState('en');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bellescart_language');
      }
      hasAppliedInitialLanguage.current = false;
    }
  }, [initialLanguage]);

  // Update document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((newLanguage: Language) => {
    console.log('Setting language to:', newLanguage);
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bellescart_language', newLanguage);
    }
  }, []);



  // Listen for localStorage changes (e.g., from other tabs or server updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bellescart_language' && e.newValue) {
        const newLanguage = e.newValue as Language;
        const validLanguages: Language[] = ['en', 'hi', 'ml'];
        if (validLanguages.includes(newLanguage)) {
          setLanguageState(newLanguage);
        }
      }
    };

    // Listen for custom events (same-tab updates from server preferences)
    const handleCustomLanguageChange = (e: CustomEvent) => {
      const newLanguage = e.detail as Language;
      const validLanguages: Language[] = ['en', 'hi', 'ml'];
      if (validLanguages.includes(newLanguage)) {
        setLanguageState(newLanguage);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('bellescart_language_change', handleCustomLanguageChange as EventListener);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('bellescart_language_change', handleCustomLanguageChange as EventListener);
      };
    }
  }, []);

  const t = useCallback((key: string): string => {
    if (!translations[language]) {
      console.error(`Language "${language}" not found in translations`);
      return translations['en'][key] || key;
    }
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}