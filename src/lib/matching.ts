export type MatchReason = {
  label: string;
  detail: string;
  tone: "success" | "primary" | "warning" | "danger" | "muted";
  points: number;
};

export type CompatibilityResult = {
  score: number;
  label: string;
  tone: "success" | "primary" | "warning" | "danger";
  reasons: MatchReason[];
};

export type PlayerLike = {
  display_name?: string | null;
  sport?: string | null;
  position?: string | null;
  level?: string | null;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  open_to_opportunities?: boolean | null;
  avatar_path?: string | null;
  roles_available?: string[] | string | null;
  referee_sports?: string | null;
  referee_level?: string | null;
  referee_city?: string | null;
  referee_radius_km?: number | null;
  referee_availability?: string | null;
  referee_experience?: string | null;
  staff_roles?: string | null;
  staff_experience?: string | null;
};

export type ClubLike = {
  club_name?: string | null;
  sport?: string | null;
  level?: string | null;
  city?: string | null;
  region?: string | null;
  description?: string | null;
  logo_path?: string | null;
};

export type OfferLike = {
  title?: string | null;
  sport?: string | null;
  category?: string | null;
  offer_type?: string | null;
  position_needed?: string | null;
  level_required?: string | null;
  location?: string | null;
  description?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  remuneration?: string | null;
};

export const OFFER_TYPES = [
  { value: "player", label: "Recherche joueur" },
  { value: "referee", label: "Recherche arbitre" },
  { value: "staff", label: "Recherche coach / staff" },
];

export const OFFER_CATEGORIES = [
  { value: "recrutement", label: "Recrutement joueur" },
  { value: "essai", label: "Recherche essai" },
  { value: "urgent", label: "Remplacement urgent" },
  { value: "saison-prochaine", label: "Saison prochaine" },
  { value: "detection", label: "Détection" },
  { value: "tournoi", label: "Tournoi / événement" },
  { value: "arbitre", label: "Arbitrage" },
  { value: "staff", label: "Staff / encadrement" },
];

export function getCategoryLabel(value?: string | null) {
  if (!value) return "Annonce";
  return OFFER_CATEGORIES.find((category) => category.value === value)?.label || value;
}

export function getOfferTypeLabel(value?: string | null) {
  if (!value) return "Recherche joueur";
  return OFFER_TYPES.find((type) => type.value === value)?.label || value;
}

export function getOfferType(value?: string | null, category?: string | null) {
  const normalizedValue = normalize(value);
  const normalizedCategory = normalize(category);

  if (normalizedValue === "referee" || normalizedValue.includes("arbitr") || normalizedCategory.includes("arbitr")) {
    return "referee";
  }

  if (normalizedValue === "staff" || normalizedValue.includes("coach") || normalizedValue.includes("staff") || normalizedCategory.includes("staff") || normalizedCategory.includes("coach")) {
    return "staff";
  }

  return "player";
}

function rolesList(value?: string[] | string | null) {
  if (Array.isArray(value)) return value;
  if (!value) return ["player"];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // La valeur peut être une simple chaîne historique.
  }
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function hasRole(player: PlayerLike, role: string) {
  return rolesList(player.roles_available).includes(role);
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function includesOrEquals(a?: string | null, b?: string | null) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

const POSITION_GROUPS = [
  ["meneur", "point guard", "pg", "arriere", "guard"],
  ["arriere", "shooting guard", "sg", "ailier", "wing"],
  ["ailier", "small forward", "sf", "ailier fort", "forward"],
  ["ailier fort", "power forward", "pf", "pivot", "interieur"],
  ["pivot", "center", "c", "gardien", "goalkeeper"],
  ["defenseur", "defense", "milieu", "attaquant"],
  ["passeur", "libero", "central", "receptionneur"],
  ["talonneur", "pilier", "demi de melee", "ouvreur"],
];

export function areClosePositions(a?: string | null, b?: string | null) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return POSITION_GROUPS.some((group) =>
    group.some((item) => left.includes(item)) && group.some((item) => right.includes(item)),
  );
}

