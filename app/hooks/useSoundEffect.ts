import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export function useSoundEffect(file: any) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(file);
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return playSound;
}
