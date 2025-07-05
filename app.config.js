import 'dotenv/config';

export default {
  expo: {
    name: 'fridgewise-app',
    slug: 'fridgewise-app',
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "We need your permission to access the camera"
      }
    },
    extra: {
      OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
