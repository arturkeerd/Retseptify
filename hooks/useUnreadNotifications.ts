import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useUnreadNotifications() {
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUnreadNotifications();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          checkUnreadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUnreadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_read", false)
      .limit(1);

    if (!error && data && data.length > 0) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
    
    setLoading(false);
  };

  return { hasUnread, loading };
}