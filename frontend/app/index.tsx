import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { initializeToken } from '@/services/api';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('Index: !!! RELOAD CHECK !!! - Starting Auth');
        const token = await initializeToken();
        console.log('Index: Token check result ->', token ? 'TOKEN_FOUND' : 'NO_TOKEN');

        // Small delay to ensure router is ready
        setTimeout(() => {
          setHasToken(!!token);
          setLoading(false);
        }, 300);
      } catch (e) {
        console.error('Index: Auth check failed:', e);
        setHasToken(false);
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return hasToken ? <Redirect href="/future/(tabs)" /> : <Redirect href="/login" />;
}
