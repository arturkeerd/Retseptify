// lib/unitConversion.ts

const WEIGHT_UNITS = ["g", "kg", "oz", "lb"] as const;
const VOLUME_UNITS = ["ml", "l", "dl", "fl oz", "qt", "gal", "cup"] as const;
const SPOON_UNITS = ["tl", "spl"] as const;

const UNIT_TO_BASE: Record<string, number> = {
  // weight (g base)
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,

  // volume (ml base)
  ml: 1,
  l: 1000,
  dl: 100,
  cup: 240,
  "fl oz": 29.5735,
  qt: 946.353,
  gal: 3785.41,

  // spoons (tl base)
  tl: 1,
  spl: 3,
};

function isSameCategory(from: string, to: string) {
  const f = from.toLowerCase();
  const t = to.toLowerCase();

  const w = WEIGHT_UNITS.includes(f as any) && WEIGHT_UNITS.includes(t as any);
  const v = VOLUME_UNITS.includes(f as any) && VOLUME_UNITS.includes(t as any);
  const s = SPOON_UNITS.includes(f as any) && SPOON_UNITS.includes(t as any);

  // tk on ainult tk
  const tk = f === "tk" && t === "tk";
  return w || v || s || tk;
}

// ✅ muudab koguse kohe ära ainult siis, kui kategooria sama
export function convertQuantitySameCategory(
  qtyStr: string,
  fromUnit: string | null,
  toUnit: string | null
): string {
  if (!qtyStr) return "";
  const n = Number(String(qtyStr).replace(",", "."));
  if (!Number.isFinite(n)) return qtyStr;

  if (!fromUnit || !toUnit) return qtyStr;

  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (!isSameCategory(from, to)) {
    // eri kategooria (kg -> l jne) – ära muuda numbrit
    return qtyStr;
  }

  if (from === to) return qtyStr;

  const fromFactor = UNIT_TO_BASE[from];
  const toFactor = UNIT_TO_BASE[to];
  if (!fromFactor || !toFactor) return qtyStr;

  const inBase = n * fromFactor;
  const converted = inBase / toFactor;

  const rounded = Math.round(converted * 1000) / 1000;
  return String(rounded);
}

export function getAllUnitOptions(): string[] {
  return [
    ...WEIGHT_UNITS,
    ...VOLUME_UNITS,
    ...SPOON_UNITS,
    "tk",
  ];
}
