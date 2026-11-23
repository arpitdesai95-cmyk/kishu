import type { PersistedAppState } from '../types/app';
import sunriseCoverImg from '../assets/images/sunrise_mountains_cover_1795236252658.jpg';
import anavalTempleImg from '../assets/images/anaval_temple_dawn_1795236254397.jpg';
import sugarcaneJuiceImg from '../assets/images/sugarcane_juice_warm_1795236249924.jpg';
import hardChapterDawnImg from '../assets/images/hard_chapter_rain_dawn_1795236256475.jpg';
import birthdayFlowersImg from '../assets/images/birthday_gift_flowers_1795236252416.jpg';
import firstScreenBalconyImg from '../assets/images/kishu_first_screen_balcony_1795243347294.jpg';
import twilightPathImg from '../assets/images/kishu_twilight_path_bg_1795243337778.jpg';

export const SCENIC_ASSETS = {
  firstScreenBalcony: firstScreenBalconyImg,
  twilightPath: twilightPathImg,
  sunriseCover: sunriseCoverImg,
  anavalTemple: anavalTempleImg,
  sugarcaneJuice: sugarcaneJuiceImg,
  hardChapterDawn: hardChapterDawnImg,
  birthdayFlowers: birthdayFlowersImg,
} as const;

export const BUNDLED_THEME_SONG_ID = 'track-kishu-zindagani';
export const BUNDLED_THEME_SONG_URL = './assets/aistudio/Kishu_Meri_Zindagani_6c52e3f4.mp3';

