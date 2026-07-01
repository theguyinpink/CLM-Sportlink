export type SportFieldKind = "position" | "speciality" | "discipline" | "role";

export type SportDefinition = {
  value: string;
  label: string;
  aliases?: string[];
  fieldLabel: string;
  fieldPlaceholder: string;
  fieldKind: SportFieldKind;
  levels: string[];
  positions: string[];
};

const DEFAULT_LEVELS = [
  "Loisir",
  "Débutant",
  "Départemental",
  "Régional",
  "Pré-national",
  "National",
  "Semi-pro",
  "Professionnel",
  "Élite",
];

const NO_POSITION = ["Pratiquant", "Polyvalent"];

export const SPORT_CATALOG: SportDefinition[] = [
  {
    value: "Basketball",
    label: "Basketball",
    aliases: ["Basket", "Basket-ball", "3x3"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Ailier",
    fieldKind: "position",
    levels: [
      "Loisir",
      "Départemental 4",
      "Départemental 3",
      "Départemental 2",
      "Départemental 1",
      "Pré-régional",
      "Régional 3",
      "Régional 2",
      "Régional 1",
      "Pré-nationale",
      "Nationale 3",
      "Nationale 2",
      "Nationale 1",
      "Espoirs",
      "Élite 2",
      "Betclic Élite",
    ],
    positions: ["Meneur", "Arrière", "Ailier", "Ailier fort", "Pivot", "Combo guard", "Intérieur", "Polyvalent"],
  },
  {
    value: "Football",
    label: "Football",
    aliases: ["Foot", "Soccer"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Milieu offensif",
    fieldKind: "position",
    levels: [
      "Loisir",
      "Départemental 5",
      "Départemental 4",
      "Départemental 3",
      "Départemental 2",
      "Départemental 1",
      "Régional 3",
      "Régional 2",
      "Régional 1",
      "National 3",
      "National 2",
      "National",
      "Ligue 2",
      "Ligue 1",
    ],
    positions: [
      "Gardien",
      "Défenseur central",
      "Latéral droit",
      "Latéral gauche",
      "Piston droit",
      "Piston gauche",
      "Milieu défensif",
      "Milieu relayeur",
      "Milieu offensif",
      "Ailier droit",
      "Ailier gauche",
      "Avant-centre",
      "Attaquant",
      "Polyvalent",
    ],
  },
  {
    value: "Futsal",
    label: "Futsal",
    aliases: ["Foot salle"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Fixe",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional 2", "Régional 1", "D2 Futsal", "D1 Futsal"],
    positions: ["Gardien", "Fixe", "Ailier", "Pivot", "Universel", "Polyvalent"],
  },
  {
    value: "Handball",
    label: "Handball",
    aliases: ["Hand"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Demi-centre",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional 3", "Régional 2", "Régional 1", "Pré-nationale", "Nationale 3", "Nationale 2", "Nationale 1", "Proligue", "Starligue"],
    positions: ["Gardien", "Ailier gauche", "Ailier droit", "Arrière gauche", "Arrière droit", "Demi-centre", "Pivot", "Polyvalent"],
  },
  {
    value: "Rugby à XV",
    label: "Rugby à XV",
    aliases: ["Rugby", "Rugby XV"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Talonneur",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional 3", "Régional 2", "Régional 1", "Fédérale 3", "Fédérale 2", "Fédérale 1", "Nationale 2", "Nationale", "Pro D2", "Top 14"],
    positions: ["Pilier gauche", "Talonneur", "Pilier droit", "Deuxième ligne", "Troisième ligne aile", "Troisième ligne centre", "Demi de mêlée", "Demi d’ouverture", "Centre", "Ailier", "Arrière", "Polyvalent"],
  },
  {
    value: "Rugby à XIII",
    label: "Rugby à XIII",
    aliases: ["Rugby XIII"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Demi de mêlée",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional", "Élite 2", "Élite 1", "National"],
    positions: ["Arrière", "Ailier", "Centre", "Demi d’ouverture", "Demi de mêlée", "Pilier", "Talonneur", "Deuxième ligne", "Troisième ligne", "Polyvalent"],
  },
  {
    value: "Volleyball",
    label: "Volleyball",
    aliases: ["Volley", "Volley-ball"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Passeur",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional", "Pré-national", "Nationale 3", "Nationale 2", "Nationale 1", "Élite", "Ligue B", "Ligue A"],
    positions: ["Passeur", "Pointu", "Central", "Réceptionneur-attaquant", "Libéro", "Polyvalent"],
  },
  {
    value: "Tennis",
    label: "Tennis",
    aliases: ["Tennis club"],
    fieldLabel: "Spécialité",
    fieldPlaceholder: "Simple",
    fieldKind: "speciality",
    levels: ["NC", "40", "30/5", "30/4", "30/3", "30/2", "30/1", "30", "15/5", "15/4", "15/3", "15/2", "15/1", "15", "5/6", "4/6", "3/6", "2/6", "1/6", "0", "Négatif", "Promotion", "National"],
    positions: ["Simple", "Double", "Double mixte", "Compétition par équipes", "Enseignement", "Polyvalent"],
  },
  {
    value: "Padel",
    label: "Padel",
    aliases: ["Pádel"],
    fieldLabel: "Spécialité",
    fieldPlaceholder: "Joueur gauche",
    fieldKind: "speciality",
    levels: ["Débutant", "Loisir", "Intermédiaire", "Confirmé", "Compétition", "Régional", "National"],
    positions: ["Joueur gauche", "Joueur droit", "Polyvalent", "Double mixte"],
  },
  {
    value: "Tennis de table",
    label: "Tennis de table",
    aliases: ["Ping", "Ping-pong"],
    fieldLabel: "Spécialité",
    fieldPlaceholder: "Simple",
    fieldKind: "speciality",
    levels: ["Loisir", "Départemental", "Régional", "Pré-national", "National", "Pro B", "Pro A"],
    positions: ["Simple", "Double", "Relanceur", "Défenseur", "Attaquant", "Polyvalent"],
  },
  {
    value: "Badminton",
    label: "Badminton",
    aliases: ["Bad"],
    fieldLabel: "Spécialité",
    fieldPlaceholder: "Simple hommes / femmes",
    fieldKind: "speciality",
    levels: ["Loisir", "Départemental", "Régional", "National", "Élite"],
    positions: ["Simple", "Double hommes", "Double femmes", "Double mixte", "Polyvalent"],
  },
  {
    value: "Athlétisme",
    label: "Athlétisme",
    aliases: ["Athlé"],
    fieldLabel: "Discipline",
    fieldPlaceholder: "Sprint",
    fieldKind: "discipline",
    levels: ["Loisir", "Départemental", "Régional", "Interrégional", "National", "Élite"],
    positions: ["Sprint", "Demi-fond", "Fond", "Haies", "Marche", "Saut en hauteur", "Saut en longueur", "Triple saut", "Perche", "Lancer du poids", "Lancer du disque", "Lancer du javelot", "Lancer du marteau", "Épreuves combinées", "Relais", "Polyvalent"],
  },
  {
    value: "Natation",
    label: "Natation",
    aliases: ["Nage"],
    fieldLabel: "Discipline",
    fieldPlaceholder: "Nage libre",
    fieldKind: "discipline",
    levels: ["Loisir", "Départemental", "Régional", "Interrégional", "National 2", "National 1", "Élite"],
    positions: ["Nage libre", "Dos", "Brasse", "Papillon", "4 nages", "Eau libre", "Relais", "Plongeon", "Water-polo", "Polyvalent"],
  },
  {
    value: "Gymnastique",
    label: "Gymnastique",
    aliases: ["Gym", "Gymnastique artistique", "GR", "GAF", "GAM"],
    fieldLabel: "Spécialité gym",
    fieldPlaceholder: "Gymnastique artistique féminine",
    fieldKind: "speciality",
    levels: ["Loisir", "Départemental", "Régional", "Fédéral B", "Fédéral A", "Performance", "National", "Élite"],
    positions: ["Gymnastique artistique féminine", "Gymnastique artistique masculine", "Gymnastique rythmique", "Trampoline", "Tumbling", "TeamGym", "Parkour", "Aérobic", "Baby gym", "Gym santé", "Polyvalent"],
  },
  {
    value: "Danse",
    label: "Danse",
    aliases: ["Dance"],
    fieldLabel: "Style / spécialité",
    fieldPlaceholder: "Hip-hop",
    fieldKind: "speciality",
    levels: ["Loisir", "Débutant", "Intermédiaire", "Avancé", "Compétition", "Régional", "National", "Professionnel"],
    positions: ["Classique", "Jazz", "Contemporain", "Hip-hop", "Breakdance", "Dancehall", "Salsa", "Bachata", "Danse sportive", "Chorégraphe", "Polyvalent"],
  },
  {
    value: "Boxe",
    label: "Boxe",
    aliases: ["Boxe anglaise"],
    fieldLabel: "Catégorie / spécialité",
    fieldPlaceholder: "Poids légers",
    fieldKind: "speciality",
    levels: ["Loisir", "Débutant", "Assaut", "Amateur", "Régional", "National", "Professionnel"],
    positions: ["Poids mouches", "Poids coqs", "Poids plumes", "Poids légers", "Poids welters", "Poids moyens", "Poids mi-lourds", "Poids lourds", "Polyvalent"],
  },
  {
    value: "Judo",
    label: "Judo",
    aliases: ["Judoka"],
    fieldLabel: "Catégorie / spécialité",
    fieldPlaceholder: "-73 kg",
    fieldKind: "speciality",
    levels: ["Ceinture blanche", "Ceinture jaune", "Ceinture orange", "Ceinture verte", "Ceinture bleue", "Ceinture marron", "Ceinture noire", "Départemental", "Régional", "National", "International"],
    positions: ["-48 kg", "-52 kg", "-57 kg", "-63 kg", "-70 kg", "-78 kg", "+78 kg", "-60 kg", "-66 kg", "-73 kg", "-81 kg", "-90 kg", "-100 kg", "+100 kg", "Kata", "Polyvalent"],
  },
  {
    value: "Karaté",
    label: "Karaté",
    aliases: ["Karate"],
    fieldLabel: "Spécialité",
    fieldPlaceholder: "Kumité",
    fieldKind: "speciality",
    levels: ["Ceinture blanche", "Ceinture jaune", "Ceinture orange", "Ceinture verte", "Ceinture bleue", "Ceinture marron", "Ceinture noire", "Départemental", "Régional", "National", "International"],
    positions: ["Kata", "Kumité", "Combat", "Technique", "Polyvalent"],
  },
  {
    value: "MMA",
    label: "MMA",
    aliases: ["Arts martiaux mixtes"],
    fieldLabel: "Catégorie / spécialité",
    fieldPlaceholder: "Lightweight",
    fieldKind: "speciality",
    levels: ["Loisir", "Débutant", "Amateur", "Régional", "National", "Professionnel"],
    positions: ["Striking", "Grappling", "Lutte", "Jiu-jitsu", "Poids mouches", "Poids coqs", "Poids plumes", "Poids légers", "Poids welters", "Poids moyens", "Poids lourds", "Polyvalent"],
  },
  {
    value: "Hockey sur glace",
    label: "Hockey sur glace",
    aliases: ["Hockey glace"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Défenseur",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional", "Division 3", "Division 2", "Division 1", "Ligue Magnus"],
    positions: ["Gardien", "Défenseur", "Centre", "Ailier gauche", "Ailier droit", "Polyvalent"],
  },
  {
    value: "Hockey sur gazon",
    label: "Hockey sur gazon",
    aliases: ["Hockey gazon"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Milieu",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional", "National", "Élite"],
    positions: ["Gardien", "Défenseur", "Milieu", "Attaquant", "Polyvalent"],
  },
  {
    value: "Baseball / Softball",
    label: "Baseball / Softball",
    aliases: ["Baseball", "Softball"],
    fieldLabel: "Poste joueur",
    fieldPlaceholder: "Lanceur",
    fieldKind: "position",
    levels: ["Loisir", "Départemental", "Régional", "National", "Division 2", "Division 1", "Élite"],
    positions: ["Lanceur", "Receveur", "Première base", "Deuxième base", "Troisième base", "Arrêt-court", "Champ gauche", "Champ centre", "Champ droit", "Frappeur désigné", "Polyvalent"],
  },
  {
    value: "Cyclisme",
    label: "Cyclisme",
    aliases: ["Vélo", "Velo"],
    fieldLabel: "Discipline",
    fieldPlaceholder: "Route",
    fieldKind: "discipline",
    levels: ["Loisir", "Départemental", "Régional", "National", "Élite", "Professionnel"],
    positions: ["Route", "Piste", "VTT", "BMX", "Cyclo-cross", "Gravel", "Contre-la-montre", "Sprinteur", "Grimpeur", "Rouleur", "Polyvalent"],
  },
  {
    value: "Triathlon",
    label: "Triathlon",
    aliases: ["Tri"],
    fieldLabel: "Discipline",
    fieldPlaceholder: "Sprint",
    fieldKind: "discipline",
    levels: ["Loisir", "Départemental", "Régional", "National", "Élite", "Professionnel"],
    positions: ["XS", "S", "M", "L", "Ironman", "Duathlon", "Aquathlon", "Relais", "Polyvalent"],
  },
  {
    value: "Escalade",
    label: "Escalade",
    aliases: ["Climbing"],
    fieldLabel: "Discipline",
    fieldPlaceholder: "Bloc",
    fieldKind: "discipline",
    levels: ["Loisir", "Débutant", "Intermédiaire", "Confirmé", "Régional", "National", "Élite"],
    positions: ["Bloc", "Difficulté", "Vitesse", "Combiné", "Ouvreur", "Polyvalent"],
  },
  {
    value: "Esport",
    label: "Esport",
    aliases: ["E-sport", "Gaming"],
    fieldLabel: "Rôle / jeu",
    fieldPlaceholder: "Joueur Rocket League",
    fieldKind: "role",
    levels: ["Amateur", "Open", "Compétitif", "Semi-pro", "Professionnel", "Élite"],
    positions: ["Joueur", "Coach", "Analyste", "Manager", "Caster", "Rocket League", "Valorant", "League of Legends", "Counter-Strike", "EA FC", "Fortnite", "Polyvalent"],
  },
  {
    value: "Autre sport",
    label: "Autre sport",
    aliases: ["Autre"],
    fieldLabel: "Rôle / spécialité",
    fieldPlaceholder: "Spécialité",
    fieldKind: "speciality",
    levels: DEFAULT_LEVELS,
    positions: NO_POSITION,
  },
];

function normalize(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export const SPORT_OPTIONS = SPORT_CATALOG.map((sport) => sport.label);

export const LEVEL_OPTIONS = unique([...DEFAULT_LEVELS, ...SPORT_CATALOG.flatMap((sport) => sport.levels)]);

export const POSITION_OPTIONS = unique(SPORT_CATALOG.flatMap((sport) => sport.positions));

export const REGION_OPTIONS = [
  "Île-de-France",
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d’Azur",
  "Outre-mer",
];

export const PROFILE_ROLE_OPTIONS = [
  { value: "player", label: "Joueur" },
  { value: "referee", label: "Arbitre" },
  { value: "staff", label: "Coach / staff" },
];

export const OFFER_TYPE_OPTIONS = [
  { value: "player", label: "Recherche joueur" },
  { value: "referee", label: "Recherche arbitre" },
  { value: "staff", label: "Recherche coach / staff" },
];

export const REFEREE_LEVEL_OPTIONS = [
  "Débutant",
  "Arbitre club",
  "Départemental",
  "Régional",
  "Pré-national",
  "National",
  "Officiel diplômé",
  "Expérimenté",
];

export const STAFF_ROLE_OPTIONS = [
  "Coach principal",
  "Assistant coach",
  "Préparateur physique",
  "Préparateur mental",
  "Analyste vidéo",
  "Entraîneur gardiens",
  "Kinésithérapeute",
  "Bénévole",
  "Encadrant tournoi",
  "Photographe sportif",
  "Community manager sportif",
  "Responsable matériel",
  "Responsable événementiel",
  "Polyvalent",
];

export function getSportDefinition(value?: string | null) {
  const normalized = normalize(value);
  if (!normalized) return SPORT_CATALOG[0];

  return (
    SPORT_CATALOG.find((sport) => {
      const names = [sport.value, sport.label, ...(sport.aliases || [])].map(normalize);
      return names.includes(normalized);
    }) || SPORT_CATALOG.find((sport) => sport.value === "Autre sport") || SPORT_CATALOG[0]
  );
}

export function getSportLevels(sport?: string | null) {
  return getSportDefinition(sport).levels;
}

export function getSportPositions(sport?: string | null) {
  return getSportDefinition(sport).positions;
}

export function getSportFieldLabel(sport?: string | null) {
  return getSportDefinition(sport).fieldLabel;
}

export function getSportFieldPlaceholder(sport?: string | null) {
  return getSportDefinition(sport).fieldPlaceholder;
}

export function withCurrentOption(options: string[], current?: string | null) {
  const value = String(current || "").trim();
  if (!value) return options;
  return options.includes(value) ? options : [value, ...options];
}
