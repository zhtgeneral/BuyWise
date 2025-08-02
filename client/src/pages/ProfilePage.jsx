import '../styles/ProfilePage.css'; 
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { selectProfile, updateProfile } from '../libs/features/profileSlice';
import { selectIsAuthenticated } from '../libs/features/authenticationSlice';
import Browser from '../utils/browser';

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
    
    axios.patch(`${backendURL}/api/profiles/${profile.user._id}`, 
      {
        profileData: {
          name: localProfile.preferences.name,
          country: localProfile.preferences.country,
          max_products_per_search: localProfile.preferences.max_products_per_search,
          price_sort_preference: localProfile.preferences.price_sort_preference,
          allow_ai_personalization: localProfile.preferences.allow_ai_personalization,
          response_style: localProfile.preferences.response_style,
          minimum_rating_threshold: localProfile.preferences.minimum_rating_threshold,
          exclude_unrated_products: localProfile.preferences.exclude_unrated_products
        }
      }, 
      {
        headers: {
          'Authorization': `Bearer ${Browser.getToken()}`
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
                className="profile-field__input"
                autoComplete="name"
                disabled
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
              <label className="profile-field__label">Location:</label>
              <input
                type="text"
                value={localProfile.preferences.country}
                onChange={(e) => handleUserPreferencesChange('country', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Max Products Per Search:</label>
              <input
                type="number"
                value={localProfile.preferences.max_products_per_search}
                onChange={(e) => handleUserPreferencesChange('max_products_per_search', Number(e.target.value))}
                className="profile-field__input"
                min="1"
                max="10"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Price Sort Preference:</label>
              <select
                value={localProfile.preferences.price_sort_preference}
                onChange={(e) => handleUserPreferencesChange('price_sort_preference', e.target.value)}
                className="profile-field__input"
              >
                <option value="lowest_first">Lowest First</option>
                <option value="highest_first">Highest First</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Allow AI Personalization:</label>
              <select
                value={localProfile.preferences.allow_ai_personalization}
                onChange={(e) => handleUserPreferencesChange('allow_ai_personalization', e.target.value === 'true')}
                className="profile-field__input"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Response Style:</label>
              <select
                value={localProfile.preferences.response_style}
                onChange={(e) => handleUserPreferencesChange('response_style', e.target.value)}
                className="profile-field__input"
              >
                <option value="concise">Concise</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Minimum Rating Threshold:</label>
              <input
                type="number"
                value={localProfile.preferences.minimum_rating_threshold}
                onChange={(e) => handleUserPreferencesChange('minimum_rating_threshold', Number(e.target.value))}
                className="profile-field__input"
                min="1"
                max="5"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Exclude Unrated Products:</label>
              <select
                value={localProfile.preferences.exclude_unrated_products}
                onChange={(e) => handleUserPreferencesChange('exclude_unrated_products', e.target.value === 'true')}
                className="profile-field__input"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
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