const LEVEL_ALIASES = [
  { keys: ["loisir", "debutant"], index: 0 },
  { keys: ["departemental", "departementale", "district"], index: 1 },
  { keys: ["regional", "regionale", "amateur"], index: 2 },
  { keys: ["national", "nationale"], index: 3 },
  { keys: ["semi pro", "semi-pro", "semi professionnel"], index: 4 },
  { keys: ["professionnel", "pro"], index: 5 },
  { keys: ["elite"], index: 6 },
];

export function levelIndex(value?: string | null) {
  const normalized = normalize(value);
  if (!normalized) return -1;
  const match = LEVEL_ALIASES.find((level) => level.keys.some((key) => normalized.includes(key)));
  return match?.index ?? -1;
}

function sharedKeywords(a?: string | null, b?: string | null) {
  const stopWords = new Set([
    "avec", "dans", "pour", "des", "les", "une", "un", "sur", "qui", "que", "est", "sont", "etre", "avoir", "club", "joueur", "joueuse", "recherche", "profil", "nous", "vous", "notre", "votre", "the", "and", "for", "with", "from",
  ]);
  const toWords = (value?: string | null) =>
    normalize(value)
      .split(" ")
      .filter((word) => word.length >= 4 && !stopWords.has(word));

  const left = new Set(toWords(a));
  const right = new Set(toWords(b));
  const common = [...left].filter((word) => right.has(word));
  return common.slice(0, 5);
}

function labelForScore(score: number) {
  if (score >= 82) return { label: "Compatibilité excellente", tone: "success" as const };
  if (score >= 65) return { label: "Très intéressant", tone: "primary" as const };
  if (score >= 42) return { label: "À explorer", tone: "warning" as const };
  return { label: "Compatibilité faible", tone: "danger" as const };
}

function zoneMatches(player: PlayerLike, club: ClubLike, offer?: OfferLike) {
  return (
    includesOrEquals(player.region, club.region) ||
    includesOrEquals(player.region, offer?.location) ||
    includesOrEquals(player.city, offer?.location || club.city) ||
    includesOrEquals(player.city, club.city) ||
    includesOrEquals(player.city, club.region)
  );
}

