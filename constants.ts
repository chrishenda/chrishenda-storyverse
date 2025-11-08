import { WorldStyle, StoryTemplate } from './types';

export const APP_NAME = 'Chrishenda StoryVerse';

export const STEPS = [
  'Home',
  'Characters',
  'World & Style',
  'Story',
  'Preview & CC',
  'Final Render',
];

export const WORLD_STYLES: WorldStyle[] = [
  WorldStyle.Storybook3D,
  WorldStyle.PixarLike,
  WorldStyle.Claymation,
  WorldStyle.Watercolor3D,
  WorldStyle.Anime3D,
];

export const TIME_OF_DAY_OPTIONS: string[] = [
    'Afternoon',
    'Morning',
    'Golden Hour / Evening',
    'Night',
    'Sunny Summer Day',
    'Crisp Autumn Afternoon',
    'Snowy Winter Morning',
    'Rainy Spring Day',
];

export const LIGHTING_MOOD_OPTIONS: string[] = [
    'Warm and inviting',
    'Bright and cheerful',
    'Mysterious and shadowy',
    'Soft and dreamy',
    'Dramatic and cinematic',
    'Cool and serene',
    'Magical and glowing',
];


export const STORY_TEMPLATES = [
     {
        id: StoryTemplate.AIQuick,
        title: 'AI Quick Story',
        description: 'Generate a story from a single word or phrase.',
        ageGroup: 'Any',
        tags: ['AI', 'Fast', 'Creative'],
        imageUrl: 'https://image.lexica.art/full_jpg/3b3c2763-1574-4654-8463-c6c74996a603'
    },
    {
        id: StoryTemplate.Custom,
        title: 'Custom Story',
        description: 'Create a completely unique story from your own ideas.',
        ageGroup: 'Any',
        tags: ['Imagination', 'Creative', 'Unique'],
        imageUrl: 'https://image.lexica.art/full_jpg/741a2342-791e-4395-8278-4a5330c6a593'
    },
    {
        id: StoryTemplate.Farm,
        title: 'Saturday on the Farm',
        description: 'A delightful day discovering animals and nature.',
        ageGroup: '3-5 years',
        tags: ['Adventure', 'Animals', 'Outdoors'],
        imageUrl: 'https://image.lexica.art/full_jpg/e8a21160-9856-42d4-9549-3176a6f66309'
    },
    {
        id: StoryTemplate.Beach,
        title: 'Beach Day',
        description: 'Building sandcastles and splashing in the waves.',
        ageGroup: '3-9 years',
        tags: ['Family', 'Summer', 'Fun'],
        imageUrl: 'https://image.lexica.art/full_jpg/21b4edc2-921c-43f1-b960-b4e8c6792e35'
    },
    {
        id: StoryTemplate.Fort,
        title: 'Rainy-Day Fort',
        description: 'An imaginative adventure inside a cozy blanket fort.',
        ageGroup: '3-9 years',
        tags: ['Creative', 'Cozy', 'Imagination'],
        imageUrl: 'https://image.lexica.art/full_jpg/f6e21021-4c6c-4e50-a96c-9c6f2a40e1b6'
    },
    {
        id: StoryTemplate.Birthday,
        title: 'Birthday Surprise',
        description: 'A secret party with friends, cake, and presents.',
        ageGroup: 'Family',
        tags: ['Celebration', 'Friends', 'Surprise'],
        imageUrl: 'https://image.lexica.art/full_jpg/5a49479e-c90a-4286-a518-2566c59fe591'
    },
    {
        id: StoryTemplate.Stargazer,
        title: 'Stargazer Trip',
        description: 'A magical night camping and learning about constellations.',
        ageGroup: '6-9 years',
        tags: ['Educational', 'Night', 'Wonder'],
        imageUrl: 'https://image.lexica.art/full_jpg/1a7f7112-82f7-432d-9860-8484112e4719'
    },
    {
        id: StoryTemplate.Mystery,
        title: 'Mystery of the Missing Toy',
        description: 'Become detectives to solve the case of a favorite lost toy.',
        ageGroup: '5-9 years',
        tags: ['Mystery', 'Problem-Solving', 'Indoor'],
        imageUrl: 'https://image.lexica.art/full_jpg/0c4a45f6-22a8-4448-937b-58f70275e533'
    },
    {
        id: StoryTemplate.SciFi,
        title: 'Spaceship Adventure',
        description: 'Blast off in a cardboard box rocket to explore a new planet.',
        ageGroup: '4-8 years',
        tags: ['Sci-Fi', 'Imagination', 'Space'],
        imageUrl: 'https://image.lexica.art/full_jpg/8d94b0a4-325d-419b-944a-95240c436f71'
    },
    {
        id: StoryTemplate.School,
        title: 'First Day of School',
        description: 'Navigating new friendships and classroom excitement.',
        ageGroup: '4-6 years',
        tags: ['Milestone', 'Friends', 'School'],
        imageUrl: 'https://image.lexica.art/full_jpg/c8a21160-9856-42d4-9549-3176a6f66309'
    },
    {
        id: StoryTemplate.Baking,
        title: 'Baking Cookies',
        description: 'A messy but delicious baking session with a loved one.',
        ageGroup: '3-7 years',
        tags: ['Family', 'Food', 'Cozy'],
        imageUrl: 'https://image.lexica.art/full_jpg/d8a21160-9856-42d4-9549-3176a6f66309'
    },
    {
        id: StoryTemplate.Treehouse,
        title: 'Building a Treehouse',
        description: 'Teamwork and creativity come together to build a backyard hideout.',
        ageGroup: '5-9 years',
        tags: ['Outdoors', 'Building', 'Teamwork'],
        imageUrl: 'https://image.lexica.art/full_jpg/b8a21160-9856-42d4-9549-3176a6f66309'
    },
    {
        id: StoryTemplate.TalentShow,
        title: 'The Big Talent Show',
        description: 'Overcoming stage fright to share a special talent.',
        ageGroup: '5-9 years',
        tags: ['Courage', 'Performance', 'Arts'],
        imageUrl: 'https://image.lexica.art/full_jpg/a8a21160-9856-42d4-9549-3176a6f66309'
    },
    {
        id: StoryTemplate.LostPet,
        title: 'The Lost Pet Adventure',
        description: 'A neighborhood search for a beloved furry friend.',
        ageGroup: '4-8 years',
        tags: ['Animals', 'Responsibility', 'Community'],
        imageUrl: 'https://image.lexica.art/full_jpg/98a21160-9856-42d4-9549-3176a6f66309'
    },
];


export const PLAN_LIMITS = {
  Free: { videos: 1, label: 'Free' },
  Basic: { videos: 5, label: 'Basic' },
  Pro: { videos: 20, label: 'Pro' },
  Business: { videos: Infinity, label: 'Business' },
};
