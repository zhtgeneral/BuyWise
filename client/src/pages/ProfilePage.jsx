import '../styles/ProfilePage.css'; 
import { useState } from 'react';
import { selectUser, updateUser } from '../libs/features/userSlice';
import { useSelector, useDispatch } from 'react-redux';

/**
 * This page allows the user to update their info and their preferences.
 */
export default function ProfilePage() {
  const dispatch = useDispatch();  
  const currentUser = useSelector(selectUser);
  /** React useState holds temporary modified state */  
  const [userProfile, setUserProfile] = useState(currentUser);

  const handleUserOptionsChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      userOptions: {
        ...prev.userOptions,
        [field]: value
      }
    }));
  };

  const handleUserPreferencesChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    dispatch(updateUser(userProfile));
  };

  return (
    <main className="profile-container">
      <div className="profile-scrollable">
        <div className="profile-padding">
          <h1 className="profile-header">Edit your preferences</h1>
          <div className="profile-section">
            <div className="profile-field">
              <label className="profile-field__label">Display name:</label>
              <input
                type="text"
                value={userProfile.userOptions.username}
                onChange={(e) => handleUserOptionsChange('username', e.target.value)}
                className="profile-field__input"
                autoComplete="name"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Email:</label>
              <input
                type="email"
                value={userProfile.userOptions.email}
                className="profile-field__input"
                disabled
                autoComplete="email"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Storage Preference:</label>
              <select
                value={userProfile.userPreferences.storagePreference}
                onChange={(e) => handleUserPreferencesChange('storagePreference', e.target.value)}
                className="profile-field__input"
              >
                <option value="None">None</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB+">1TB+</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">RAM Preference:</label>
              <select
                value={userProfile.userPreferences.RAMPreference}
                onChange={(e) => handleUserPreferencesChange('RAMPreference', e.target.value)}
                className="profile-field__input"
              >
                <option value="None">None</option>
                <option value="2GB">2GB</option>
                <option value="4GB">4GB</option>
                <option value="8GB">8GB</option>
                <option value="16GB">16GB</option>
                <option value="32GB+">32GB+</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Brand Preference:</label>
              <input
                type="text"
                value={userProfile.userPreferences.brandPreference}
                onChange={(e) => handleUserPreferencesChange('brandPreference', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Minimum:</label>
              <input
                type="number"
                value={userProfile.userPreferences.budgetMin}
                onChange={(e) => handleUserPreferencesChange('budgetMin', Number(e.target.value))}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Maximum:</label>
              <input
                type="number"
                value={userProfile.userPreferences.budgetMax}
                onChange={(e) => handleUserPreferencesChange('budgetMax', Number(e.target.value))}
                className="profile-field__input"
              />
            </div>            
            <div className="profile-field">
              <label className="profile-field__label">Rating Preference:</label>
              <input
                type="number"
                value={userProfile.userPreferences.ratingPreference}
                onChange={(e) => handleUserPreferencesChange('ratingPreference', Number(e.target.value))}
                className="profile-field__input"
                min="1"
                max="5"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Country:</label>
              <input
                type="text"
                value={userProfile.userPreferences.country}
                onChange={(e) => handleUserPreferencesChange('country', e.target.value)}
                className="profile-field__input"
              />
            </div>
          </div>
          <button className="profile-button" onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </main>
  );
}
// Test email
// rizz@mail.ca
// RizzRizz1!

// test@mail.ca
// TESTtest1!