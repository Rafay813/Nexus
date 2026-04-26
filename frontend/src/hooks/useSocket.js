// frontend/src/hooks/useSocket.js
import { useSocketContext } from "../context/SocketContext";

const useSocket = () => {
  const { socket, connected } = useSocketContext();
  return { socket, connected };
};

export default useSocket;