export type QuoteCategory =
  | 'anaval'
  | 'trips'
  | 'movies'
  | 'sugarcane'
  | 'hard_chapter'
  | 'families_agreed'
  | 'birthday'
  | 'all_over';

const CHAPTER_QUOTES: Record<QuoteCategory, string[]> = {
  anaval: [
    'That quiet moment at Anaval Mahadev when my heart knew before I even did… ♡',
    'Two smiles, one sacred blessing, and a whole lifetime silently beginning.',
    'Holding your hand felt like the calmest prayer ever answered.',
    'I didn’t know one visit would turn into the most beautiful story of my life.',
    'If I could freeze one afternoon forever, it would be right here beside you.',
    'Every road after that day gently led my heart straight back to you, Kishu. ♡',
    'You smiled, and suddenly the whole world felt softer.',
    'Where destiny quietly wrote our names side by side. ♡',
  ],
  trips: [
    'Every temple bell felt like a quiet blessing whispered over the two of us. ♡',
    'Long roads, mountain air, and my favorite view was always sitting beside me.',
    'Peace isn’t a place on a map — it’s standing next to you with folded hands.',
    'Even the highest hills felt warmer with your hand tucked into mine.',
    'Some journeys end when you reach home; ours began every time we stepped out together.',
    'Sunsets hit differently when your laugh is echoing beside me. ♡',
    'No matter how far the road went, I never once wanted the drive to end.',
    'Sacred places, quiet prayers, and one silent wish in my heart — always you.',
    'Miles of winding hills, soft songs, and a thousand little smiles between us.',
    'Wherever life takes us next, I only want to walk those roads with you. ♡',
  ],
  movies: [
    'Half the movie I watched the screen… the other half I couldn’t stop smiling at you. ♡',
    'Dim cinema lights, warm popcorn, and my favorite seat right next to yours.',
    'Even an ordinary film becomes unforgettable when your hand is in mine.',
    'Every ticket stub is just proof of another evening I fell for you all over again.',
    'Our real favorite love story was never on the big screen — it was sitting in our row. ♡',
    'Lost count of how many movies we watched, never lost count of how happy you made me.',
  ],
  sugarcane: [
    'Just one simple glass of sugarcane juice… and somehow it tastes like pure happiness. ♡',
    'Proof that the simplest afternoons with you are worth more than the grandest days.',
    'Sweet, ordinary, and forever my favorite little ritual with you.',
    'You turned even a quick roadside stop into a memory I’ll keep for life. ♡',
  ],
  hard_chapter: [
    'Even on the hardest days, my heart never once doubted that you were worth everything. ♡',
    'We bent in the storm, we cried in silence — and still, you never let go of my hand.',
    'Real love isn’t just sunny skies; it’s choosing each other when everything says stop.',
    'Thank you for being brave enough to stand by us when the world tested us. ♡',
  ],
  families_agreed: [
    'After every tear, prayer, and patient night… the sunrise finally arrived for us. ♡',
    'When both families smiled and said YES, my whole heart breathed easy at last.',
    'God heard every quiet prayer we ever whispered for each other.',
    'From fighting for our love to celebrating it with everyone we love. ♡',
  ],
  birthday: [
    'Happy Birthday to the girl who turned my ordinary days into my favorite life. ♡',
    'Your last birthday as my girlfriend… because forever as my wife is almost here. 💍',
    'May every candle you blow out bring you closer to every dream in your heart.',
    'Celebrating you today, tomorrow, and every birthday for the rest of our lives. ♡',
  ],
  all_over: [
    'Just us — no filter, no occasion, just pure love in an everyday moment. ♡',
    'My favorite place in the entire world will always be right beside your smile.',
    'Every little photo here holds a heartbeat I never want to forget.',
    'You make even the smallest, most random Tuesday feel like magic. ♡',
    'Looking at you here still gives me the exact same butterflies as day one.',
    'A thousand little moments that quietly built our forever.',
    'My best friend, my safe place, my favorite smile in every room. ♡',
    'If love had a face, it would look just like the way you smile in this frame.',
    'Every season, every mood, every day — I’d choose you all over again.',
    'Little memories that mean the whole universe to me, Kishu. ♡',
  ],
};

export function getPhotoQuote(
  category: QuoteCategory,
  index: number,
  customCaption?: string
): string {
  if (customCaption && customCaption.trim().length > 0) {
    return customCaption.trim();
  }
  const pool = CHAPTER_QUOTES[category] || CHAPTER_QUOTES.all_over;
  return pool[index % pool.length];
}
