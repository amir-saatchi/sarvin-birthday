export type Locale = "fa" | "en";

export const ACTIVE_LOCALE: Locale = "fa";

export function formatNumber(value: number | string, locale: Locale = ACTIVE_LOCALE): string {
  const str = String(value);
  if (locale !== "fa") return str;
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/\d/g, (d) => persianDigits[Number(d)]);
}

export const TRANSLATIONS = {
  fa: {
    meta: {
      title: "تولدت مبارک سروین ۵ ساله! | سرزمین جادویی تک‌شاخ و رنگین‌کمان",
      description:
        "وب‌سایت تولد ۵ سالگی پرنسس سروین با موسیقی، کیک سه‌بعدی جادویی و بازی‌های سه‌بعدی تک‌شاخ و بادکنک.",
    },
    birthday: {
      name: "سروین",
      age: 5,
      badge: "پرنسس سروین ۵ ساله شد!",
      headline: "تولد ۵ سالگیت مبارک، سروین جان!",
      subheadline: "به سرزمین جادویی تک‌شاخ، رنگین‌کمان و پری‌های مهربان خوش اومدی",
      wishPrompt: "روی هر ۵ شمع روشن کیک سه‌بعدی بزن تا آرزو کنی!",
      candlesLeft: (count: number) => `${formatNumber(count, "fa")} شمع باقی مونده`,
      wishCelebration: "آفرین! هر ۵ شمع رو فوت کردی! ان‌شاءالله همه آرزوهای قشنگت برآورده بشه، پرنسس سروین!",
      relightCandles: "روشن کردن دوباره هر ۵ شمع!",
      messageTitle: "یه نامه جادویی برای پرنسس ۵ سالمون",
      messageBody:
        "تولد ۵ سالگیت مبارک سروین قشنگم! تو هر روزمون رو پر از رنگین‌کمان، خنده و جادوی قشنگ می‌کنی. امیدواریم سال پنجم زندگیت پر از تک‌شاخ‌های ناز، درخشش، ماجراهای شیرین و لبخندهای همیشگی باشه. خیلی خیلی دوستت داریم!",
      signature: "با تمام عشق و محبت همیشگی",
    },
    giftReveal: {
      badge: "سورپرایز ویژه تولد",
      greeting: "سلام سروین جان!",
      subtitle: "قلعه جادویی تولد ۵ سالگیت با موسیقی و بازی‌های سه‌بعدی آماده است!",
      openButton: "کادو رو باز کن!",
    },
    nav: {
      ariaLabel: "منوی اصلی",
      brandName: "سروین",
      brandAge: "۵ ساله",
      castle: "قلعه تولد",
      balloonGame: "بادکنک سه‌بعدی",
      unicornGame: "تک‌شاخ سه‌بعدی",
      backToCastle: "بازگشت به قلعه",
    },
    audio: {
      controlsAriaLabel: "کنترل موسیقی تولد",
      fallbackTrackTitle: "جعبه موسیقی پری‌ها",
      playAria: "پخش موسیقی",
      pauseAria: "توقف موسیقی",
      nextAria: "آهنگ بعدی",
      muteAria: "قطع صدا",
      unmuteAria: "وصل صدا",
    },
    home: {
      loadingCake: "در حال آماده کردن کیک سه‌بعدی جادویی سروین...",
      gamesSectionTitle: "بازی‌های سه‌بعدی تولدت رو بازی کن!",
      gameTag3D: "بازی سه‌بعدی",
      balloonCardTitle: "ترکوندن بادکنک‌های رنگین‌کمانی",
      balloonCardDesc:
        "روی بادکنک‌های پاستلی و ستاره‌های طلایی بزن تا با جرقه‌های رنگین‌کمانی بترکن!",
      unicornCardTitle: "تک‌شاخِ شکارچی ابرها",
      unicornCardDesc:
        "تک‌شاخ نازت رو روی ابر حرکت بده تا کاپ‌کیک، توت‌فرنگی و ستاره‌های جادویی رو بگیری!",
    },
    balloonGame: {
      title: "بازی سه‌بعدی بادکنک‌های رنگین‌کمانی",
      subtitle: "روی بادکنک‌ها و ستاره‌های طلایی (+۲ امتیاز!) بزن تا تاج رنگین‌کمانی بگیری!",
      loading: "در حال باد کردن بادکنک‌های سه‌بعدی...",
      crownSingular: "تاج",
      crownPlural: "تاج",
      restart: "شروع دوباره",
      celebration: (level: number) => `آفرین سروین! تاج رنگین‌کمانی شماره ${formatNumber(level, "fa")}!`,
      tip: "نکته: ستاره‌های طلایی پری‌ها ۲ امتیاز دارن!",
    },
    unicornGame: {
      title: "بازی سه‌بعدی تک‌شاخ روی ابر",
      subtitle: "انگشت، ماوس یا کلیدهای جهت‌نما رو حرکت بده تا ۱۵ خوراکی جادویی رو بگیری!",
      loading: "در حال بیدار کردن تک‌شاخ سه‌بعدی...",
      treatsLabel: (caught: number, target: number) =>
        `خوراکی‌ها: ${formatNumber(caught, "fa")} از ${formatNumber(target, "fa")}`,
      restart: "شروع دوباره",
      moveLeftAria: "حرکت تک‌شاخ به چپ",
      moveRightAria: "حرکت تک‌شاخ به راست",
      winBadge: "قهرمان تک‌شاخ پرنسس!",
      winTitle: "هورا، سروین جان!",
      winMessage: (target: number) =>
        `همه ${formatNumber(target, "fa")} خوراکی جادویی تولد رو گرفتی! ببین تک‌شاخت چطور می‌رقصه!`,
      playAgain: "دوباره بازی کن!",
      tip: "کاپ‌کیک، توت‌فرنگی، الماس بنفش و ستاره‌های طلایی رو بگیر تا تاج پرنسس رو ببری!",
    },
  },
  en: {
    meta: {
      title: "Happy 5th Birthday, Sarvin! | Magical Unicorn & Fairy Wonderland",
      description:
        "A magical 5th birthday website for Princess Sarvin with music, a 3D birthday cake, and 3D unicorn & rainbow mini-games.",
    },
    birthday: {
      name: "Sarvin",
      age: 5,
      badge: "PRINCESS SARVIN TURNS 5!",
      headline: "Happy 5th Birthday, Sarvin!",
      subheadline: "Welcome to your Magical Unicorn, Rainbow & Fairy Wonderland",
      wishPrompt: "Tap all 5 glowing candles on your 3D cake to make a wish!",
      candlesLeft: (count: number) => `${count} left`,
      wishCelebration: "Yay! All 5 candles blown out! May all your dreams come true, Princess Sarvin!",
      relightCandles: "Relight All 5 Candles!",
      messageTitle: "A Magical Note for Our 5-Year-Old Princess",
      messageBody:
        "Happy 5th Birthday, sweet Sarvin! You fill every single day with rainbows, giggles, and fairy magic. May your fifth year be full of unicorns, sparkles, sweet adventures, and endless smiles. We love you to the moon and over every rainbow!",
      signature: "With all our love forever",
    },
    giftReveal: {
      badge: "SPECIAL BIRTHDAY SURPRISE",
      greeting: "Hi Sarvin!",
      subtitle: "Your magical 5th birthday castle is ready with music & 3D games!",
      openButton: "Open Your Gift!",
    },
    nav: {
      ariaLabel: "Main navigation",
      brandName: "Sarvin's",
      brandAge: "5th",
      castle: "Castle",
      balloonGame: "3D Balloons",
      unicornGame: "3D Unicorn",
      backToCastle: "Back to Castle",
    },
    audio: {
      controlsAriaLabel: "Birthday Music Controls",
      fallbackTrackTitle: "Fairy Music Box",
      playAria: "Play music",
      pauseAria: "Pause music",
      nextAria: "Next song",
      muteAria: "Mute music",
      unmuteAria: "Unmute music",
    },
    home: {
      loadingCake: "Loading Sarvin's 3D Magical Cake...",
      gamesSectionTitle: "Play Your 3D Birthday Games!",
      gameTag3D: "3D GAME",
      balloonCardTitle: "Rainbow Balloon Pop",
      balloonCardDesc:
        "Tap floating 3D pastel balloons and golden fairy stars to pop them into giant rainbow sparkles!",
      unicornCardTitle: "Unicorn Cloud Catcher",
      unicornCardDesc:
        "Slide your cute 3D unicorn across the rainbow cloud to catch falling cupcakes, strawberries & stars!",
    },
    balloonGame: {
      title: "3D Rainbow Balloon Pop",
      subtitle: "Tap the floating balloons & golden stars (+2!) to win Rainbow Crowns!",
      loading: "Inflating 3D Rainbow Balloons...",
      crownSingular: "Crown",
      crownPlural: "Crowns",
      restart: "Restart",
      celebration: (level: number) => `Yay Sarvin! Rainbow Crown #${level}!`,
      tip: "Tip: Golden Fairy Stars are worth 2 points!",
    },
    unicornGame: {
      title: "3D Unicorn Cloud Catcher",
      subtitle: "Slide your finger, mouse, or arrow keys to catch 15 magical birthday treats!",
      loading: "Waking Up Your 3D Unicorn...",
      treatsLabel: (caught: number, target: number) => `Treats: ${caught} / ${target}`,
      restart: "Restart",
      moveLeftAria: "Move unicorn left",
      moveRightAria: "Move unicorn right",
      winBadge: "PRINCESS UNICORN WINNER!",
      winTitle: "Hooray, Sarvin!",
      winMessage: (target: number) =>
        `You caught all ${target} magical birthday treats! Look at your dancing unicorn!`,
      playAgain: "Play Again!",
      tip: "Catch cupcakes, strawberries, purple gems & golden stars to win the Princess Tiara!",
    },
  },
} as const;

export const t = TRANSLATIONS[ACTIVE_LOCALE];