export function calculateOfferCompatibility(
  player: PlayerLike,
  club: ClubLike,
  offer: OfferLike,
): CompatibilityResult {
  const reasons: MatchReason[] = [];
  let score = 0;
  const offerType = getOfferType(offer.offer_type, offer.category);
  const offerSport = offer.sport || club.sport;

  if (offerType === "referee") {
    if (hasRole(player, "referee")) {
      score += 25;
      reasons.push({ label: "Rôle", detail: "Le profil accepte l’arbitrage", tone: "success", points: 25 });
    } else {
      reasons.push({ label: "Rôle", detail: "Arbitrage non indiqué sur le profil", tone: "warning", points: 0 });
    }

    if (includesOrEquals(player.referee_sports || player.sport, offerSport)) {
      score += 25;
      reasons.push({ label: "Sport", detail: "Sport arbitré compatible", tone: "success", points: 25 });
    } else if (!player.referee_sports && !player.sport) {
      score += 6;
      reasons.push({ label: "Sport", detail: "Sport d’arbitrage à compléter", tone: "muted", points: 6 });
    } else {
      reasons.push({ label: "Sport", detail: "Sport différent", tone: "danger", points: 0 });
    }

    const playerLevel = levelIndex(player.referee_level || player.level);
    const offerLevel = levelIndex(offer.level_required || club.level);
    if (includesOrEquals(player.referee_level || player.level, offer.level_required || club.level)) {
      score += 25;
      reasons.push({ label: "Niveau", detail: "Niveau d’arbitrage aligné", tone: "success", points: 25 });
    } else if (playerLevel >= 0 && offerLevel >= 0 && Math.abs(playerLevel - offerLevel) <= 1) {
      score += 15;
      reasons.push({ label: "Niveau", detail: "Niveau proche", tone: "primary", points: 15 });
    } else if (!player.referee_level && !player.level) {
      score += 5;
      reasons.push({ label: "Niveau", detail: "Niveau arbitre à préciser", tone: "muted", points: 5 });
    } else {
      reasons.push({ label: "Niveau", detail: "Niveau à confirmer", tone: "warning", points: 0 });
    }

    const refereeZonePlayer = { ...player, city: player.referee_city || player.city };
    if (zoneMatches(refereeZonePlayer, club, offer)) {
      score += 15;
      reasons.push({ label: "Zone", detail: "Zone compatible", tone: "success", points: 15 });
    } else if (!player.referee_city && !player.city && !player.region) {
      score += 5;
      reasons.push({ label: "Zone", detail: "Zone arbitre à compléter", tone: "muted", points: 5 });
    } else {
      reasons.push({ label: "Zone", detail: "Zone à vérifier", tone: "warning", points: 0 });
    }

    const common = sharedKeywords(`${player.referee_availability || ""} ${player.referee_experience || ""} ${player.bio || ""}`, `${offer.title || ""} ${offer.description || ""} ${offer.sport || ""}`);
    if (common.length > 0) {
      score += 10;
      reasons.push({ label: "Infos", detail: `Signaux communs : ${common.join(", ")}`, tone: "primary", points: 10 });
    } else {
      reasons.push({ label: "Infos", detail: "À confirmer avec le club", tone: "muted", points: 0 });
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, ...labelForScore(finalScore), reasons };
  }

  if (offerType === "staff") {
    if (hasRole(player, "staff")) {
      score += 25;
      reasons.push({ label: "Rôle", detail: "Profil ouvert au coach / staff", tone: "success", points: 25 });
    } else {
      reasons.push({ label: "Rôle", detail: "Staff non indiqué sur le profil", tone: "warning", points: 0 });
    }

    if (includesOrEquals(player.sport, offerSport)) {
      score += 25;
      reasons.push({ label: "Sport", detail: "Même sport", tone: "success", points: 25 });
    } else if (!player.sport || !offerSport) {
      score += 6;
      reasons.push({ label: "Sport", detail: "Sport à compléter", tone: "muted", points: 6 });
    } else {
      reasons.push({ label: "Sport", detail: "Sport différent", tone: "danger", points: 0 });
    }

    if (includesOrEquals(player.staff_roles, offer.position_needed)) {
      score += 25;
      reasons.push({ label: "Mission", detail: "Mission alignée", tone: "success", points: 25 });
    } else if (!player.staff_roles || !offer.position_needed) {
      score += 8;
      reasons.push({ label: "Mission", detail: "Mission à préciser", tone: "muted", points: 8 });
    } else {
      reasons.push({ label: "Mission", detail: "Mission à confirmer", tone: "warning", points: 0 });
    }

    if (zoneMatches(player, club, offer)) {
      score += 15;
      reasons.push({ label: "Zone", detail: "Zone compatible", tone: "success", points: 15 });
    } else {
      reasons.push({ label: "Zone", detail: "Zone à vérifier", tone: "warning", points: 0 });
    }

    const common = sharedKeywords(`${player.staff_experience || ""} ${player.bio || ""}`, `${offer.title || ""} ${offer.description || ""} ${offer.sport || ""}`);
    if (common.length > 0) {
      score += 10;
      reasons.push({ label: "Projet", detail: `Signaux communs : ${common.join(", ")}`, tone: "primary", points: 10 });
    } else {
      reasons.push({ label: "Projet", detail: "À confirmer en échange direct", tone: "muted", points: 0 });
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, ...labelForScore(finalScore), reasons };
  }

  // Barème joueur stable sur 100 points :
  // Sport 25 + Poste 25 + Niveau 25 + Zone 15 + Mots-clés 10.
  if (includesOrEquals(player.sport, offerSport)) {
    score += 25;
    reasons.push({ label: "Sport", detail: "Même sport", tone: "success", points: 25 });
  } else if (!player.sport || !offerSport) {
    score += 6;
    reasons.push({ label: "Sport", detail: "Sport à compléter", tone: "muted", points: 6 });
  } else {
    reasons.push({ label: "Sport", detail: "Sport différent", tone: "danger", points: 0 });
  }

  reasons.push({
    label: "Type",
    detail: getCategoryLabel(offer.category),
    tone: offer.category ? "primary" : "muted",
    points: 0,
  });

  if (includesOrEquals(player.position, offer.position_needed)) {
    score += 25;
    reasons.push({ label: "Poste", detail: "Poste parfaitement aligné", tone: "success", points: 25 });
  } else if (areClosePositions(player.position, offer.position_needed)) {
    score += 15;
    reasons.push({ label: "Poste", detail: "Poste proche", tone: "primary", points: 15 });
  } else if (!player.position || !offer.position_needed) {
    score += 5;
    reasons.push({ label: "Poste", detail: "Poste à préciser", tone: "muted", points: 5 });
  } else {
    reasons.push({ label: "Poste", detail: "Poste différent", tone: "warning", points: 0 });
  }

  const playerLevel = levelIndex(player.level);
  const offerLevel = levelIndex(offer.level_required || club.level);
  if (includesOrEquals(player.level, offer.level_required || club.level)) {
    score += 25;
    reasons.push({ label: "Niveau", detail: "Niveau aligné", tone: "success", points: 25 });
  } else if (playerLevel >= 0 && offerLevel >= 0 && Math.abs(playerLevel - offerLevel) <= 1) {
    score += 15;
    reasons.push({ label: "Niveau", detail: "Niveau proche", tone: "primary", points: 15 });
  } else if (!player.level || (!offer.level_required && !club.level)) {
    score += 5;
    reasons.push({ label: "Niveau", detail: "Niveau à préciser", tone: "muted", points: 5 });
  } else {
    reasons.push({ label: "Niveau", detail: "Niveau éloigné", tone: "warning", points: 0 });
  }

  if (zoneMatches(player, club, offer)) {
    score += 15;
    reasons.push({ label: "Zone", detail: "Zone compatible", tone: "success", points: 15 });
  } else if (!player.region && !player.city) {
    score += 5;
    reasons.push({ label: "Zone", detail: "Zone joueur à compléter", tone: "muted", points: 5 });
  } else if (!club.region && !club.city && !offer.location) {
    score += 5;
    reasons.push({ label: "Zone", detail: "Zone club à compléter", tone: "muted", points: 5 });
  } else {
    reasons.push({ label: "Zone", detail: "Zone éloignée", tone: "warning", points: 0 });
  }

  const common = sharedKeywords(player.bio, `${offer.title || ""} ${offer.description || ""} ${offer.sport || ""}`);
  if (common.length >= 3) {
    score += 10;
    reasons.push({ label: "Mots-clés", detail: `Mots communs : ${common.join(", ")}`, tone: "success", points: 10 });
  } else if (common.length > 0) {
    score += 6;
    reasons.push({ label: "Mots-clés", detail: `Signal faible : ${common.join(", ")}`, tone: "primary", points: 6 });
  } else {
    reasons.push({ label: "Mots-clés", detail: "Pas encore de mots communs forts", tone: "muted", points: 0 });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return { score: finalScore, ...labelForScore(finalScore), reasons };
}

export function calculatePlayerClubCompatibility(player: PlayerLike, club: ClubLike): CompatibilityResult {
  const reasons: MatchReason[] = [];
  let score = 0;

  // Score global joueur ↔ club, sans annonce précise :
  // Sport 25 + Niveau 25 + Zone 25 + Projet 25.
  if (includesOrEquals(player.sport, club.sport)) {
    score += 25;
    reasons.push({ label: "Sport", detail: "Même sport", tone: "success", points: 25 });
  } else if (!player.sport || !club.sport) {
    score += 8;
    reasons.push({ label: "Sport", detail: "Sport à compléter", tone: "muted", points: 8 });
  } else {
    reasons.push({ label: "Sport", detail: "Sport différent", tone: "danger", points: 0 });
  }

  const playerLevel = levelIndex(player.level);
  const clubLevel = levelIndex(club.level);
  if (includesOrEquals(player.level, club.level)) {
    score += 25;
    reasons.push({ label: "Niveau", detail: "Niveau aligné", tone: "success", points: 25 });
  } else if (playerLevel >= 0 && clubLevel >= 0 && Math.abs(playerLevel - clubLevel) <= 1) {
    score += 15;
    reasons.push({ label: "Niveau", detail: "Niveau proche", tone: "primary", points: 15 });
  } else if (!player.level || !club.level) {
    score += 8;
    reasons.push({ label: "Niveau", detail: "Niveau à préciser", tone: "muted", points: 8 });
  } else {
    reasons.push({ label: "Niveau", detail: "Niveau éloigné", tone: "warning", points: 0 });
  }

  if (zoneMatches(player, club)) {
    score += 25;
    reasons.push({ label: "Zone", detail: "Même zone ou ville compatible", tone: "success", points: 25 });
  } else if (!player.region && !player.city) {
    score += 8;
    reasons.push({ label: "Zone", detail: "Zone joueur à compléter", tone: "muted", points: 8 });
  } else if (!club.region && !club.city) {
    score += 8;
    reasons.push({ label: "Zone", detail: "Zone club à compléter", tone: "muted", points: 8 });
  } else {
    reasons.push({ label: "Zone", detail: "Zone différente", tone: "warning", points: 0 });
  }

  const common = sharedKeywords(player.bio, club.description);
  if (common.length >= 3) {
    score += 25;
    reasons.push({ label: "Projet", detail: `Mots communs : ${common.join(", ")}`, tone: "success", points: 25 });
  } else if (common.length > 0) {
    score += 14;
    reasons.push({ label: "Projet", detail: `Signal faible : ${common.join(", ")}`, tone: "primary", points: 14 });
  } else {
    score += 4;
    reasons.push({ label: "Projet", detail: "À confirmer en échange direct", tone: "muted", points: 4 });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return { score: finalScore, ...labelForScore(finalScore), reasons };
}

export function calculatePlayerCompletion(player: PlayerLike & { contact_email?: string | null; phone?: string | null }) {
  const roles = rolesList(player.roles_available);
  const checks = [
    { label: "Nom affiché", done: Boolean(player.display_name) },
    { label: "Sport", done: Boolean(player.sport) },
    { label: "Rôle", done: roles.length > 0 },
    { label: "Ville ou région", done: Boolean(player.city || player.region) },
    { label: "Bio", done: Boolean(player.bio && player.bio.length > 40) },
    { label: "Contact", done: Boolean(player.contact_email || player.phone) },
    { label: "Avatar", done: Boolean(player.avatar_path) },
  ];

  if (roles.includes("player")) {
    checks.push(
      { label: "Poste joueur", done: Boolean(player.position) },
      { label: "Niveau joueur", done: Boolean(player.level) },
    );
  }

  if (roles.includes("referee")) {
    checks.push(
      { label: "Sport arbitré", done: Boolean(player.referee_sports || player.sport) },
      { label: "Niveau d’arbitrage", done: Boolean(player.referee_level) },
      { label: "Disponibilités arbitre", done: Boolean(player.referee_availability) },
    );
  }

  if (roles.includes("staff")) {
    checks.push(
      { label: "Rôle staff", done: Boolean(player.staff_roles) },
      { label: "Expérience staff", done: Boolean(player.staff_experience) },
    );
  }

  const done = checks.filter((item) => item.done).length;
  return { score: Math.round((done / checks.length) * 100), checks };
}

export function calculateClubCompletion(club: ClubLike & { contact_email?: string | null; phone?: string | null }) {
  const checks = [
    { label: "Nom du club", done: Boolean(club.club_name) },
    { label: "Sport", done: Boolean(club.sport) },
    { label: "Niveau", done: Boolean(club.level) },
    { label: "Ville ou région", done: Boolean(club.city || club.region) },
    { label: "Description", done: Boolean(club.description && club.description.length > 40) },
    { label: "Contact", done: Boolean(club.contact_email || club.phone) },
    { label: "Logo", done: Boolean(club.logo_path) },
  ];
  const done = checks.filter((item) => item.done).length;
  return { score: Math.round((done / checks.length) * 100), checks };
}
