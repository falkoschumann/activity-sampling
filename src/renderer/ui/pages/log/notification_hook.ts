// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useRef } from "react";

import type { LoggedActivity } from "../../../../shared/domain/logged_activity";

export function useNotification({
  lastActivity,
  onClicked,
}: {
  lastActivity?: LoggedActivity;
  onClicked: (activity?: LoggedActivity) => void;
}): { show: () => void; hide: () => void } {
  const notificationRef = useRef<Notification>(undefined);

  const show = useCallback(() => {
    notificationRef.current = new Notification("What are you working on?", {
      body:
        lastActivity != null
          ? `${lastActivity.project} (${lastActivity.client}) ${lastActivity.task}`
          : undefined,
      requireInteraction: true,
      silent: false,
    });
    notificationRef.current.onclick = () => onClicked(lastActivity);
  }, [lastActivity, onClicked]);

  const hide = useCallback(() => {
    notificationRef.current?.close();
    notificationRef.current = undefined;
  }, []);

  return { show, hide };
}
