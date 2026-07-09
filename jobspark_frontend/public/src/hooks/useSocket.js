import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

let socketInstance = null;

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (!socketInstance) {
      socketInstance = io(
        process.env.REACT_APP_API_URL?.replace("/api", "") ||
          "http://localhost:5000",
        {
          transports: ["websocket"],
        },
      );
    }
    socketRef.current = socketInstance;
    socketInstance.emit("join", user.id);
    return () => {};
  }, [user]);

  return socketRef.current;
}
