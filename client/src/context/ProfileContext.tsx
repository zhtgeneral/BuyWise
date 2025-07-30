import React, { createContext, useContext, useState } from 'react';

type User = {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
};

type Preferences = {
  country: string;
  max_products_per_search: number;
  price_sort_preference: string;
  allow_ai_personalization: boolean;
  response_style: string;
  minimum_rating_threshold: number;
  exclude_unrated_products: boolean;
};

type Profile = {
  user: User;
  preferences: Preferences;
};

const initialState: Profile = {
  user: {
    _id: 'No id',
    name: "No name",
    email: "No email",
    isEmailVerified: false,
  },
  preferences: {
    country: "Canada",
    max_products_per_search: 5,
    price_sort_preference: "lowest_first",
    allow_ai_personalization: true,
    response_style: "conversational",
    minimum_rating_threshold: 3,
    exclude_unrated_products: false,
  }
};

type ProfileContextType = {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  updateUser: (userData: Partial<User>) => void;
  updatePreferences: (preferencesData: Partial<Preferences>) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const testing = false;
export const ProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(initialState);

  React.useEffect(() => {
    if (testing) console.log("ProfileProvider got profile: " + JSON.stringify(profile, null, 2));
  }, [profile])

  const updateUser = (userData: Partial<User>) => {
    setProfile(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...userData
      }
    }));
  };

  const updatePreferences = (preferencesData: Partial<Preferences>) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferencesData
      }
    }));
  };

  return (
    <ProfileContext.Provider 
      value={{ profile, setProfile, updateUser, updatePreferences }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};