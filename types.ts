// Fix: Use a named interface `AIStudio` for the `aistudio` property on `Window`.
// This resolves a TypeScript error about subsequent property declarations having
// different types, which can occur when other libraries also augment the global Window type.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  // Extend the Window interface for aistudio
  interface Window {
    aistudio?: AIStudio;
  }
}

export enum Step {
  Home, 
  Characters = 1,
  World = 2,
  Story = 3,
  Preview = 4,
  FinalRender = 5,
}

export type Plan = 'Free' | 'Basic' | 'Pro' | 'Business';

export interface User {
  id: string;
  email: string;
  plan: Plan;
  profilePictureUrl?: string;
  youtubeConnected?: boolean;
}

export enum VoiceStyle {
  AdultFemale = 'Adult Female',
  AdultMale = 'Adult Male',
  ChildFemale = 'Child Female',
  ChildMale = 'Child Male',
  Narrator = 'Narrator',
}

export enum WorldStyle {
  Storybook3D = 'Storybook 3D',
  PixarLike = 'Pixar-Like',
  Claymation = 'Claymation',
  Watercolor3D = 'Watercolor 3D',
  Anime3D = 'Anime 3D',
}

export enum StoryTemplate {
  Farm = 'Saturday on the Farm',
  Beach = 'Beach Day',
  Fort = 'Rainy-Day Fort',
  Birthday = 'Birthday Surprise',
  Stargazer = 'Stargazer Trip',
  Mystery = 'Mystery of the Missing Toy',
  SciFi = 'Spaceship Adventure',
  School = 'First Day of School',
  Baking = 'Baking Cookies',
  Treehouse = 'Building a Treehouse',
  TalentShow = 'The Big Talent Show',
  LostPet = 'The Lost Pet Adventure',
  Custom = 'Custom Outline',
  AIQuick = 'AI Quick Story',
}

export interface Character {
  id: string;
  name: string;
  role: string;
  age: string;
  voiceStyle: VoiceStyle;
  costumeColor: string;
  photos: File[];
  photoPreviews: string[];
  avatarUrl: string;
  details: string;
  isPet: boolean;
}

export interface World {
  style: WorldStyle;
  stylizationStrength: number;
  backgroundSet: string;
  timePeriod: string;
  season: string;
  timeOfDay: string;
  lightingMood: string;
  props: string[];
  previewUrl: string;
}

export interface Shot {
  id: string;
  description: string;
  thumbnailUrl: string;
}

export interface Story {
  template: StoryTemplate;
  title: string;
  synopsis: string;
  scenes: string[];
  location: string;
  ageGroup: string;
  timePeriod: string;
  expandedScript: string;
  targetDuration: number; // in minutes
}

export enum JobStatus {
  Idle,
  InProgress,
  Completed,
  Failed,
}

export interface SubtitleSettings {
    fontSize: number;
    color: string;
    backgroundColor: string;
    fontFamily: string;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  storyTitle: string;
  trailerUrl?: string;
  finalUrls?: {
    film: string;
    trailer: string;
    shorts: string[];
    captions: string;
    poster: string;
    thumbnails: string[];
    script: string;
  };
  ccSettings?: SubtitleSettings;
  // Draft properties
  isDraft: boolean;
  currentStep: Step;
  characters: Character[];
  world: World;
  story: Story;
}