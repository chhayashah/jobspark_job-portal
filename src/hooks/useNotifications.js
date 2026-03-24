import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "react-query";
import { notificationsAPI } from "../services/api";
import { useSocket } from "./useSocket";
import toast from "react-hot-toast";

export function useNotifications() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data } = useQuery("notifications", () => notificationsAPI.getAll(), {
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!socket) return;
    socket.on("notification", (notif) => {
      queryClient.invalidateQueries("notifications");
      toast(notif.message, {
        icon: notif.type === "application" ? "📩" : "🔔",
      });
    });
    return () => socket.off("notification");
  }, [socket, queryClient]);

  const markAllRead = useCallback(async () => {
    await notificationsAPI.markAllRead();
    queryClient.invalidateQueries("notifications");
  }, [queryClient]);

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    markAllRead,
  };
}
