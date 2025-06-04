import '../styles/ProfilePage.css'; 
import { useState } from 'react';
import EditableProfileField from '../components/EditableProfileField';

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
      seller: {
        ...prev.seller,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: Save feature to put data into backend
    setIsEditing(false);
  };

  return (
    <main className="profile-container">
      <div className="profile-padding">
        <h1 className="profile-header">User Profile</h1>

        <div className="profile-section">
          <EditableProfileField 
            label="Name:"
            value={userProfile.name}
            isEditing={isEditing}
            onChange={val => handleChange('name', val)}
            type="text"
          />
          <EditableProfileField 
            label="Email:"
            value={userProfile.email}
            isEditing={isEditing}
            onChange={val => handleChange('email', val)}
            type="email"
          />
        </div>

        <h2 className="profile-subheader">Buyer Profile</h2>
        <div className="profile-scrollable">
          <EditableProfileField 
            label="Budget Minimum:"
            value={userProfile.seller.budgetMin}
            isEditing={isEditing}
            onChange={val => handleChange('budgetMin', val)}
            type="number"
          />
          <EditableProfileField 
            label="Budget Maximum:"
            value={userProfile.seller.budgetMax}
            isEditing={isEditing}
            onChange={val => handleChange('budgetMax', val)}
            type="number"
          />
          <EditableProfileField 
            label="Brand Preference:"
            value={userProfile.seller.brandPreference}
            isEditing={isEditing}
            onChange={val => handleChange('brandPreference', val)}
            type="text"
          />
          <EditableProfileField 
            label="Country:"
            value={userProfile.seller.country}
            isEditing={isEditing}
            onChange={val => handleChange('country', val)}
            type="text"
          />
          <EditableProfileField 
            label="Rating Preference:"
            value={userProfile.seller.ratingPreference}
            isEditing={isEditing}
            onChange={val => handleChange('ratingPreference', val)}
            type="number"
          />
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
    </main>
  );
}