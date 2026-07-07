// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useRef } from "react";

import type { RecentActivity } from "../../../../shared/domain/value_objects/recent_activity.value_object";

export function useNotification({
  lastActivity,
  onClicked,
}: {
  lastActivity?: RecentActivity;
  onClicked: (activity?: RecentActivity) => void;
}): [() => void, () => void] {
  const notificationRef = useRef<Notification>(undefined);

  const hide = useCallback(() => {
    notificationRef.current?.close();
    notificationRef.current = undefined;
  }, []);

  const show = useCallback(() => {
    hide();
    notificationRef.current = new Notification("What are you working on?", {
      body:
        lastActivity != null
          ? `${lastActivity.project} (${lastActivity.client}) ${lastActivity.task}`
          : undefined,
      requireInteraction: true,
      silent: false,
    });
    notificationRef.current.onclick = () => onClicked(lastActivity);
  }, [hide, lastActivity, onClicked]);

  return [show, hide];
}
