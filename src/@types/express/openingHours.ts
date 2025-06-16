// Gestion des opening hours restaurant au format JSON avec validation ZOD

export type OpeningHours = {
  [day in 
    'monday' | 
    'tuesday' | 
    'wednesday' | 
    'thursday' | 
    'friday' | 
    'saturday' | 
    'sunday'
  ]?: {
    open: string;  // Format "HH:MM" (ex: "11:00")
    close: string;
  }[];
};

// Exemple type :
export const exampleHours: OpeningHours = {
  monday: [
    { open: "11:00", close: "14:00" },
    { open: "18:00", close: "22:00" }
  ],
  tuesday: [], // Fermé toute la journée
  saturday: [
    { open: "11:00", close: "23:00" } // Service continu
  ]
};