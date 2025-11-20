import { supabase } from "@/lib/supabase";

export type KitchenRole = "owner" | "viewer";

export type KitchenWithRole = {
  id: string;
  name: string;
  type: "personal" | "shared";
  color: string | null;
  role: KitchenRole;
};

export type HomeRecipe = {
  id: string;
  title: string;
  kitchenId: string;
  kitchenName: string;
  kitchenType: "personal" | "shared";
  role: KitchenRole;
};

export type HomeRecipeBuckets = {
  personal: HomeRecipe[];
  owner: HomeRecipe[];  // shared + owner
  viewer: HomeRecipe[]; // shared + viewer
};

/**
 * Tagastab sisse logitud kasutaja köögid koos rolliga.
 */
export async function getCurrentUserWithKitchens() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Not authenticated");
  }

  const userId = authData.user.id;

  const { data, error } = await supabase
    .from("kitchen_members")
    .select(
      `
      role,
      kitchens (
        id,
        name,
        type,
        color
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading kitchens:", error);
    throw error;
  }

  const kitchens: KitchenWithRole[] =
    (data ?? [])
      .filter((row: any) => row.kitchens)
      .map((row: any) => ({
        id: row.kitchens.id,
        name: row.kitchens.name,
        type: row.kitchens.type,
        color: row.kitchens.color ?? null,
        role: row.role as KitchenRole,
      }));

  return {
    userId,
    kitchens,
  };
}

/**
 * Tagastab Home vaate jaoks retseptide bucketid:
 *  - personal: kõik retseptid personal-köökidest
 *  - owner: kõik retseptid shared-köökidest, kus kasutaja on owner
 *  - viewer: kõik retseptid shared-köökidest, kus kasutaja on viewer
 */
export async function getHomeRecipesForCurrentUser(): Promise<HomeRecipeBuckets> {
  const { kitchens } = await getCurrentUserWithKitchens();

  if (!kitchens.length) {
    return { personal: [], owner: [], viewer: [] };
  }

  const kitchenIds = kitchens.map((k) => k.id);

  const { data: recipeRows, error } = await supabase
    .from("recipes")
    .select("id, title, kitchen_id")
    .in("kitchen_id", kitchenIds);

  if (error) {
    console.error("Error loading recipes:", error);
    throw error;
  }

  const kitchenMap = new Map<string, KitchenWithRole>(
    kitchens.map((k) => [k.id, k])
  );

  const allRecipes: HomeRecipe[] = (recipeRows ?? []).map((r: any) => {
    const kitchen = kitchenMap.get(r.kitchen_id)!; // meil PEAKS olema

    return {
      id: r.id,
      title: r.title,
      kitchenId: r.kitchen_id,
      kitchenName: kitchen.name,
      kitchenType: kitchen.type,
      role: kitchen.role,
    };
  });

  return {
    personal: allRecipes.filter((r) => r.kitchenType === "personal"),
    owner: allRecipes.filter(
      (r) => r.kitchenType === "shared" && r.role === "owner"
    ),
    viewer: allRecipes.filter(
      (r) => r.kitchenType === "shared" && r.role === "viewer"
    ),
  };
}