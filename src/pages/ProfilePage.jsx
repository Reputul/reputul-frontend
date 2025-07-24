// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
        setNewName(res.data.name);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        'http://localhost:8080/api/users/profile',
        { name: newName, password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage('Profile updated successfully!');
      setNewPassword('');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Your Profile</h2>
      <p><strong>Email:</strong> {profile.email}</p>

      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Name:</label><br />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>New Password:</label><br />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Update Profile</button>

        {successMessage && (
          <p style={{ color: 'green', marginTop: '1rem' }}>{successMessage}</p>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;
