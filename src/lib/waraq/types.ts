export type DocumentDetail = {
  id: string;
  name: string;
  why: string;
  where: string;
  requirements: string[];
  online: boolean;
  onlineNote?: string;
  needsVisit: boolean;
  cost: string;
  time: string;
  openingHours?: string;
  requiredId?: string;
  notes?: string;
  accessibilityInfo?: string;
  printable?: boolean;
  stamp?: {
    where: string;
    institution: string;
    bring: string[];
    hours?: string;
    appointment?: string;
  };
  howTo?: string[];
};

export type Place = {
  id: string;
  name: string;
  type: string;
  address: string;
  hours: string;
  distanceKm?: number;
  travelMinutes?: number;
  accessibility?: string;
  mapQuery: string;
};

export type Question = {
  id: string;
  text: string;
  options: { value: string; label: string }[];
  /** show this question only when the predicate over previous answers passes */
  showIf?: (answers: Record<string, string>) => boolean;
};

export type Step = {
  id: string;
  title: string;
  detail: string;
  /** document id this step prepares, if any */
  docId?: string;
  cost?: string;
  time?: string;
  showIf?: (answers: Record<string, string>) => boolean;
};

export type Service = {
  id: string;
  serviceName: string;
  shortName: string;
  description: string;
  image: string;
  comingSoon?: boolean;
  officialLink: string;
  lastUpdated: string;
  questions: Question[];
  /** documents required, filtered by answers */
  requiredDocuments: { docId: string; showIf?: (answers: Record<string, string>) => boolean }[];
  steps: Step[];
  documents: Record<string, DocumentDetail>;
  places: Place[];
  accessibilityInfo: string;
};
