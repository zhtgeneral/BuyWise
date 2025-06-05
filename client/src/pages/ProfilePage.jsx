import '../styles/ProfilePage.css'; 
import { useState } from 'react';

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState({
    name: 'Username',
    email: 'temp@mail.ca',
    seller: {
      budgetMin: '100',
      budgetMax: '1000',
      brandPreference: 'None',
      country: 'Canada',
      ratingPreference: '4',
    },
  });

  const handleChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev, 
      [field]: value
    }));
  };

  const handleSellerChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      seller: {
        ...prev.seller,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // TODO: Save feature to put data into backend
    console.log('Profile saved:', userProfile);
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
                value={userProfile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="profile-field__input"
                autoComplete="name"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Email:</label>
              <input
                type="email"
                value={userProfile.email}
                className="profile-field__input"
                disabled
                autoComplete="email"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Minimum:</label>
              <input
                type="number"
                value={userProfile.seller.budgetMin}
                onChange={(e) => handleSellerChange('budgetMin', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Maximum:</label>
              <input
                type="number"
                value={userProfile.seller.budgetMax}
                onChange={(e) => handleSellerChange('budgetMax', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field-label">Brand Preference:</label>
              <input
                type="text"
                value={userProfile.seller.brandPreference}
                onChange={(e) => handleSellerChange('brandPreference', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Country:</label>
              <input
                type="text"
                value={userProfile.seller.country}
                onChange={(e) => handleSellerChange('country', e.target.value)}
                className="profile-field__input"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Rating Preference:</label>
              <input
                type="number"
                value={userProfile.seller.ratingPreference}
                onChange={(e) => handleSellerChange('ratingPreference', e.target.value)}
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