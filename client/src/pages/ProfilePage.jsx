import '../styles/ProfilePage.css'; 
import { useState } from 'react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: 'First last',
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
    setIsEditing(false);
  };

  return (
    <main className="profile-container">
      <div className="profile-scrollable">
        <div className="profile-padding">
          <h1 className="profile-header">User Profile</h1>

          <div className="profile-section">
            <div className="profile-field">
              <label className="profile-field__label">Name:</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
                autoComplete="name"
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Email:</label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
                autoComplete="email"
              />
            </div>
          </div>

          <h2 className="profile-subheader">Buyer Profile</h2>
          <div className="profile-section">
            <div className="profile-field">
              <label className="profile-field__label">Budget Minimum:</label>
              <input
                type="number"
                value={userProfile.seller.budgetMin}
                onChange={(e) => handleSellerChange('budgetMin', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Budget Maximum:</label>
              <input
                type="number"
                value={userProfile.seller.budgetMax}
                onChange={(e) => handleSellerChange('budgetMax', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Brand Preference:</label>
              <input
                type="text"
                value={userProfile.seller.brandPreference}
                onChange={(e) => handleSellerChange('brandPreference', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Country:</label>
              <input
                type="text"
                value={userProfile.seller.country}
                onChange={(e) => handleSellerChange('country', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Rating Preference:</label>
              <input
                type="number"
                value={userProfile.seller.ratingPreference}
                onChange={(e) => handleSellerChange('ratingPreference', e.target.value)}
                className="profile-field__input"
                disabled={!isEditing}
                min="1"
                max="5"
              />
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="profile-button save" onClick={handleSave}>Save</button>
                <button className="profile-button cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="profile-button edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}