export function createDefaultState(): PersistedAppState {
  const now = Date.now();
  return {
    version: 1,
    albums: [
      {
        id: 'first_memories',
        name: 'First Memories ❤️',
        subtitle: 'Anaval Mahadev & where our story quietly began',
        isSystem: true,
        createdAt: now,
      },
      {
        id: 'temples',
        name: 'Temples 🛕',
        subtitle: 'Sacred mornings, quiet prayers, and peaceful steps together',
        isSystem: true,
        createdAt: now + 1,
      },
      {
        id: 'mountains',
        name: 'Mountains 🏔️',
        subtitle: 'Long drives, misty roads, and golden light above the valley',
        isSystem: true,
        createdAt: now + 2,
      },
      {
        id: 'movies',
        name: 'Movies 🎬',
        subtitle: 'Every theatre, every screen, every little memory beside you',
        isSystem: true,
        createdAt: now + 3,
      },
      {
        id: 'sugarcane',
        name: 'Sugarcane Juice 🥤',
        subtitle: 'Simple afternoons that stayed with me forever',
        isSystem: true,
        createdAt: now + 4,
      },
      {
        id: 'random_us',
        name: 'Random Us ❤️',
        subtitle: 'Unplanned smiles, everyday frames, and all the in-between',
        isSystem: true,
        createdAt: now + 5,
      },
      {
        id: 'birthday',
        name: 'Birthday Moments 🎂',
        subtitle: 'Celebrating you today and every year ahead',
        isSystem: true,
        createdAt: now + 6,
      },
      {
        id: 'all_over_memories',
        name: 'All Over Memories 📸',
        subtitle: 'Every remaining photo of us — from day one until today ❤️',
        isSystem: true,
        createdAt: now + 7,
      },
    ],
    photos: [],
    collages: [],
    reasons: [
      {
        id: 'r-1',
        text: 'Because you stayed when things were heavy and uncertain, and never let go of my hand.',
        order: 0,
      },
      {
        id: 'r-2',
        text: 'Because even a simple roadside glass of sugarcane juice feels like my favourite place when I am sitting across from you.',
        order: 1,
      },
      {
        id: 'r-3',
        text: 'Because every temple visit and mountain road feels calmer, warmer, and more meaningful with you beside me.',
        order: 2,
      },
      {
        id: 'r-4',
        text: 'Because you loved me with patience, grace, and courage — and gave us time until both of our families could see what we saw.',
        order: 3,
      },
      {
        id: 'r-5',
        text: 'Because no matter how many movies we watch together, my favourite part is always just sitting next to you.',
        order: 4,
      },
      {
        id: 'r-6',
        text: 'Because ever since Anaval Mahadev, you have quietly been my home.',
        order: 5,
      },
    ],
    openWhen: [
      {
        id: 'ow-miss',
        title: 'Open when you miss me ❤️',
        subtitle: 'For quiet evenings apart',
        message:
          'Close your eyes for a second and think of one of our long drives — windows slightly down, mountain air, and no rush to reach anywhere. Even when we are not in the same room, you are always on my mind. Call me, text me, or just hold onto this thought: I am already counting down until I see you next.\n\n— Always yours, Arpit',
        accent: 'rose',
        order: 0,
      },
      {
        id: 'ow-angry',
        title: "Open when you're angry with me 😅",
        subtitle: 'Read before staying mad too long',
        message:
          'Okay, first — I am probably wrong, or I said something silly without thinking properly. Second — I never want to hurt you, not even for a minute. Take a breath, let me make it up to you (maybe with a movie and sugarcane juice?), and remember that even when we argue, I am always on your team.\n\n— Your sorry Arpit',
        accent: 'gold',
        order: 1,
      },
      {
        id: 'ow-sad',
        title: "Open when you're sad",
        subtitle: 'When the day feels too heavy',
        message:
          'You do not have to carry everything quietly by yourself anymore. Remember how much we have already walked through together? Whatever is weighing on your heart today, let me sit with you through it. You are deeply loved, deeply valued, and never alone.\n\n— Right here beside you, Arpit',
        accent: 'plum',
        order: 2,
      },
      {
        id: 'ow-motivation',
        title: 'Open when you need motivation',
        subtitle: 'A quiet reminder of your strength',
        message:
          'If anyone ever forgets how strong you are, let me remind you: I watched you hold onto love with quiet dignity through the hardest days. You have a steadiness and grace that amazes me every single day. Take the next small step — I believe in you completely.\n\n— Always cheering for you, Arpit',
        accent: 'sage',
        order: 3,
      },
      {
        id: 'ow-sleep',
        title: "Open when you can't sleep",
        subtitle: 'For late thoughts at 2 AM',
        message:
          'Put your phone down gently after reading this, take three slow breaths, and picture the sunrise over the mountains. Think of how peaceful the temple bells sound early in the morning. Everything can wait until tomorrow — rest well, Kishu. Soon, we will not even have to say goodnight over a screen.\n\n— Goodnight, Arpit',
        accent: 'dusk',
        order: 4,
      },
      {
        id: 'ow-smile',
        title: 'Open when you want to smile',
        subtitle: 'Just because you deserve one right now',
        message:
          'Think about how our whole life changed from one unexpected visit to Anaval Mahadev… to countless movies, temple bells, mountain turns, that one sugarcane juice, and now a whole future together. You still make me smile the exact same way you did at the very beginning.\n\n— Arpit ❤️',
        accent: 'blush',
        order: 5,
      },
    ],
    audioSlots: [
      {
        id: BUNDLED_THEME_SONG_ID,
        title: 'Kishu Meri Zindagani',
        artist: 'Arpit for Kishu ❤️',
        description: 'Our special birthday song — plays automatically when you open the app',
        hasFile: true,
        fileName: 'Kishu_Meri_Zindagani.mp3',
        mimeType: 'audio/mpeg',
        bundledUrl: BUNDLED_THEME_SONG_URL,
        isSystem: true,
      },
      {
        id: 'track-ishq',
        title: 'Ishq',
        artist: 'Faheem Abdullah',
        description: 'Our signature song — attach your local audio file',
        hasFile: false,
        isSystem: true,
      },
      {
        id: 'track-parvati-hanuman',
        title: 'Parvati / Hanuman Ansh',
        artist: 'Our Sacred Song',
        description: 'For Anaval Mahadev, temples, and peaceful chapters',
        hasFile: false,
        isSystem: true,
      },
      {
        id: 'track-slot-3',
        title: 'Quiet Strength',
        artist: 'Optional Slot 1',
        description: 'Recommended for The Hard Chapter',
        hasFile: false,
        isSystem: false,
      },
      {
        id: 'track-slot-4',
        title: 'Birthday Warmth',
        artist: 'Optional Slot 2',
        description: 'Recommended for Birthday Surprise & Memories',
        hasFile: false,
        isSystem: false,
      },
      {
        id: 'track-slot-5',
        title: 'Forever Begins',
        artist: 'Optional Slot 3',
        description: 'Recommended for the Final Reveal',
        hasFile: false,
        isSystem: false,
      },
    ],
    musicSettings: {
      enabled: true,
      backgroundPlay: true,
      volume: 0.72,
      sceneTracks: {
        opening: BUNDLED_THEME_SONG_ID,
        story: 'track-parvati-hanuman',
        hard_chapter: 'track-slot-3',
        birthday: BUNDLED_THEME_SONG_ID,
        final_reveal: BUNDLED_THEME_SONG_ID,
      },
    },
    content: {
      chapters: {
        ch1Title: 'Anaval Mahadev',
        ch1Lead: 'Where our story began…',
        ch1Place: 'Anaval Mahadev.',
        ch1Body: "I didn't know that one visit would become the beginning of our story.",
        ch2Title: 'Our Journeys',
        ch2Subtitle: 'Mountains, temples, long drives, and quiet places.',
        ch2Body:
          'Some people remember trips by the destinations. I remember ours by the peace of sitting beside you on winding roads, standing together in quiet temples, and watching the light change over the hills.',
        ch3Title: 'Movies & Little Moments',
        ch3Body:
          'Between big journeys, it was the ordinary evenings — sharing movie screens and stopping for a simple glass of sugarcane juice — that quietly became my favourite memories.',
        ch4Title: 'The Hard Chapter',
        ch4Lines: [
          'You told your family about us.',
          "They didn't accept us.",
          'For a long time, things became difficult.',
          'There were arguments, distance, pain and uncertainty.',
          "But you didn't give up on us.",
        ],
        ch4Body: 'After everything…',
        ch5Title: 'When Our Families Finally Agreed',
        ch5Lines: [
          'After so much patience, understanding and effort…',
          'Our families finally said YES.',
        ],
        ch5Body:
          'Every quiet prayer, every ounce of patience, and every step of understanding brought us here together.',
        ch6Steps: [
          'Do you remember your birthday?',
          'That was the day you told your family about us.',
          'At that time… the answer was NO.',
          'But look at us now…',
          'After everything we went through…',
          'we made it here. ❤️',
        ],
        ch6BirthdayHeading: 'Happy Birthday, Kishu ❤️',
        ch6GirlfriendLine: 'Your last birthday as my girlfriend… ❤️',
        ch6NextTimeLine: 'Because next time…',
        ch6WifeLine: "I'll be wishing you as my wife. 💍",
      },
      movieQuote: 'So many movies… but somehow every movie with you became a memory.',
      movieLayout: 'poster',
      sugarcaneLines: [
        'Just a simple sugarcane juice…',
        'But somehow, one ordinary moment became one of my favourite memories with you. ❤️',
      ],
      sugarcaneCaption: 'Nothing grand, nothing planned — just us and a moment I never want to forget.',
      birthdayHeading: 'Happy Birthday, Kishu ❤️',
      birthdayLetter:
        "My dearest Kishu,\n\nSometimes I still think back to that first visit to Anaval Mahadev and smile at how quietly life gave me its greatest gift. From that day to all our temple mornings, mountain roads, endless movies, and even that simple glass of sugarcane juice — every single memory with you has made my world fuller.\n\nWe know better than anyone that our journey was not always simple. There was a birthday not so long ago when you found the courage to tell your family about us, and everything felt heavy and uncertain. Those months tested our patience, our hearts, and our faith — yet through every difficult day, we never stopped respecting our families, and we never stopped choosing each other.\n\nAnd today, here we are — together, blessed by both our families, standing on the edge of the life we prayed for.\n\nHappy Birthday, my love. Thank you for being my peace, my strength, and my favourite person to walk through life with. Next year, when your birthday comes around again, I won't just be wishing my girlfriend — I'll be wishing my wife.\n\nWith all my heart,\nArpit",
      ujjainEnabled: true,
      ujjainNote:
        'And making this birthday even more special — being together in Ujjain, seeking Mahakal’s blessings side by side as we step into our new chapter.',
      finalRevealLines: [
        'From Anaval Mahadev…',
        'to mountains…',
        'to temples…',
        'to movies…',
        'to countless memories…',
        'and that one special sugarcane juice…',
      ],
      finalRevealMilestone: 'We made it here. ❤️',
      finalRevealEnding: 'Next chapter begins soon…',
      storyProgress: {
        currentChapter: 0,
        highestUnlocked: 12,
        completed: true,
        hasOpenedGift: false,
      },
    },
  };
}
