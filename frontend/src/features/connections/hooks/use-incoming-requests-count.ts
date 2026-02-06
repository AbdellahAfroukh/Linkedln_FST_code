import { useQuery } from "@tanstack/react-query";
import { connectionsApi } from "@/api/connections";
import { useEffect, useState } from "react";

/**
 * Hook to get the count of incoming connection requests
 * with auto-refresh polling
 */
export function useIncomingRequestsCount() {
  const [count, setCount] = useState(0);

  const incomingQuery = useQuery({
    queryKey: ["connections", "incoming"],
    queryFn: connectionsApi.listPendingIncoming,
    // Removed polling - WebSocket handles real-time updates
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update count whenever data changes
  useEffect(() => {
    if (incomingQuery.data) {
      setCount(incomingQuery.data.length);
    }
  }, [incomingQuery.data]);

  return {
    count,
    isLoading: incomingQuery.isLoading,
    data: incomingQuery.data,
  };
}
