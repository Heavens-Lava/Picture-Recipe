// hooks/useRequireAuth.ts
// This page is used to check if the user is authenticated before allowing access to certain routes.
// If the user is not authenticated, they are redirected to the CreateAccount page.
// It is placed in each main tab in the navigation bar to ensure that the user is authenticated before accessing any of the main tabs.
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export const useRequireAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('../othertabs/CreateAccount');
      }
    };

    checkAuth();
  }, []);
};
