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
    refetchInterval: 1000, // Poll every 5 seconds
    refetchIntervalPause: false, // Don't pause when window is hidden
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
