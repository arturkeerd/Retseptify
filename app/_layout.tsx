import { useRouter, Stack } from "expo-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace("/home");
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
