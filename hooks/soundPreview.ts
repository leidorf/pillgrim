import { useEffect, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { NotificationSound } from "../utils/notificationSounds";

import apocSound from "../assets/sounds/apoc_sound.wav";
import dozerSound from "../assets/sounds/dozer_sound.wav";
import mouseSound from "../assets/sounds/mouse_sound.wav";
import switchSound from "../assets/sounds/switch_sound.wav";
import tankSound from "../assets/sounds/tank_sound.wav";

type AudioSource = number | string | null;

const soundAssets: Record<
  Exclude<NotificationSound, "silent" | "default">,
  AudioSource
> = {
  apoc_sound: apocSound,
  dozer_sound: dozerSound,
  mouse_sound: mouseSound,
  switch_sound: switchSound,
  tank_sound: tankSound,
};

export const SoundPreviewer = ({
  sound,
  onFinish,
}: {
  sound: NotificationSound | null;
  onFinish?: () => void;
}) => {
  const [source, setSource] = useState<AudioSource>(null);

  useEffect(() => {
    if (!sound || sound === "silent" || sound === "default") {
      setSource(null);
      return;
    }
    setSource(soundAssets[sound]);
  }, [sound]);

  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (source && player) {
      player.play();
    }
  }, [source, player]);

  useEffect(() => {
    if (status.didJustFinish) {
      onFinish?.();
    }
  }, [status.didJustFinish]);

  return null;
};
