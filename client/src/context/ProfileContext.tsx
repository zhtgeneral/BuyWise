import React, { createContext, useContext, useState } from 'react';

type User = {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
};

type Preferences = {
  storage_preference: string;
  RAM_preference: string;
  brand_preference: string;
  min_budget: number;
  max_budget: number;
  rating_preference: number;
  country: string;
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
    storage_preference: '128GB',
    RAM_preference: '2GB',
    brand_preference: "None",
    min_budget: 100,
    max_budget: 1000,
    rating_preference: 3,
    country: "Canada",
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