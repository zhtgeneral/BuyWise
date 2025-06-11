import '../styles/ProfilePage.css'; 
import { useState } from 'react';
import { selectUser, updateUser } from '../libs/features/userSlice';
import { useSelector, useDispatch } from 'react-redux';

/**
 * This page allows the user to update their info and their preferences.
 */
export default function ProfilePage() {
  const dispatch = useDispatch();  
  /** React useState holds temporary modified state */  
  const [userProfile, setUserProfile] = useState(useSelector(selectUser));

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
              <label className="profile-field-label">Brand Preference:</label>
              <input
                type="text"
                value={userProfile.userPreferences.brandPreference}
                onChange={(e) => handleUserPreferencesChange('brandPreference', e.target.value)}
                className="profile-field__input"
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
          </div>

          <div className="profile-actions">
            <button className="profile-button save" onClick={handleSave}>Save changes</button>
          </div>
        </div>
      </div>
    </main>
  );
}
// Test email
// rizz@mail.com
// RizzRizz1!