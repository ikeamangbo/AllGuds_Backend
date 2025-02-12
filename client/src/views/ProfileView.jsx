import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/config/api';
import { toast } from 'react-toastify';
import './ProfileView.css';

const ProfileView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>Please login to view your profile</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  const isSeller = user.role?.toUpperCase() === 'SELLER';

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {/* Add any other user details you want to display */}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
