import { useEffect, useState } from "react";
import { NotificationSound } from "../utils/notificationSounds";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

export const SoundPreviewer = ({
  sound,
  onFinish,
}: {
  sound: NotificationSound | null;
  onFinish?: () => void;
}) => {
  const [source, setSource] = useState<any>(null);

  useEffect(() => {
    if (!sound || sound === "silent" || sound === "default") {
      setSource(null);
      return;
    }

    const soundAssets: Record<string, any> = {
      apoc_sound: require("../../assets/sounds/apoc_sound.mp3"),
      dozer_sound: require("../../assets/sounds/dozer_sound.mp3"),
      mouse_sound: require("../../assets/sounds/mouse_sound.mp3"),
      switch_sound: require("../../assets/sounds/switch_sound.mp3"),
      tank_sound: require("../../assets/sounds/tank_sound.mp3"),
    };

    setSource(() => soundAssets[sound]);
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
