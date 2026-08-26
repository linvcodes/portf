"use client";

import { useCallback, useEffect, useState } from "react";
import { AudioBus, type ClipName } from "./AudioBus";

/**
 * React binding for AudioBus. Subscribes to mute state and exposes the
 * imperative API. Muted defaults to true until the client has mounted and
 * read localStorage, so SSR/first-paint output is stable.
 */
export function useAudio() {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    setMutedState(AudioBus.isMuted());
    return AudioBus.onMuteChange(setMutedState);
  }, []);

  const init = useCallback(() => {
    AudioBus.init();
  }, []);

  const toggleMuted = useCallback(() => {
    AudioBus.init();
    AudioBus.toggleMuted();
  }, []);

  const setMuted = useCallback((value: boolean) => {
    AudioBus.init();
    AudioBus.setMuted(value);
  }, []);

  const play = useCallback(
    (name: ClipName, opts?: { hoverTriggered?: boolean; gain?: number }) => {
      AudioBus.play(name, opts);
    },
    [],
  );

  const playHover = useCallback(() => {
    AudioBus.playHover();
  }, []);

  return { muted, init, toggleMuted, setMuted, play, playHover };
}
