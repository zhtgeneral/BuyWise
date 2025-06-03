import { useState } from 'react';
import EditableProfileField from '../components/EditableProfileField';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: 'Chris Kerslake',
    email: 'ckerslake@ubc.ca',
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
    //TODO: Save feature to put data into backend
    setIsEditing(false);
  };

  return (
    <main>
      <h2>User Profile</h2>

      <div>
        <EditableProfileField 
          label="Name:"
          value={userProfile.name}
          isEditing={isEditing}
          onChange={val => handleChange('name', val)}
          type="name"
        />
      </div>

      <div>
        <EditableProfileField 
          label="Email:"
          value={userProfile.email}
          isEditing={isEditing}
          onChange={val => handleChange('email', val)}
          type="email"
        />
      </div>

      <h3>Buyer Profile</h3>
      <div>
        <EditableProfileField 
          label="Budget Minimum:"
          value={userProfile.seller.budgetMin}
          isEditing={isEditing}
          onChange={val => handleChange('budgetMin', val)}
          type="number"
        />
      </div>
      <div>
        <EditableProfileField 
          label="Budget Maximum:"
          value={userProfile.seller.budgetMax}
          isEditing={isEditing}
          onChange={val => handleChange('budgetMax', val)}
          type="number"
        />
      </div>
      <div>
        <EditableProfileField 
          label="Brand Preference:"
          value={userProfile.seller.brandPreference}
          isEditing={isEditing}
          onChange={val => handleChange('brandPreference', val)}
          type="text"
        />
      </div>
      <div>
        <EditableProfileField 
          label="Country:"
          value={userProfile.seller.country}
          isEditing={isEditing}
          onChange={val => handleChange('country', val)}
          type="text"
        />
      </div>
      <div>
        <EditableProfileField 
          label="Rating Preference:"
          value={userProfile.seller.ratingPreference}
          isEditing={isEditing}
          onChange={val => handleChange('ratingPreference', val)}
          type="number"
        />
      </div>

      <div>
        {isEditing ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
    </main>
  );
}