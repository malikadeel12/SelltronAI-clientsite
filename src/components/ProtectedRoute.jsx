import React from 'react';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, getAuth, getIdToken, reload } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ProtectedRoute = ({ children, requireEmailVerification = true }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User not logged in, redirect to login
        navigate('/login');
        return;
      }

      setUser(user);
      
      if (requireEmailVerification) {
        // Check if email is verified
        if (!user.emailVerified) {
          // Check if this is a newly created user (within last 30 seconds)
          const userCreationTime = new Date(user.metadata.creationTime);
          const now = new Date();
          const timeDiff = (now - userCreationTime) / 1000; // seconds
          
          if (timeDiff < 30) {
            // Newly created user, try to reload user data to get latest emailVerified status
            console.log('Newly created user, reloading user to check emailVerified status...');
            try {
              // Force user reload to get latest user data from Firebase
              await reload(user);
              console.log('✅ User reloaded successfully');
              
              // Re-check the user object after reload
              const reloadedUser = auth.currentUser;
              if (reloadedUser && reloadedUser.emailVerified) {
                console.log('✅ Email verification confirmed after user reload');
                setEmailVerified(true);
              } else {
                console.log('❌ Email still not verified after user reload');
                // Don't allow access - redirect to login with verification message
                navigate('/login', { 
                  state: { 
                    message: 'Please complete email verification before accessing the dashboard.',
                    email: user.email,
                    needsVerification: true
                  } 
                });
                return;
              }
            } catch (error) {
              console.warn('Failed to reload user:', error);
              // Don't allow access if we can't verify status
              navigate('/login', { 
                state: { 
                  message: 'Please complete email verification before accessing the dashboard.',
                  email: user.email,
                  needsVerification: true
                } 
              });
              return;
            }
          } else {
            // Existing user with unverified email
            navigate('/login', { 
              state: { 
                message: 'Please verify your email before accessing the dashboard.',
                email: user.email 
              } 
            });
            return;
          }
        } else {
          console.log('✅ Email is verified, allowing access');
          setEmailVerified(true);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, requireEmailVerification]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D72638]"></div>
      </div>
    );
  }

  if (!user || (requireEmailVerification && !emailVerified)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
