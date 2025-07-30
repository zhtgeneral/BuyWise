import '../styles/ProfilePage.css'; 
import { useState } from 'react';
import { selectProfile, updateProfile } from '../libs/features/profileSlice';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { selectIsAuthenticated } from '../libs/features/authenticationSlice';

const backendURL = import.meta.env.backendURL || 'http://localhost:3000';
const debug = false;
/**
 * This page allows the user to update their info and their preferences.
 */
export default function ProfilePage() {
  const dispatch = useDispatch();  
  const profile = useSelector(selectProfile);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [localProfile, setLocalProfile] = useState(profile);

  const handleUserOptionsChange = (field, value) => {
    setLocalProfile(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value
      }
    }));
  };

  const handleUserPreferencesChange = (field, value) => {
    setLocalProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  function handleSave () {
    if (debug) console.log("ProfilePage saved user profile: " + JSON.stringify(localProfile, null, 2));
    
    if (!isAuthenticated) {
      alert('You are not authenticated. Please login again.');
      return;
    }

    const token = localStorage.getItem('token');
    
    axios.patch(`${backendURL}/api/profiles/${profile.user._id}`, 
      {
        profileData: {
          storage_preference: localProfile.preferences.storage_preference,
          RAM_preference: localProfile.preferences.RAM_preference,
          brand_preference: localProfile.preferences.brand_preference,
          min_budget: localProfile.preferences.min_budget,
          max_budget: localProfile.preferences.max_budget,
          rating_preference: localProfile.preferences.rating_preference,
          country: localProfile.preferences.country
        }
      }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).then((response) => {
      if (response.status === 200) {
        dispatch(updateProfile(localProfile));
        alert('Profile updated successfully!');
      }
    }).catch((error) => {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    });
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
                value={localProfile.user.name}
                onChange={(e) => handleUserOptionsChange('name', e.target.value)}
                className="profile-field__input"
                autoComplete="name"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Email:</label>
              <input
                type="email"
                value={localProfile.user.email}
                className="profile-field__input"
                disabled
                autoComplete="email"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Storage Preference:</label>
              <select
                value={localProfile.preferences.storage_preference}
                onChange={(e) => handleUserPreferencesChange('storage_preference', e.target.value)}
                className="profile-field__input"
              >
                <option value="None">None</option>
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB+">1TB+</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">RAM Preference:</label>
              <select
                value={localProfile.preferences.RAM_preference}
                onChange={(e) => handleUserPreferencesChange('RAM_preference', e.target.value)}
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
                value={localProfile.preferences.brand_preference}
                onChange={(e) => handleUserPreferencesChange('brand_preference', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Minimum:</label>
              <input
                type="number"
                value={localProfile.preferences.min_budget}
                onChange={(e) => handleUserPreferencesChange('min_budget', Number(e.target.value))}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Maximum:</label>
              <input
                type="number"
                value={localProfile.preferences.max_budget}
                onChange={(e) => handleUserPreferencesChange('max_budget', Number(e.target.value))}
                className="profile-field__input"
              />
            </div>            
            <div className="profile-field">
              <label className="profile-field__label">Rating Preference:</label>
              <input
                type="number"
                value={localProfile.preferences.rating_preference}
                onChange={(e) => handleUserPreferencesChange('rating_preference', Number(e.target.value))}
                className="profile-field__input"
                min="1"
                max="5"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Country:</label>
              <input
                type="text"
                value={localProfile.preferences.country}
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