// --- GLOBAL VARS ---
let ysdk;
let player;
let gameState; // Объявляется здесь, инициализируется позже
let boostEndTime = 0;
let audioCtx;
let backgroundMusicBuffer;
let backgroundMusicSource;
let musicGainNode;
let sfxGainNode;
let isMusicPlaying = false;
const elements = {};
const LEADERBOARD_NAME = "prestige_level_leaderboard";
const GAME_VERSION = "3.14";
const AD_BOOST_COOLDOWN_MS = 5 * 60 * 1000;
const TIMED_BONUS_COOLDOWN_MS = 10 * 60 * 1000;
const TIMED_BONUS_DURATION_MS = 60 * 1000;
const TIMED_BONUS_REWARD_MULTIPLIER = 0.05;
const MAX_OFFLINE_TIME_MS = 24 * 60 * 60 * 1000;
const MAX_FLOATING_TEXTS = 20;
const VISUAL_FEEDBACK_COOLDOWN_MS = 75;

// Новые константы для управления тостами
const MAX_TOASTS = 2; // Максимальное количество одновременно отображаемых тостов
const activeToasts = []; // Массив для отслеживания активных тостов

let lastVisualFeedbackTime = 0;
let previousStageIndex = -1;
const IS_LOCAL_TESTING = false; // Установить в false для продакшена
let calculatedOfflineEnergy = 0;
let calculatedOfflineTime = 0;
let lastSaveTime = Date.now();
let lastEnergy = 0;
const floatingTexts = [];

// --- LOCALIZATION ---
const translations = {
    en: {
        lang_name: "English",
        settings_reset_progress: "Reset Progress",
        reset_confirm_text: "Are you sure you want to completely reset all your local progress? This cannot be undone.",
        game_title: "Evolution Clicker",
        loading_game: "Loading game...",
        prestige_label: "Prestige",
        bonus_label: "Bonus",
        to_energy_label: "to energy",
        prestige_points_label: "Prestige Points",
        prestige_button_text: "Prestige",
        ad_boost_button_text: "Ad Boost",
        daily_reward_button_text: "Daily Reward",
        timed_bonus_button_text: "Timed Bonus",
        boost_timer_label: "x2 Boost",
        stage_label: "Stage",
        energy_unit_label: "energy",
        energy_per_second_unit: "energy/sec",
        progress_to: "Progress to",
        upgrade_click_name: "Click Power",
        energy_per_click_label: "Energy/click",
        price_label: "Price",
        upgrade_auto_name: "Synthesis",
        energy_per_sec_label: "Energy/sec",
        upgrade_crit_name: "Crit. Click",
        chance_label: "Chance",
        multiplier_label: "Multiplier",
        upgrade_autoclick_name: "Auto-Click",
        clicks_per_sec_label: "Clicks/sec",
        prestige_upgrades_title: "Prestige Upgrades",
        prestige_upg_click_name: "Click Master",
        click_bonus_label: "Click bonus",
        pp_unit: "PP",
        prestige_upg_auto_name: "Efficient Synthesis",
        synthesis_bonus_label: "Synthesis bonus",
        prestige_upg_bonus_name: "Deep Knowledge",
        prestige_bonus_label_2: "Prestige bonus",
        menu_upgrades: "Upgrades",
        menu_skills_tree: "Skill Tree",
        soon: "soon",
        menu_relics: "Relics",
        leaderboard_title: "Leaderboard",
        loading: "Loading...",
        close_button: "Close",
        prestige_confirm_title: "Prestige Confirmation",
        prestige_confirm_text:
            "Are you sure you want to completely reset all your local progress? This cannot be undone.",
        prestige_confirm_yes: "Yes, I'm ready!",
        prestige_confirm_no: "No, cancel",
        settings_title: "Settings",
        settings_music: "Music",
        settings_sfx: "Sounds",
        settings_language: "Language",
        music_on: "🎵 Music On",
        music_off: "🔇 Music Off",
        sfx_on: "🔊 Sounds On",
        sfx_off: "🔕 Sounds Off",
        offline_title: "Offline Progress!",
        offline_away_for: "You were away for",
        offline_earned: "Earned",
        offline_claim: "Claim",
        offline_claim_double: "Double with an Ad 📺",
        no_audio_support: "Your browser does not support the audio element.",
        version_label: "Version",
        toast_not_enough_energy: "Not enough energy!",
        toast_not_enough_pp: "Not enough prestige points!",
        toast_click_power_up: "Click Power Lvl. {level}!",
        toast_synthesis_up: "Synthesis Lvl. {level}!",
        toast_crit_click_up: "Crit. Click Lvl. {level}!",
        toast_autoclick_up: "Auto-Click Lvl. {level}!",
        toast_click_master_up: "Click Master Lvl. {level}!",
        toast_eff_synthesis_up: "Efficient Synthesis Lvl. {level}!",
        toast_deep_knowledge_up: "Deep Knowledge Lvl. {level}!",
        toast_prestige_done: "Prestige! Level {level}! Gained 1 prestige point!",
        toast_need_stage_for_prestige: "You need to reach stage '{stageName}' to prestige.",
        toast_ad_before_prestige: "Showing ad before prestige...",
        toast_ad_closed: "Prestige ad closed. Resetting progress.",
        toast_ad_error: "Error showing prestige ad. Resetting progress.",
        toast_ad_unavailable: "SDK unavailable or local test. Prestige reset (simulating ad).",
        toast_boost_activated_sim: "x2 Boost activated (simulation)!",
        toast_boost_activated: "x2 Boost activated!",
        toast_ad_show_error: "Error showing ad.",
        toast_daily_reward_sim: "Daily reward claimed (simulation)!",
        toast_daily_ad_closed: "Daily reward ad closed.",
        toast_daily_reward_error: "Error claiming reward.",
        toast_daily_reward_claim: "Daily reward: +{amount} energy!",
        toast_timed_bonus_available: "Timed bonus is available! Click to claim!",
        toast_timed_bonus_expired: "Timed bonus has expired!",
        toast_timed_bonus_unavailable: "Timed bonus is not available right now!",
        toast_timed_bonus_sim: "Timed bonus claimed (simulation)!",
        toast_timed_bonus_ad_closed: "Timed bonus ad closed. Claiming base energy.",
        toast_timed_bonus_error: "Error claiming timed bonus.",
        toast_timed_bonus_claim: "Claimed timed bonus: +{amount} energy!",
        toast_offline_doubled_sim: "Doubled offline bonus claimed (simulation)!",
        toast_offline_ad_closed: "Offline double ad closed. Claiming base energy.",
        toast_offline_ad_error: "Error claiming doubled bonus. Claiming base energy.",
        toast_offline_claim: "Claimed {amount} offline energy!",
        toast_new_stage: "New stage: {stageName}!",
        toast_music_on: "Music enabled.",
        toast_music_off: "Music disabled.",
        toast_sfx_on: "Sound effects enabled.",
        toast_sfx_off: "Sound effects disabled.",
        toast_audio_interact: "Interact with the game first to enable audio.",
        toast_music_load_fail: "Failed to load background music.",
        toast_leaderboard_auth_error: "You must be authorized to submit scores to the leaderboard.",
        toast_leaderboard_unavailable: "SDK/player not initialized or local test. Leaderboard unavailable.",
        toast_leaderboard_view_auth_error: "You must be authorized to view the leaderboard.",
        leaderboard_empty: "Leaderboard is empty. Be the first!",
        leaderboard_error: "Error loading leaderboard.",
        leaderboard_player_entry: "Player {id}",
        leaderboard_you: "(You)",
        leaderboard_entry_extra: "(Stage: {stage}, Max: {maxStage})",
        prestige_status_ready_new: "Ready! (Unlocks a new stage)",
        prestige_status_ready_all: "Ready! (All stages unlocked)",
        prestige_status_need_stage: "Need stage '{stageName}'",
        prestige_status_all_stages: "Reach the top of all stages!",
        progress_label_max_reached: "You have reached the pinnacle of evolution! More levels are in development!",
        progress_label_max_unlocked: "Reached max unlocked stage: '{stageName}'. Prestige to unlock more!",
        ad_boost_cooldown: "Cooldown: {seconds}s",
        ad_boost_ready: "🎁 Watch",
        timed_bonus_cooldown: "In: {minutes} min",
        timed_bonus_ready: "Ready...",
        timed_bonus_active: "Left: {seconds}s"
    },
    ru: {
        lang_name: "Русский",
        settings_reset_progress: "Сбросить Прогресс",
        reset_confirm_text:
            "Вы уверены, что хотите полностью сбросить весь локальный прогресс? Это действие необратимо.",
        game_title: "Кликер Эволюции",
        loading_game: "Загрузка игры...",
        prestige_label: "Престиж",
        bonus_label: "Бонус",
        to_energy_label: "к энергии",
        prestige_points_label: "Очки престижа",
        prestige_button_text: "Престиж",
        ad_boost_button_text: "Рекламный Бонус",
        daily_reward_button_text: "Ежедневная Награда",
        timed_bonus_button_text: "Временный Бонус",
        boost_timer_label: "x2 Бонус",
        stage_label: "Этап",
        energy_unit_label: "энергии",
        energy_per_second_unit: "энергии/сек",
        progress_to: "Прогресс до",
        upgrade_click_name: "Сила Клика",
        energy_per_click_label: "Энергии/клик",
        price_label: "Цена",
        upgrade_auto_name: "Синтез",
        energy_per_sec_label: "Энергии/сек",
        upgrade_crit_name: "Крит. Клик",
        chance_label: "Шанс",
        multiplier_label: "Множитель",
        upgrade_autoclick_name: "Авто-Клик",
        clicks_per_sec_label: "Кликов/сек",
        prestige_upgrades_title: "Улучшения Престижа",
        prestige_upg_click_name: "Мастер Клика",
        click_bonus_label: "Бонус к клику",
        pp_unit: "ОП",
        prestige_upg_auto_name: "Эффективный Синтез",
        synthesis_bonus_label: "Бонус к синтезу",
        prestige_upg_bonus_name: "Глубокие Знания",
        prestige_bonus_label_2: "Бонус престижа",
        menu_upgrades: "Улучшения",
        menu_skills_tree: "Древо навыков",
        soon: "скоро",
        menu_relics: "Реликвии",
        leaderboard_title: "Таблица Лидеров",
        loading: "Загрузка...",
        close_button: "Закрыть",
        prestige_confirm_title: "Подтверждение Престижа",
        prestige_confirm_text:
            "Вы уверены? Ваш прогресс (энергия, улучшения) будет сброшен, но вы получите постоянный бонус к доходу!",
        prestige_confirm_yes: "Да, я готов!",
        prestige_confirm_no: "Нет, отмена",
        settings_title: "Настройки",
        settings_music: "Музыка",
        settings_sfx: "Звуки",
        settings_language: "Язык",
        music_on: "🎵 Музыка Вкл",
        music_off: "🔇 Музыка Выкл",
        sfx_on: "🔊 Звуки Вкл",
        sfx_off: "🔕 Звуки Выкл",
        offline_title: "Оффлайн Прогресс!",
        offline_away_for: "Вы отсутствовали",
        offline_earned: "Заработано",
        offline_claim: "Забрать",
        offline_claim_double: "Удвоить за рекламу 📺",
        no_audio_support: "Ваш браузер не поддерживает аудио элемент.",
        version_label: "Версия",
        toast_not_enough_energy: "Недостаточно энергии!",
        toast_not_enough_pp: "Недостаточно очков престижа!",
        toast_click_power_up: "Сила Клика Ур. {level}!",
        toast_synthesis_up: "Синтез Ур. {level}!",
        toast_crit_click_up: "Крит. Клик Ур. {level}!",
        toast_autoclick_up: "Авто-Клик Ур. {level}!",
        toast_click_master_up: "Мастер Клика Ур. {level}!",
        toast_eff_synthesis_up: "Эффективный Синтез Ур. {level}!",
        toast_deep_knowledge_up: "Глубокие Знания Ур. {level}!",
        toast_prestige_done: "Престиж! Уровень {level}! Получено 1 очко престижа!",
        toast_need_stage_for_prestige: "Нужно достичь этапа '{stageName}' для престижа.",
        toast_ad_before_prestige: "Показ рекламы перед престижем...",
        toast_ad_closed: "Реклама престижа закрыта. Прогресс будет сброшен.",
        toast_ad_error: "Ошибка при показе рекламы престижа. Прогресс будет сброшен.",
        toast_ad_unavailable: "SDK недоступен или локальное тестирование. Престиж будет сброшен (симуляция рекламы).",
        toast_boost_activated_sim: "x2 Бонус активирован (симуляция)!",
        toast_boost_activated: "x2 Бонус активирован!",
        toast_ad_show_error: "Ошибка при показе рекламы.",
        toast_daily_reward_sim: "Ежедневная награда получена (симуляция)!",
        toast_daily_ad_closed: "Реклама ежедневной награды закрыта.",
        toast_daily_reward_error: "Ошибка при получении награды.",
        toast_daily_reward_claim: "Ежедневная награда: +{amount} энергии!",
        toast_timed_bonus_available: "Временный бонус доступен! Нажмите, чтобы получить!",
        toast_timed_bonus_expired: "Временный бонус истек!",
        toast_timed_bonus_unavailable: "Временный бонус сейчас недоступен!",
        toast_timed_bonus_sim: "Временный бонус получен (симуляция)!",
        toast_timed_bonus_ad_closed: "Реклама временного бонуса закрыта.",
        toast_timed_bonus_error: "Ошибка при получении временного бонуса.",
        toast_timed_bonus_claim: "Получен временный бонус: +{amount} энергии!",
        toast_offline_doubled_sim: "Удвоенный оффлайн-бонус получен (симуляция)!",
        toast_offline_ad_closed: "Реклама удвоения оффлайн-бонуса закрыта. Получена базовая энергия.",
        toast_offline_ad_error: "Ошибка при получении удвоенного бонуса. Получена базовая энергия.",
        toast_offline_claim: "Получено {amount} энергии в оффлайне!",
        toast_new_stage: "Новый этап: {stageName}!",
        toast_music_on: "Музыка включена.",
        toast_music_off: "Музыка выключена.",
        toast_sfx_on: "Звуковые эффекты включены.",
        toast_sfx_off: "Звуковые эффекты выключены.",
        toast_audio_interact: "Сначала взаимодействуйте с игрой, чтобы включить звук.",
        toast_music_load_fail: "Не удалось загрузить фоновую музыку.",
        toast_leaderboard_auth_error: "Для отправки очков в таблицу лидеров необходимо авторизоваться.",
        toast_leaderboard_unavailable:
            "SDK, игрок не инициализированы или локальное тестирование. Таблица лидеров недоступна.",
        toast_leaderboard_view_auth_error: "Для просмотра таблицы лидеров необходимо авторизоваться.",
        leaderboard_empty: "Таблица лидеров пуста. Будьте первым!",
        leaderboard_error: "Ошибка загрузки таблицы лидеров.",
        leaderboard_player_entry: "Игрок {id}",
        leaderboard_you: "(Вы)",
        leaderboard_entry_extra: " (Этап: {stage}, Открыто до: {maxStage})",
        prestige_status_ready_new: "Готов! (Откроет новый этап)",
        prestige_status_ready_all: "Готов! (Все этапы открыты)",
        prestige_status_need_stage: "Нужен этап '{stageName}'",

        prestige_status_all_stages: "Достигните вершины всех этапов!",
        progress_label_max_reached: "Вы достигли вершины эволюции! Остальные уровни в разработке!",
        progress_label_max_unlocked:
            "Достигнут максимальный разблокированный этап: '{stageName}'. Сделайте престиж, чтобы открыть новые!",
        ad_boost_cooldown: "Перезарядка: {seconds}с",
        ad_boost_ready: "🎁 Смотреть",
        timed_bonus_cooldown: "Через: {minutes} мин",
        timed_bonus_ready: "Скоро...",
        timed_bonus_active: "Осталось: {seconds}с"
    }
};

// --- GAME STATE & CONFIG ---
function createDefaultGameState() {
    return {
        energy: 0,
        clickPower: 1,
        autoPower: 0,
        clickLevel: 1,
        autoLevel: 0,
        clickCost: 50,
        autoCost: 100,
        criticalLevel: 0,
        criticalChance: 0,
        criticalMultiplier: 1,
        criticalCost: 200,
        autoclickLevel: 0,
        autoclickRate: 0,
        autoclickCost: 500,
        currentStageIndex: 0,
        prestigeLevel: 0,
        prestigePoints: 0,
        prestigeClickLevel: 0,
        prestigeAutoLevel: 0,
        prestigeBonusLevel: 0,
        lastDailyReward: 0,
        lastAdBoostTime: 0,
        lastTimedBonusTime: 0,
        timedBonusAvailableUntil: 0,
        isTimedBonusActive: false,
        lastSaveTime: Date.now(),
        maxUnlockedStageIndex: 7,
        musicVolume: 0.5,
        isMusicEnabled: true,
        sfxVolume: 0.75,
        isSfxEnabled: true,
        language: "ru"
    };
}

const evolutionStages = [
    {
        name: { ru: "Атом", en: "Atom" },
        threshold: 0,
        imageUrl: "assets/images/1.png",
        videoUrl: "assets/video/stage1.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/000000/FFFFFF?text=STAGE+1%0AAtom')"
    },
    {
        name: { ru: "Молекула", en: "Molecule" },
        threshold: 25000,
        imageUrl: "assets/images/stage2.png",
        videoUrl: "assets/video/stage2.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/1a202c/FFFFFF?text=STAGE+2%0AMolecule')"
    },
    {
        name: { ru: "Клетка", en: "Cell" },
        threshold: 250000,
        imageUrl: "assets/images/stage3.png",
        videoUrl: "assets/video/stage3.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/2d3748/FFFFFF?text=STAGE+3%0ACell')"
    },
    {
        name: { ru: "Организм", en: "Organism" },
        threshold: 2500000,
        imageUrl: "assets/images/stage4.png",
        videoUrl: "assets/video/stage4.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/4a5568/FFFFFF?text=STAGE+4%0AOrganism')"
    },
    {
        name: { ru: "Цивилизация", en: "Civilization" },
        threshold: 25000000,
        imageUrl: "assets/images/stage5.png",
        videoUrl: "assets/video/stage5.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/6b7280/FFFFFF?text=STAGE+5%0ACivilization')"
    },
    {
        name: { ru: "Космос", en: "Cosmos" },
        threshold: 1000000000,
        imageUrl: "assets/images/stage6.png",
        videoUrl: "assets/video/stage6.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/9ca3af/FFFFFF?text=STAGE+6%0ACosmos')"
    },
    {
        name: { ru: "Вселенная", en: "Universe" },
        threshold: 50000000000,
        imageUrl: "assets/images/stage7.png",
        videoUrl: "assets/video/stage7.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/d1d5db/000000?text=STAGE+7%0AUniverse')"
    },
    {
        name: { ru: "Мультивселенная", en: "Multiverse" },
        threshold: 1000000000000,
        imageUrl: "assets/images/stage8.png",
        videoUrl: "assets/video/stage8.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/e5e7eb/000000?text=STAGE+8%0AMultiverse')"
    },
    // Скорректированные пороги для продолжения экспоненциального роста
    {
        name: { ru: "Квантовый Мир", en: "Quantum Realm" },
        threshold: 10000000000000,
        imageUrl: "assets/images/stage9.png",
        videoUrl: "assets/video/stage9.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/f0f0f0/000000?text=STAGE+9%0AQuantum+World')"
    },
    {
        name: { ru: "Метавселенная", en: "Metaverse" },
        threshold: 100000000000000,
        imageUrl: "assets/images/stage10.png",
        videoUrl: "assets/video/stage10.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/cccccc/000000?text=STAGE+10%0AMetaverse')"
    },
    {
        name: { ru: "Сингулярность", en: "Singularity" },
        threshold: 1000000000000000,
        imageUrl: "assets/images/stage11.png",
        videoUrl: "assets/video/stage11.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/999999/000000?text=STAGE+11%0ASingularity')"
    },
    {
        name: { ru: "Омниверс", en: "Omniverse" },
        threshold: 10000000000000000,
        imageUrl: "assets/images/stage12.png",
        videoUrl: "assets/video/stage12.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/666666/000000?text=STAGE+12%0AOmniverse')"
    },
    {
        name: { ru: "Абсолютное Бытие", en: "Absolute Being" },
        threshold: 100000000000000000,
        imageUrl: "assets/images/stage13.png",
        videoUrl: "assets/video/stage13.mp4",
        fallbackImage: "url('https://placehold.co/1920x1080/333333/FFFFFF?text=STAGE+13%0AAbsolute+Being')"
    }
];

// --- LOCALIZATION HELPERS ---
function getLangText(key, replacements = {}) {
    const lang = gameState && gameState.language ? gameState.language : "ru";
    let text = translations[lang]?.[key] || translations["ru"]?.[key] || key;
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

// Флаг для предотвращения рекурсии при смене языка
let isUpdatingLanguage = false;

function setLanguage(lang) {
    if (isUpdatingLanguage) return;
    isUpdatingLanguage = true;

    if (!translations[lang]) lang = "ru"; // Если язык не найден, по умолчанию русский
    if (gameState) gameState.language = lang; // Обновляем язык в состоянии игры
    document.documentElement.lang = lang; // Обновляем атрибут lang в HTML

    // Обновляем текстовое содержимое элементов без анимации
    document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        // Находим текстовый узел, чтобы не перезаписывать вложенные <span>
        const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
        const translatedText = getLangText(key);

        if (textNode) {
            textNode.textContent = translatedText;
        } else {
            // Если текстового узла нет (например, элемент содержит только текст), обновляем весь контент
            element.textContent = translatedText;
        }
    });

    // Обновляем заголовок документа и выбранное значение в селекторе языка
    document.title = `${getLangText("game_title")} v${GAME_VERSION}`;
    if (elements["language-selector"]) elements["language-selector"].value = lang;

    // Повторно вызываем обновление всего UI, чтобы динамические тексты также обновились
    updateAllUI();
    saveProgress();

    isUpdatingLanguage = false;
}

function populateLanguageSelector() {
    const selector = elements["language-selector"];
    if (!selector) return;
    selector.innerHTML = "";
    Object.keys(translations).forEach((langCode) => {
        const option = document.createElement("option");
        option.value = langCode;
        option.textContent = translations[langCode].lang_name;
        selector.appendChild(option);
    });
}

function handleLanguageChange(event) {
    const newLang = event.target.value;
    setLanguage(newLang);
}

// --- DOM & INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // Кэшируем все необходимые DOM-элементы
    const ids = [
        "energy-counter",
        "energy-per-second",
        "evolution-stage-name",
        "object-emoji",
        "main-object",
        "upgrade-click",
        "click-level",
        "click-power-display",
        "click-cost",
        "upgrade-auto",
        "auto-level",
        "auto-power-display",
        "auto-cost",
        "upgrade-critical",
        "critical-level",
        "critical-chance-display",
        "critical-multiplier-display",
        "critical-cost",
        "upgrade-autoclick",
        "autoclick-level",
        "autoclick-rate-display",
        "autoclick-cost",
        "prestige-button",
        "prestige-button-status",
        "prestige-level",
        "prestige-bonus",
        "prestige-points",
        "prestige-upgrade-click-power",
        "prestige-click-level",
        "prestige-click-bonus",
        "prestige-click-cost",
        "prestige-upgrade-auto-power",
        "prestige-auto-level",
        "prestige-auto-bonus",
        "prestige-auto-cost",
        "prestige-upgrade-prestige-bonus",
        "prestige-bonus-level",
        "prestige-total-bonus",
        "prestige-bonus-cost",
        "progress-bar",
        "progress-label",
        "ad-boost-button",
        "ad-boost-cooldown-text",
        "boost-timer-display",
        "boost-timer",
        "prestige-modal",
        "confirm-prestige-button",
        "cancel-prestige-button",
        "daily-reward-button",
        "toast-container",
        "leaderboard-modal",
        "leaderboard-loading",
        "leaderboard-list",
        "close-leaderboard-button",
        "preloader",
        "game-version",
        "background-video",
        "music-toggle-button",
        "music-volume-slider",
        "sfx-toggle-button",
        "sfx-volume-slider",
        "background-music",
        "upgrades-panel-container",
        "open-upgrades-menu",
        "close-upgrades-panel",
        "settings-modal",
        "open-settings-menu",
        "close-settings-button",
        "bottom-menu-bar",
        "central-content-wrapper",
        "open-skills-tree-menu",
        "open-relics-menu",
        "timed-bonus-button",
        "timed-bonus-cooldown-text",
        "offline-bonus-modal",
        "offline-time-display",
        "offline-energy-display",
        "claim-offline-button",
        "double-offline-button",
        "language-selector",
        "reset-progress-button",
        "open-leaderboard-button"
    ];
    ids.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) console.error(`Error: Element with ID '${id}' not found in DOM!`);
        elements[id] = element;
    });

    if (elements["game-version"]) elements["game-version"].textContent = GAME_VERSION;
    // Отключаем контекстное меню по правой кнопке мыши
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    // Инициализируем SDK Яндекс Игр и затем запускаем логику игры
    initYandexSDKAndGame();
});

// --- DEBUG TOOLS ---
// Функция для полного сброса прогресса (только для локального тестирования)
function resetProgress() {
    if (confirm(getLangText("reset_confirm_text"))) {
        localStorage.removeItem("evolutionClickerSave");
        gameState = createDefaultGameState();
        location.reload(); // Перезагружаем страницу для полного сброса
    }
}

// Настройка инструментов отладки (кнопка сброса прогресса)
function setupDebugTools() {
    if (IS_LOCAL_TESTING) {
        if (elements["reset-progress-button"]) {
            elements["reset-progress-button"].classList.remove("hidden"); // Показываем кнопку
            elements["reset-progress-button"].addEventListener("click", resetProgress);
        }
    }
}

// --- INITIALIZATION ---
// Асинхронная инициализация SDK Яндекс Игр и игры
async function initYandexSDKAndGame() {
    gameState = createDefaultGameState();
    loadProgress(); // Всегда загружаем прогресс (сначала из облака, потом из локального)

    // Скрываем прелоадер сразу после попытки загрузки начального состояния
    if (elements["preloader"]) {
        setTimeout(() => {
            elements["preloader"].classList.add("hidden");
        }, 500); // Небольшая задержка для плавности
    }

    initGameLogic(); // Запускаем основную логику игры с текущим состоянием

    if (IS_LOCAL_TESTING) {
        console.log("Local testing mode. Skipping Yandex SDK init.");
        return;
    }

    try {
        ysdk = await YaGames.init();
        console.log("Yandex SDK initialized.");

        // Показываем полноэкранную рекламу, но не блокируем инициализацию игры, если она не загрузится
        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: () => console.log("Fullscreen Ad closed."),
                onError: (error) => console.error("Fullscreen Ad Error:", error)
            }
        });

        // Инициализируем игрока, что также может открыть диалог авторизации
        await initPlayer();
    } catch (err) {
        console.error("Yandex Games SDK Init Error:", err);
        // Игра уже запущена с локальными данными, нет необходимости блокировать или повторно инициализировать
    }
}

// Инициализация игрока
async function initPlayer() {
    if (!ysdk) {
        console.warn("Yandex SDK not available for player initialization.");
        return;
    }

    try {
        // Пытаемся получить игрока. Если не авторизован, может появиться диалог авторизации.
        player = await ysdk.getPlayer({ scopes: true });
        console.log("Yandex Player initialized:", player.getUniqueID());
        // Если игрок успешно получен, пытаемся загрузить облачный прогресс
        loadProgress(); // Это теперь будет отдавать приоритет облачному сохранению
    } catch (e) {
        console.error("Could not get Yandex player or auth denied:", e);
        // Если игрока не удалось получить (например, авторизация отклонена), игра продолжает работу с локальными данными.
    }
}

// Основная логика инициализации игры
function initGameLogic() {
    populateLanguageSelector(); // Заполняем селектор языка
    setupDebugTools(); // Настраиваем инструменты отладки

    // Добавляем слушатели событий
    if (elements["main-object"]) {
        elements["main-object"].addEventListener("pointerdown", handlePointerDown);
        // Активируем AudioContext при первом взаимодействии пользователя
        document.body.addEventListener("pointerdown", enableAudioOnFirstInteraction, { once: true });
    }
    if (elements["upgrade-click"]) elements["upgrade-click"].addEventListener("click", upgradeClick);
    if (elements["upgrade-auto"]) elements["upgrade-auto"].addEventListener("click", upgradeAuto);
    if (elements["upgrade-critical"]) elements["upgrade-critical"].addEventListener("click", upgradeCritical);
    if (elements["upgrade-autoclick"]) elements["upgrade-autoclick"].addEventListener("click", upgradeAutoclick);
    if (elements["prestige-button"])
        elements["prestige-button"].addEventListener("click", () =>
            elements["prestige-modal"].classList.add("visible")
        );
    if (elements["ad-boost-button"]) elements["ad-boost-button"].addEventListener("click", showRewardedAd);
    if (elements["confirm-prestige-button"]) elements["confirm-prestige-button"].addEventListener("click", doPrestige);
    if (elements["cancel-prestige-button"])
        elements["cancel-prestige-button"].addEventListener("click", () =>
            elements["prestige-modal"].classList.remove("visible")
        );
    if (elements["daily-reward-button"]) elements["daily-reward-button"].addEventListener("click", claimDailyReward);
    if (elements["timed-bonus-button"]) elements["timed-bonus-button"].addEventListener("click", claimTimedBonus);
    if (elements["claim-offline-button"])
        elements["claim-offline-button"].addEventListener("click", () => claimOfflineBonus(false));
    if (elements["double-offline-button"])
        elements["double-offline-button"].addEventListener("click", () => claimOfflineBonus(true));
    if (elements["prestige-upgrade-click-power"])
        elements["prestige-upgrade-click-power"].addEventListener("click", upgradePrestigeClickPower);
    if (elements["prestige-upgrade-auto-power"])
        elements["prestige-upgrade-auto-power"].addEventListener("click", upgradePrestigeAutoPower);
    if (elements["prestige-upgrade-prestige-bonus"])
        elements["prestige-upgrade-prestige-bonus"].addEventListener("click", upgradePrestigeBonus);
    if (elements["open-leaderboard-button"])
        elements["open-leaderboard-button"].addEventListener("click", showLeaderboard);
    if (elements["close-leaderboard-button"])
        elements["close-leaderboard-button"].addEventListener("click", () =>
            elements["leaderboard-modal"].classList.remove("visible")
        );
    if (elements["open-upgrades-menu"])
        elements["open-upgrades-menu"].addEventListener("click", () =>
            elements["upgrades-panel-container"].classList.add("active")
        );
    if (elements["close-upgrades-panel"])
        elements["close-upgrades-panel"].addEventListener("click", () =>
            elements["upgrades-panel-container"].classList.remove("active")
        );
    if (elements["open-settings-menu"])
        elements["open-settings-menu"].addEventListener("click", () =>
            elements["settings-modal"].classList.add("visible")
        );
    if (elements["close-settings-button"])
        elements["close-settings-button"].addEventListener("click", () =>
            elements["settings-modal"].classList.remove("visible")
        );
    if (elements["music-toggle-button"]) elements["music-toggle-button"].addEventListener("click", toggleMusic);
    if (elements["music-volume-slider"]) elements["music-volume-slider"].addEventListener("input", updateMusicVolume);
    if (elements["sfx-toggle-button"]) elements["sfx-toggle-button"].addEventListener("click", toggleSfx);
    if (elements["sfx-volume-slider"]) elements["sfx-volume-slider"].addEventListener("input", updateSfxVolume);
    if (elements["language-selector"]) elements["language-selector"].addEventListener("change", handleLanguageChange);

    initAudio(); // Инициализируем аудио
    loadBackgroundMusic(); // Загружаем фоновую музыку

    setLanguage(gameState.language); // Устанавливаем язык из состояния игры

    // Запускаем игровые циклы
    setInterval(gameTick, 1000); // Обновление каждую секунду
    setInterval(autoClickTick, 100); // Авто-клик каждые 100 мс
    requestAnimationFrame(updateAnimations); // Обновление анимаций
}

// --- GAME LOGIC ---
// Основной игровой "тик" (обновление состояния игры каждую секунду)
function gameTick() {
    if (!gameState) return;

    // Рассчитываем прирост энергии в секунду
    let energyPerSec = gameState.autoPower * (1 + 0.1 * gameState.prestigeAutoLevel);

    // Применяем бонус x2, если активен
    if (Date.now() < boostEndTime) {
        energyPerSec *= 2;
    }

    // Применяем бонус престижа к общему доходу
    const prestigeMultiplier = 1 + gameState.prestigeLevel * (0.05 + 0.01 * gameState.prestigeBonusLevel);
    gameState.energy += energyPerSec * prestigeMultiplier;

    // Обновляем UI, если энергия значительно изменилась
    if (Math.abs(gameState.energy - lastEnergy) > 100) {
        updateStats();
        lastEnergy = gameState.energy;
    }
    updateEvolution(); // Проверяем и обновляем этап эволюции
    updatePrestige(); // Обновляем UI престижа

    // Сохраняем прогресс каждые 30 секунд
    if (Date.now() - lastSaveTime > 30000) {
        saveProgress();
        lastSaveTime = Date.now();
    }

    // Обновляем таймеры и кнопки
    updateBoostTimer();
    updateAdBoostButton();
    checkTimedBonusAvailability();
    updateTimedBonusButton();
}

// Тик авто-клика (обновление каждые 100 мс)
function autoClickTick() {
    if (!gameState || gameState.autoclickRate <= 0) return;

    // Рассчитываем количество кликов за этот тик
    const clicks = Math.min(5, gameState.autoclickRate / 10);

    // Выполняем клики
    for (let i = 0; i < clicks; i++) {
        performClick(null, true); // true означает, что это авто-клик
    }
}

// Добавление энергии с учетом бонуса престижа
function addEnergy(amount) {
    if (!gameState) return;
    const prestigeMultiplier = 1 + gameState.prestigeLevel * (0.05 + 0.01 * gameState.prestigeBonusLevel);
    gameState.energy += amount * prestigeMultiplier;
    updateStats(); // Обновляем статистику после добавления энергии
}

// Обработчик события нажатия на главный объект
function handlePointerDown(e) {
    performClick(e, false); // false означает, что это ручной клик
}

// Выполнение "клика" (ручного или автоматического)
function performClick(e, isAuto) {
    if (!gameState) return;

    let clickPower = gameState.clickPower;
    clickPower *= 1 + 0.1 * gameState.prestigeClickLevel; // Применяем бонус престижа к силе клика

    let isCritical = false;

    // Применяем бонус x2, если активен
    if (Date.now() < boostEndTime) {
        clickPower *= 2;
    }

    // Проверяем на критический удар
    if (Math.random() * 100 < gameState.criticalChance) {
        clickPower *= gameState.criticalMultiplier;
        isCritical = true;
    }

    const now = Date.now();
    let showVisual = false;

    // Всегда показываем эффекты критического удара
    if (isCritical) {
        showVisual = true;
    }
    // Для неавтоматических кликов или когда кулдаун визуальной обратной связи истек
    else if (!isAuto && now - lastVisualFeedbackTime > VISUAL_FEEDBACK_COOLDOWN_MS) {
        showVisual = true;
        lastVisualFeedbackTime = now;
    }

    addEnergy(clickPower); // Добавляем энергию

    // Воспроизводим звук и визуальные эффекты, если необходимо
    if (showVisual) {
        playSound(isCritical ? "critical" : "click");

        let x, y;
        if (e) {
            x = e.clientX;
            y = e.clientY;
        } else {
            // Если это авто-клик, позиционируем текст по центру объекта
            const rect = elements["main-object"].getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        }

        showFloatingText(clickPower, x, y, isCritical); // Показываем всплывающий текст

        // Анимируем главный объект при клике
        if (elements["main-object"]) {
            elements["main-object"].classList.add("clicked");
            const scaleDown = elements["main-object"].animate(
                [{ transform: "scale(1)" }, { transform: "scale(0.9)" }],
                { duration: 100, easing: "ease-out" }
            );

            scaleDown.onfinish = () => {
                const scaleUp = elements["main-object"].animate(
                    [{ transform: "scale(0.9)" }, { transform: "scale(1)" }],
                    { duration: 100, easing: "ease-in" }
                );

                scaleUp.onfinish = () => {
                    elements["main-object"].classList.remove("clicked");
                };
            };
        }
    }
}

// Улучшение силы клика
function upgradeClick() {
    if (!gameState) return;

    if (gameState.energy >= gameState.clickCost) {
        playSound("upgrade");
        gameState.energy -= gameState.clickCost;
        gameState.clickLevel++;
        gameState.clickPower = Math.ceil(gameState.clickPower * 1.075 + Math.pow(gameState.clickLevel, 0.8) * 0.5);
        gameState.clickCost = Math.ceil(gameState.clickCost * 1.25);
        showToast(getLangText("toast_click_power_up", { level: gameState.clickLevel }));
        updateAllUI();
    } else {
        showToast(getLangText("toast_not_enough_energy"), "error");
    }
}

// Улучшение авто-синтеза
function upgradeAuto() {
    if (!gameState) return;

    if (gameState.energy >= gameState.autoCost) {
        playSound("upgrade");
        gameState.energy -= gameState.autoCost;
        gameState.autoLevel++;
        gameState.autoPower = Math.ceil(gameState.autoPower + Math.pow(gameState.autoLevel, 0.9) * 1);
        gameState.autoCost = Math.ceil(gameState.autoCost * 1.35);
        showToast(getLangText("toast_synthesis_up", { level: gameState.autoLevel }));
        updateAllUI();
    } else {
        showToast(getLangText("toast_not_enough_energy"), "error");
    }
}

// Улучшение критического клика
function upgradeCritical() {
    if (!gameState) return;

    if (gameState.energy >= gameState.criticalCost) {
        playSound("upgrade");
        gameState.energy -= gameState.criticalCost;
        gameState.criticalLevel++;
        gameState.criticalChance = Math.min(50, gameState.criticalChance + 0.25 + 0.025 * gameState.criticalLevel);
        gameState.criticalMultiplier = Math.min(100, gameState.criticalMultiplier + 0.25);
        gameState.criticalCost = Math.ceil(gameState.criticalCost * 1.5);
        showToast(getLangText("toast_crit_click_up", { level: gameState.criticalLevel }));
        updateAllUI();
    } else {
        showToast(getLangText("toast_not_enough_energy"), "error");
    }
}

// Улучшение авто-клика
function upgradeAutoclick() {
    if (!gameState) return;

    if (gameState.energy >= gameState.autoclickCost) {
        playSound("upgrade");
        gameState.energy -= gameState.autoclickCost;
        gameState.autoclickLevel++;
        gameState.autoclickRate = Math.min(20, gameState.autoclickRate + 0.05 + 0.01 * gameState.autoclickLevel);
        gameState.autoclickCost = Math.ceil(gameState.autoclickCost * 1.6);
        showToast(getLangText("toast_autoclick_up", { level: gameState.autoclickLevel }));
        updateAllUI();
    } else {
        showToast(getLangText("toast_not_enough_energy"), "error");
    }
}

// Улучшение престижа: Мастер Клика
function upgradePrestigeClickPower() {
    if (!gameState) return;

    if (gameState.prestigePoints >= 1) {
        playSound("upgrade");
        gameState.prestigePoints -= 1;
        gameState.prestigeClickLevel++;
        showToast(getLangText("toast_click_master_up", { level: gameState.prestigeClickLevel }), "success");
        updateAllUI();
        saveProgress();
    } else {
        showToast(getLangText("toast_not_enough_pp"), "error");
    }
}

// Улучшение престижа: Эффективный Синтез
function upgradePrestigeAutoPower() {
    if (!gameState) return;

    if (gameState.prestigePoints >= 1) {
        playSound("upgrade");
        gameState.prestigePoints -= 1;
        gameState.prestigeAutoLevel++;
        showToast(getLangText("toast_eff_synthesis_up", { level: gameState.prestigeAutoLevel }), "success");
        updateAllUI();
        saveProgress();
    } else {
        showToast(getLangText("toast_not_enough_pp"), "error");
    }
}

// Улучшение престижа: Глубокие Знания
function upgradePrestigeBonus() {
    if (!gameState) return;

    if (gameState.prestigePoints >= 2) {
        playSound("upgrade");
        gameState.prestigePoints -= 2;
        gameState.prestigeBonusLevel++;
        showToast(getLangText("toast_deep_knowledge_up", { level: gameState.prestigeBonusLevel }), "success");
        updateAllUI();
        saveProgress();
    } else {
        showToast(getLangText("toast_not_enough_pp"), "error");
    }
}

// Выполнение престижа
async function doPrestige() {
    if (elements["prestige-modal"]) {
        elements["prestige-modal"].classList.remove("visible"); // Скрываем модальное окно
    }

    // Проверяем, достиг ли игрок необходимого этапа для престижа
    if (gameState.currentStageIndex < gameState.maxUnlockedStageIndex) {
        showToast(
            getLangText("toast_need_stage_for_prestige", {
                stageName: evolutionStages[gameState.maxUnlockedStageIndex].name[gameState.language]
            }),
            "error"
        );
        return;
    }

    // Показываем рекламу, если SDK доступен
    if (ysdk && !IS_LOCAL_TESTING) {
        try {
            showToast(getLangText("toast_ad_before_prestige"), "info");
            await ysdk.adv.showRewardedVideo({
                callbacks: {
                    onRewarded: executePrestigeLogic, // Выполняем логику престижа при просмотре рекламы
                    onClose: () => {
                        showToast(getLangText("toast_ad_closed"), "info");
                        executePrestigeLogic(); // Выполняем логику престижа, даже если реклама закрыта
                    },
                    onError: (err) => {
                        console.error("Prestige Ad Error:", err);
                        showToast(getLangText("toast_ad_error"), "error");
                        executePrestigeLogic(); // Выполняем логику престижа при ошибке
                    }
                }
            });
        } catch (e) {
            console.error("Could not show Prestige Ad:", e);
            showToast(getLangText("toast_ad_error"), "error");
            executePrestigeLogic(); // Выполняем логику престижа при ошибке показа рекламы
        }
    } else {
        showToast(getLangText("toast_ad_unavailable"), "info");
        executePrestigeLogic(); // Выполняем логику престижа без рекламы (для локального тестирования)
    }
}

// Логика выполнения престижа (сброс прогресса, получение бонусов)
function executePrestigeLogic() {
    playSound("prestige"); // Звук престижа

    const newPrestigeLevel = gameState.prestigeLevel + 1;
    const oldState = { ...gameState }; // Копируем старое состояние

    // Сбрасываем состояние игры, но сохраняем улучшения престижа и настройки
    gameState = createDefaultGameState();
    gameState.prestigeLevel = newPrestigeLevel;
    gameState.prestigePoints = oldState.prestigePoints + 1;
    gameState.prestigeClickLevel = oldState.prestigeClickLevel;
    gameState.prestigeAutoLevel = oldState.prestigeAutoLevel;
    gameState.prestigeBonusLevel = oldState.prestigeBonusLevel;
    // Открываем следующий этап для разблокировки
    gameState.maxUnlockedStageIndex = Math.min(evolutionStages.length - 1, oldState.maxUnlockedStageIndex + 1);
    gameState.musicVolume = oldState.musicVolume;
    gameState.isMusicEnabled = oldState.isMusicEnabled;
    gameState.sfxVolume = oldState.sfxVolume;
    gameState.isSfxEnabled = oldState.isSfxEnabled;
    gameState.language = oldState.language; // Сохраняем выбранный язык

    previousStageIndex = -1; // Сбрасываем индекс для принудительного обновления видеофона
    setLanguage(gameState.language); // Обновляем язык после сброса состояния
    showToast(getLangText("toast_prestige_done", { level: newPrestigeLevel }), "success");
    saveProgress(); // Сохраняем новый прогресс
    submitScoreToLeaderboard(); // Отправляем очки в таблицу лидеров
}

// Показ рекламы за вознаграждение (для x2 бонуса)
function showRewardedAd() {
    if (!ysdk || IS_LOCAL_TESTING) {
        showToast(getLangText("toast_boost_activated_sim"), "success");
        boostEndTime = Date.now() + 60000; // 1 минута бонуса
        gameState.lastAdBoostTime = Date.now();
        updateBoostTimer();
        updateAdBoostButton();
        return;
    }

    ysdk.adv.showRewardedVideo({
        callbacks: {
            onRewarded: () => {
                boostEndTime = Date.now() + 60000;
                gameState.lastAdBoostTime = Date.now();
                updateBoostTimer();
                updateAdBoostButton();
                showToast(getLangText("toast_boost_activated"), "success");
            },
            onError: (err) => {
                console.error("Rewarded Ad Error:", err);
                showToast(getLangText("toast_ad_show_error"), "error");
            }
        }
    });
}

// Проверка доступности ежедневной награды
function checkDailyRewardAvailability() {
    if (!elements["daily-reward-button"]) return;

    const now = new Date();
    const lastRewardDate = new Date(gameState.lastDailyReward);

    // Проверяем, наступил ли новый день
    if (
        now.getDate() !== lastRewardDate.getDate() ||
        now.getMonth() !== lastRewardDate.getMonth() ||
        now.getFullYear() !== lastRewardDate.getFullYear()
    ) {
        elements["daily-reward-button"].classList.remove("hidden");
        elements["daily-reward-button"].classList.add("affordable");
    } else {
        elements["daily-reward-button"].classList.add("hidden");
        elements["daily-reward-button"].classList.remove("affordable");
    }
}

// Получение ежедневной награды
function claimDailyReward() {
    if (!ysdk || IS_LOCAL_TESTING) {
        showToast(getLangText("toast_daily_reward_sim"), "success");
        giveDailyReward();
        return;
    }

    ysdk.adv.showRewardedVideo({
        callbacks: {
            onRewarded: giveDailyReward,
            onClose: () => showToast(getLangText("toast_daily_ad_closed"), "info"),
            onError: (err) => {
                console.error("Daily Reward Ad Error:", err);
                showToast(getLangText("toast_daily_reward_error"), "error");
            }
        }
    });
}

// Выдача ежедневной награды
function giveDailyReward() {
    const rewardAmount = 1000 * (gameState.prestigeLevel + 1); // Награда зависит от уровня престижа
    addEnergy(rewardAmount);
    gameState.lastDailyReward = Date.now();

    if (elements["daily-reward-button"]) {
        elements["daily-reward-button"].classList.add("hidden");
        elements["daily-reward-button"].classList.remove("affordable");
    }

    showToast(getLangText("toast_daily_reward_claim", { amount: formatNumber(rewardAmount) }), "success");
    playSound("reward");
    saveProgress();
    updateAllUI();
}

// Проверка доступности временного бонуса
function checkTimedBonusAvailability() {
    const now = Date.now();

    if (!gameState.isTimedBonusActive && now - gameState.lastTimedBonusTime >= TIMED_BONUS_COOLDOWN_MS) {
        gameState.isTimedBonusActive = true;
        gameState.timedBonusAvailableUntil = now + TIMED_BONUS_DURATION_MS;
        showToast(getLangText("toast_timed_bonus_available"), "info");
        playSound("newStage");
    }
}

// Обновление кнопки временного бонуса
function updateTimedBonusButton() {
    if (!elements["timed-bonus-button"] || !elements["timed-bonus-cooldown-text"]) return;

    const now = Date.now();

    if (gameState.isTimedBonusActive) {
        const secondsLeft = Math.ceil((gameState.timedBonusAvailableUntil - now) / 1000);

        if (secondsLeft > 0) {
            elements["timed-bonus-button"].classList.remove("hidden");
            elements["timed-bonus-button"].disabled = false;
            elements["timed-bonus-button"].classList.add("affordable");
            elements["timed-bonus-cooldown-text"].textContent = getLangText("timed_bonus_active", {
                seconds: secondsLeft
            });
        } else {
            // Бонус истек
            gameState.isTimedBonusActive = false;
            gameState.timedBonusAvailableUntil = 0;
            gameState.lastTimedBonusTime = now; // Начинаем отсчет кулдауна
            elements["timed-bonus-button"].classList.add("hidden");
            elements["timed-bonus-button"].classList.remove("affordable");
            showToast(getLangText("toast_timed_bonus_expired"), "error");
            playSound("error");
        }
    } else {
        // Бонус неактивен, показываем кулдаун
        elements["timed-bonus-button"].classList.add("hidden");
        elements["timed-bonus-button"].classList.remove("affordable");
        elements["timed-bonus-button"].disabled = true;

        const timeUntilAvailable = gameState.lastTimedBonusTime + TIMED_BONUS_COOLDOWN_MS - now;

        if (timeUntilAvailable > 0) {
            const minutes = Math.ceil(timeUntilAvailable / 60000);
            elements["timed-bonus-cooldown-text"].textContent = getLangText("timed_bonus_cooldown", { minutes });
        } else {
            elements["timed-bonus-cooldown-text"].textContent = getLangText("timed_bonus_ready");
        }
    }
}

// Получение временного бонуса
function claimTimedBonus() {
    if (!gameState.isTimedBonusActive) {
        showToast(getLangText("toast_timed_bonus_unavailable"), "error");
        return;
    }

    if (!ysdk || IS_LOCAL_TESTING) {
        showToast(getLangText("toast_timed_bonus_sim"), "success");
        executeTimedBonusReward();
        return;
    }

    ysdk.adv.showRewardedVideo({
        callbacks: {
            onRewarded: executeTimedBonusReward,
            onClose: () => showToast(getLangText("toast_timed_bonus_ad_closed"), "info"),
            onError: (err) => {
                console.error("Timed Bonus Ad Error:", err);
                showToast(getLangText("toast_timed_bonus_error"), "error");
            }
        }
    });
}

// Выполнение выдачи временного бонуса
function executeTimedBonusReward() {
    const bonusAmount = Math.ceil(gameState.energy * TIMED_BONUS_REWARD_MULTIPLIER);
    addEnergy(bonusAmount);
    gameState.isTimedBonusActive = false;
    gameState.timedBonusAvailableUntil = 0;
    gameState.lastTimedBonusTime = Date.now(); // Начинаем кулдаун для следующего бонуса

    if (elements["timed-bonus-button"]) {
        elements["timed-bonus-button"].classList.add("hidden");
        elements["timed-bonus-button"].classList.remove("affordable");
    }

    showToast(getLangText("toast_timed_bonus_claim", { amount: formatNumber(bonusAmount) }), "success");
    playSound("reward");
    saveProgress();
    updateAllUI();
}

// Показ модального окна оффлайн-бонуса
function showOfflineBonusModal(timeAway, energyEarned) {
    if (!elements["offline-bonus-modal"] || !elements["offline-time-display"] || !elements["offline-energy-display"]) {
        return;
    }

    calculatedOfflineTime = timeAway;
    calculatedOfflineEnergy = energyEarned;

    elements["offline-time-display"].textContent = formatTime(timeAway);
    elements["offline-energy-display"].textContent = formatNumber(energyEarned);
    elements["offline-bonus-modal"].classList.add("visible");
}

// Получение оффлайн-бонуса (с удвоением или без)
function claimOfflineBonus(doubleWithAd) {
    if (elements["offline-bonus-modal"]) {
        elements["offline-bonus-modal"].classList.remove("visible");
    }

    if (doubleWithAd) {
        if (!ysdk || IS_LOCAL_TESTING) {
            showToast(getLangText("toast_offline_doubled_sim"), "success");
            executeOfflineBonusReward(2 * calculatedOfflineEnergy);
        } else {
            ysdk.adv.showRewardedVideo({
                callbacks: {
                    onRewarded: () => executeOfflineBonusReward(2 * calculatedOfflineEnergy),
                    onClose: () => {
                        showToast(getLangText("toast_offline_ad_closed"), "info");
                        executeOfflineBonusReward(calculatedOfflineEnergy); // Выдаем базовую энергию, если реклама закрыта
                    },
                    onError: (err) => {
                        console.error("Offline Double Ad Error:", err);
                        showToast(getLangText("toast_offline_ad_error"), "error");
                        executeOfflineBonusReward(calculatedOfflineEnergy); // Выдаем базовую энергию при ошибке
                    }
                }
            });
        }
    } else {
        executeOfflineBonusReward(calculatedOfflineEnergy); // Выдаем базовую энергию
    }
}

// Выполнение выдачи оффлайн-бонуса
function executeOfflineBonusReward(amount) {
    addEnergy(amount);
    showToast(getLangText("toast_offline_claim", { amount: formatNumber(amount) }), "success");
    playSound("reward");
    updateAllUI();
}

// --- UI UPDATES ---
// Обновление всего пользовательского интерфейса
function updateAllUI() {
    if (!gameState) return;

    // Обновляем все статические элементы с атрибутом data-translate
    document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        // Находим текстовый узел, чтобы не перезаписывать вложенные <span>
        const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
        const translatedText = getLangText(key);

        if (textNode) {
            textNode.textContent = translatedText;
        } else {
            element.textContent = translatedText;
        }
    });

    // Обновляем динамические элементы, которые не охватываются data-translate напрямую
    // (например, где текст состоит из нескольких частей или содержит динамические значения)

    // Обновление текста для элементов с динамическим содержимым, которые не полностью переведены через data-translate
    if (elements["prestige-level"])
        elements["prestige-level"].parentNode.childNodes[0].nodeValue = getLangText("prestige_label") + ": ";
    if (elements["prestige-bonus"])
        elements["prestige-bonus"].parentNode.childNodes[0].nodeValue = getLangText("bonus_label") + ": +";
    if (elements["prestige-bonus"])
        elements["prestige-bonus"].parentNode.childNodes[2].nodeValue = "% " + getLangText("to_energy_label");
    if (elements["prestige-points"])
        elements["prestige-points"].parentNode.childNodes[0].nodeValue = getLangText("prestige_points_label") + ": ";

    if (elements["ad-boost-button"])
        elements["ad-boost-button"].querySelector("span").textContent = getLangText("ad_boost_button_text");
    if (elements["daily-reward-button"])
        elements["daily-reward-button"].querySelector("span").textContent = getLangText("daily_reward_button_text");
    if (elements["timed-bonus-button"])
        elements["timed-bonus-button"].querySelector("span").textContent = getLangText("timed_bonus_button_text");
    if (elements["boost-timer-display"])
        elements["boost-timer-display"].querySelector('span[data-translate="boost_timer_label"]').textContent =
            getLangText("boost_timer_label");

    if (elements["energy-counter"])
        elements["energy-counter"].nextElementSibling.textContent = getLangText("energy_unit_label");

    if (elements["upgrade-click"])
        elements["upgrade-click"].querySelector("p.font-bold span").textContent = getLangText("upgrade_click_name");
    if (elements["upgrade-click"])
        elements["upgrade-click"].querySelector("p.text-sm span").textContent = getLangText("energy_per_click_label");
    if (elements["upgrade-click"])
        elements["upgrade-click"].querySelector("p.text-sm.mt-1 span").textContent = getLangText("price_label");

    if (elements["upgrade-auto"])
        elements["upgrade-auto"].querySelector("p.font-bold span").textContent = getLangText("upgrade_auto_name");
    if (elements["upgrade-auto"])
        elements["upgrade-auto"].querySelector("p.text-sm span").textContent = getLangText("energy_per_sec_label");
    if (elements["upgrade-auto"])
        elements["upgrade-auto"].querySelector("p.text-sm.mt-1 span").textContent = getLangText("price_label");

    if (elements["upgrade-critical"])
        elements["upgrade-critical"].querySelector("p.font-bold span").textContent = getLangText("upgrade_crit_name");
    if (elements["upgrade-critical"])
        elements["upgrade-critical"].querySelector("p.text-sm span").textContent = getLangText("chance_label");
    if (elements["upgrade-critical"])
        elements["upgrade-critical"].querySelector("p.text-sm:nth-of-type(3) span").textContent =
            getLangText("multiplier_label");
    if (elements["upgrade-critical"])
        elements["upgrade-critical"].querySelector("p.text-sm.mt-1 span").textContent = getLangText("price_label");

    if (elements["upgrade-autoclick"])
        elements["upgrade-autoclick"].querySelector("p.font-bold span").textContent =
            getLangText("upgrade_autoclick_name");
    if (elements["upgrade-autoclick"])
        elements["upgrade-autoclick"].querySelector("p.text-sm span").textContent = getLangText("clicks_per_sec_label");
    if (elements["upgrade-autoclick"])
        elements["upgrade-autoclick"].querySelector("p.text-sm.mt-1 span").textContent = getLangText("price_label");

    if (elements["prestige-upgrades-title"])
        elements["prestige-upgrades-title"].textContent = getLangText("prestige_upgrades_title");

    if (elements["prestige-upgrade-click-power"])
        elements["prestige-upgrade-click-power"].querySelector("p.font-bold span").textContent =
            getLangText("prestige_upg_click_name");
    if (elements["prestige-upgrade-click-power"])
        elements["prestige-upgrade-click-power"].querySelector("p.text-sm span").textContent =
            getLangText("click_bonus_label");
    if (elements["prestige-upgrade-click-power"])
        elements["prestige-upgrade-click-power"].querySelector("p.text-sm.mt-1 span:nth-of-type(2)").textContent =
            getLangText("pp_unit");
    if (elements["prestige-upgrade-click-power"])
        elements["prestige-upgrade-click-power"].querySelector("p.text-sm.mt-1 span:nth-of-type(1)").textContent =
            elements["prestige-click-cost"].textContent; // Price label is handled by data-translate

    if (elements["prestige-upgrade-auto-power"])
        elements["prestige-upgrade-auto-power"].querySelector("p.font-bold span").textContent =
            getLangText("prestige_upg_auto_name");
    if (elements["prestige-upgrade-auto-power"])
        elements["prestige-upgrade-auto-power"].querySelector("p.text-sm span").textContent =
            getLangText("synthesis_bonus_label");
    if (elements["prestige-upgrade-auto-power"])
        elements["prestige-upgrade-auto-power"].querySelector("p.text-sm.mt-1 span:nth-of-type(2)").textContent =
            getLangText("pp_unit");
    if (elements["prestige-upgrade-auto-power"])
        elements["prestige-upgrade-auto-power"].querySelector("p.text-sm.mt-1 span:nth-of-type(1)").textContent =
            elements["prestige-auto-cost"].textContent;

    if (elements["prestige-upgrade-prestige-bonus"])
        elements["prestige-upgrade-prestige-bonus"].querySelector("p.font-bold span").textContent =
            getLangText("prestige_upg_bonus_name");
    if (elements["prestige-upgrade-prestige-bonus"])
        elements["prestige-upgrade-prestige-bonus"].querySelector("p.text-sm span").textContent =
            getLangText("prestige_bonus_label_2");
    if (elements["prestige-upgrade-prestige-bonus"])
        elements["prestige-upgrade-prestige-bonus"].querySelector("p.text-sm.mt-1 span:nth-of-type(2)").textContent =
            getLangText("pp_unit");
    if (elements["prestige-upgrade-prestige-bonus"])
        elements["prestige-upgrade-prestige-bonus"].querySelector("p.text-sm.mt-1 span:nth-of-type(1)").textContent =
            elements["prestige-bonus-cost"].textContent;

    if (elements["open-leaderboard-button"])
        elements["open-leaderboard-button"].querySelector("span").textContent = getLangText("leaderboard_title");

    if (elements["offline-bonus-modal"])
        elements["offline-bonus-modal"].querySelector("p.mb-4.text-lg").childNodes[0].nodeValue =
            getLangText("offline_away_for") + ": ";
    if (elements["offline-bonus-modal"])
        elements["offline-bonus-modal"].querySelector("p.mb-6.text-xl").childNodes[0].nodeValue =
            getLangText("offline_earned") + ": ";
    if (elements["offline-bonus-modal"])
        elements["offline-bonus-modal"].querySelector("p.mb-6.text-xl").childNodes[2].nodeValue =
            " " + getLangText("energy_unit_label");

    // Обновляем все остальные части UI
    updateStats();
    updateUpgrades();
    updateEvolution(); // Обновит название этапа и видео
    updatePrestige();
    checkDailyRewardAvailability();
    updateAdBoostButton();
    checkTimedBonusAvailability();
    updateTimedBonusButton();
    updateAudioControlsUI(); // Убедимся, что кнопки аудио обновлены
}

// Обновление анимаций (вызывается через requestAnimationFrame)
function updateAnimations() {
    if (!gameState) return;

    // Обновляем счетчик энергии
    elements["energy-counter"].textContent = formatNumber(gameState.energy);

    // Обновляем прогресс-бар
    updateProgressBar();

    // Обновляем состояние кнопок улучшений (доступность)
    elements["upgrade-click"].disabled = gameState.energy < gameState.clickCost;
    elements["upgrade-auto"].disabled = gameState.energy < gameState.autoCost;
    elements["upgrade-critical"].disabled = gameState.energy < gameState.criticalCost;
    elements["upgrade-autoclick"].disabled = gameState.energy < gameState.autoclickCost;

    // Переключаем класс "affordable" для анимации пульсации
    elements["upgrade-click"].classList.toggle("affordable", gameState.energy >= gameState.clickCost);
    elements["upgrade-auto"].classList.toggle("affordable", gameState.energy >= gameState.autoCost);
    elements["upgrade-critical"].classList.toggle("affordable", gameState.energy >= gameState.criticalCost);
    elements["upgrade-autoclick"].classList.toggle("affordable", gameState.energy >= gameState.autoclickCost);

    // Обновляем состояние кнопок улучшений престижа
    elements["prestige-upgrade-click-power"].classList.toggle("affordable", gameState.prestigePoints >= 1);
    elements["prestige-upgrade-auto-power"].classList.toggle("affordable", gameState.prestigePoints >= 1);
    elements["prestige-upgrade-prestige-bonus"].classList.toggle("affordable", gameState.prestigePoints >= 2);

    // Обновляем состояние кнопки рекламного бонуса
    const adCooldown = gameState.lastAdBoostTime + AD_BOOST_COOLDOWN_MS - Date.now();
    if (adCooldown > 0) {
        elements["ad-boost-button"].disabled = true;
        const seconds = Math.ceil(adCooldown / 1000);
        elements["ad-boost-cooldown-text"].textContent = getLangText("ad_boost_cooldown", { seconds });
        elements["ad-boost-button"].classList.remove("pulsing"); // Убираем пульсацию, если на кулдауне
    } else {
        elements["ad-boost-button"].disabled = false;
        elements["ad-boost-button"].classList.add("pulsing"); // Добавляем пульсацию, если доступно
        elements["ad-boost-cooldown-text"].textContent = getLangText("ad_boost_ready");
    }

    // Обновляем кнопку ежедневной награды
    const now = new Date();
    const lastRewardDate = new Date(gameState.lastDailyReward);
    const isNewDay =
        now.getDate() !== lastRewardDate.getDate() ||
        now.getMonth() !== lastRewardDate.getMonth() ||
        now.getFullYear() !== lastRewardDate.getFullYear();

    if (isNewDay) {
        elements["daily-reward-button"].classList.remove("hidden");
        elements["daily-reward-button"].classList.add("pulsing");
    } else {
        elements["daily-reward-button"].classList.add("hidden");
        elements["daily-reward-button"].classList.remove("pulsing");
    }

    // Обновляем кнопку временного бонуса
    if (gameState.isTimedBonusActive) {
        elements["timed-bonus-button"].classList.remove("hidden");
        elements["timed-bonus-button"].classList.add("pulsing");
    } else {
        elements["timed-bonus-button"].classList.add("hidden");
        elements["timed-bonus-button"].classList.remove("pulsing");
    }

    // Обновляем кнопку престижа
    const canPrestige = gameState.currentStageIndex === gameState.maxUnlockedStageIndex;
    elements["prestige-button"].classList.toggle("pulsing", canPrestige);

    requestAnimationFrame(updateAnimations); // Запрашиваем следующий кадр анимации
}

// Обновление статистики (энергия в секунду, бонусы престижа)
function updateStats() {
    if (!gameState) return;

    // Рассчитываем энергию в секунду с учетом бонусов
    let energyPerSec = gameState.autoPower * (1 + 0.1 * gameState.prestigeAutoLevel);

    // Применяем бонус x2, если активен
    if (Date.now() < boostEndTime) {
        energyPerSec *= 2;
    }

    // Обновляем элементы UI
    elements["energy-per-second"].textContent =
        `${formatNumber(energyPerSec)} ${getLangText("energy_per_second_unit")}`;
    elements["prestige-bonus"].textContent = (gameState.prestigeLevel * (5 + 1 * gameState.prestigeBonusLevel)).toFixed(
        0
    );
    elements["prestige-points"].textContent = gameState.prestigePoints;
}

// Обновление информации об улучшениях
function updateUpgrades() {
    if (!gameState) return;

    // Улучшение силы клика
    elements["click-level"].textContent = gameState.clickLevel;
    elements["click-power-display"].textContent = formatNumber(
        gameState.clickPower * (1 + 0.1 * gameState.prestigeClickLevel)
    );
    elements["click-cost"].textContent = formatNumber(gameState.clickCost);
    elements["upgrade-click"].disabled = gameState.energy < gameState.clickCost;

    // Улучшение авто-синтеза
    elements["auto-level"].textContent = gameState.autoLevel;
    elements["auto-power-display"].textContent = formatNumber(
        gameState.autoPower * (1 + 0.1 * gameState.prestigeAutoLevel)
    );
    elements["auto-cost"].textContent = formatNumber(gameState.autoCost);
    elements["upgrade-auto"].disabled = gameState.energy < gameState.autoCost;

    // Улучшение критического клика
    elements["critical-level"].textContent = gameState.criticalLevel;
    elements["critical-chance-display"].textContent = gameState.criticalChance.toFixed(1);
    elements["critical-multiplier-display"].textContent = gameState.criticalMultiplier.toFixed(1);
    elements["critical-cost"].textContent = formatNumber(gameState.criticalCost);
    elements["upgrade-critical"].disabled = gameState.energy < gameState.criticalCost;

    // Улучшение авто-клика
    elements["autoclick-level"].textContent = gameState.autoclickLevel;
    elements["autoclick-rate-display"].textContent = gameState.autoclickRate.toFixed(1);
    elements["autoclick-cost"].textContent = formatNumber(gameState.autoclickCost);
    elements["upgrade-autoclick"].disabled = gameState.energy < gameState.autoclickCost;

    // Улучшение престижа: Мастер Клика
    elements["prestige-click-level"].textContent = gameState.prestigeClickLevel;
    elements["prestige-click-bonus"].textContent = (10 * gameState.prestigeClickLevel).toFixed(0);
    elements["prestige-click-cost"].textContent = 1;
    elements["prestige-upgrade-click-power"].disabled = gameState.prestigePoints < 1;

    // Улучшение престижа: Эффективный Синтез
    elements["prestige-auto-level"].textContent = gameState.prestigeAutoLevel;
    elements["prestige-auto-bonus"].textContent = (10 * gameState.prestigeAutoLevel).toFixed(0);
    elements["prestige-auto-cost"].textContent = 1;
    elements["prestige-upgrade-auto-power"].disabled = gameState.prestigePoints < 1;

    // Улучшение престижа: Глубокие Знания
    elements["prestige-bonus-level"].textContent = gameState.prestigeBonusLevel;
    elements["prestige-total-bonus"].textContent = (
        gameState.prestigeLevel *
        (5 + 1 * gameState.prestigeBonusLevel)
    ).toFixed(0);
    elements["prestige-bonus-cost"].textContent = 2;
    elements["prestige-upgrade-prestige-bonus"].disabled = gameState.prestigePoints < 2;
}

// Обновление этапа эволюции и фонового видео/изображения
function updateEvolution() {
    if (!gameState) return;

    const lang = gameState.language;

    // Advance through stages if thresholds are met
    while (
        gameState.currentStageIndex < gameState.maxUnlockedStageIndex &&
        gameState.energy >= evolutionStages[gameState.currentStageIndex + 1].threshold
    ) {
        gameState.currentStageIndex++;
        const stageName = evolutionStages[gameState.currentStageIndex].name[lang];
        showToast(getLangText("toast_new_stage", { stageName }), "info");
        playSound("newStage");

        // Animate stage transition
        if (elements["main-object"]) {
            elements["main-object"].style.transform = "scale(1.2) rotate(360deg)";
            setTimeout(() => {
                elements["main-object"].style.transform = "";
            }, 500);
        }
    }

    // Update stage name
    const currentStage = evolutionStages[gameState.currentStageIndex];
    elements["evolution-stage-name"].textContent = `${getLangText("stage_label")}: ${currentStage.name[lang]}`;

    // Update main object appearance
    if (elements["main-object"] && elements["object-emoji"]) {
        if (currentStage.imageUrl) {
            elements["object-emoji"].style.display = "none";
            elements["main-object"].style.backgroundImage = `url('${currentStage.imageUrl}')`;
            elements["main-object"].style.backgroundColor = "transparent";
        } else {
            elements["object-emoji"].style.display = "block";
            elements["main-object"].style.backgroundImage = "radial-gradient(circle, #4a5568, #1a202c)";
            elements["main-object"].style.backgroundColor = "";
            elements["object-emoji"].textContent = currentStage.emoji || "⚛️";
        }
    }

    // Update background video/image if stage changed
    if (gameState.currentStageIndex !== previousStageIndex) {
        const videoElement = elements["background-video"];

        if (videoElement) {
            // Immediately hide video and show fallback image
            videoElement.style.opacity = "0";
            document.body.style.backgroundImage = currentStage.fallbackImage;

            if (currentStage.videoUrl) {
                videoElement.src = currentStage.videoUrl;
                videoElement.load(); // Load the new video

                // Attempt to play the video. The play() Promise allows tracking success/failure.
                videoElement
                    .play()
                    .then(() => {
                        videoElement.style.opacity = "1"; // Show video if playback is successful
                        document.body.style.backgroundImage = ""; // Remove fallback image
                    })
                    .catch((error) => {
                        console.error("Video autoplay failed or loading error:", error);
                        // If autoplay fails or there's a loading error,
                        // ensure fallback image is visible and video is hidden.
                        document.body.style.backgroundImage = currentStage.fallbackImage;
                        videoElement.style.opacity = "0";
                    });
            } else {
                // If no video URL, ensure video is hidden and fallback image is shown
                videoElement.style.opacity = "0";
                document.body.style.backgroundImage = currentStage.fallbackImage;
            }
        }
        previousStageIndex = gameState.currentStageIndex;
    }
}

// Обновление прогресс-бара
function updateProgressBar() {
    if (!gameState || !elements["progress-bar"] || !elements["progress-label"]) return;

    const currentStage = evolutionStages[gameState.currentStageIndex];
    // Определяем следующий этап для расчета прогресса (не более максимального разблокированного)
    const nextStageIndex = Math.min(gameState.currentStageIndex + 1, evolutionStages.length - 1);
    const nextStage = evolutionStages[nextStageIndex];
    const lang = gameState.language; // Текущий язык

    // Если достигнут последний этап
    if (gameState.currentStageIndex === evolutionStages.length - 1) {
        elements["progress-bar"].style.width = "100%";
        elements["progress-bar"].classList.add("progress-bar-maxed"); // Добавляем класс для особого стиля
        elements["progress-label"].textContent = getLangText("progress_label_max_reached");
        return;
    }

    // Рассчитываем процент прогресса
    const currentThreshold = currentStage.threshold;
    const nextThreshold = nextStage.threshold;
    let progressPercent = 0;

    if (gameState.energy >= nextThreshold) {
        progressPercent = 100; // Если энергия больше или равна порогу следующего этапа
    } else if (gameState.energy > currentThreshold) {
        // Прогресс между текущим и следующим порогом
        progressPercent = ((gameState.energy - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    }

    // Обновляем ширину прогресс-бара и убираем "максимальный" стиль
    elements["progress-bar"].style.width = `${Math.min(100, progressPercent)}%`;
    elements["progress-bar"].classList.remove("progress-bar-maxed");

    // Обновляем текст прогресс-бара в зависимости от языка и состояния
    if (gameState.currentStageIndex < gameState.maxUnlockedStageIndex) {
        elements["progress-label"].textContent = `${getLangText("progress_to")} '${nextStage.name[lang]}'`;
    } else {
        elements["progress-label"].textContent = getLangText("progress_label_max_unlocked", {
            stageName: currentStage.name[lang]
        });
    }
}

// Обновление UI престижа
function updatePrestige() {
    if (!gameState) return;

    elements["prestige-level"].textContent = gameState.prestigeLevel;
    elements["prestige-bonus"].textContent = (gameState.prestigeLevel * (5 + 1 * gameState.prestigeBonusLevel)).toFixed(
        0
    );
    elements["prestige-points"].textContent = gameState.prestigePoints;

    const canPrestige = gameState.currentStageIndex === gameState.maxUnlockedStageIndex;
    const lang = gameState.language;

    if (elements["prestige-button"]) {
        elements["prestige-button"].disabled = !canPrestige; // Отключаем кнопку, если престиж недоступен
        elements["prestige-button"].classList.toggle("affordable", canPrestige); // Добавляем/убираем класс для анимации

        // Обновляем статус кнопки престижа
        if (canPrestige) {
            if (gameState.maxUnlockedStageIndex < evolutionStages.length - 1) {
                elements["prestige-button-status"].textContent = getLangText("prestige_status_ready_new");
            } else {
                elements["prestige-button-status"].textContent = getLangText("prestige_status_ready_all");
            }
        } else {
            if (gameState.maxUnlockedStageIndex < evolutionStages.length - 1) {
                const requiredStage = evolutionStages[gameState.maxUnlockedStageIndex].name[lang];
                elements["prestige-button-status"].textContent = getLangText("prestige_status_need_stage", {
                    stageName: requiredStage
                });
            } else {
                elements["prestige-button-status"].textContent = getLangText("prestige_status_all_stages");
            }
        }
    }
}

// Обновление таймера x2 бонуса
function updateBoostTimer() {
    if (!elements["boost-timer-display"] || !elements["boost-timer"]) return;

    const secondsLeft = Math.ceil((boostEndTime - Date.now()) / 1000);

    if (secondsLeft > 0) {
        elements["boost-timer-display"].classList.remove("hidden");
        elements["boost-timer"].textContent = `${secondsLeft}s`;
    } else {
        elements["boost-timer-display"].classList.add("hidden");
    }
}

// Обновление кнопки рекламного бонуса
function updateAdBoostButton() {
    if (!elements["ad-boost-button"] || !elements["ad-boost-cooldown-text"]) return;

    const cooldown = gameState.lastAdBoostTime + AD_BOOST_COOLDOWN_MS - Date.now();

    if (cooldown > 0) {
        elements["ad-boost-button"].disabled = true;
        const seconds = Math.ceil(cooldown / 1000);
        elements["ad-boost-cooldown-text"].textContent = getLangText("ad_boost_cooldown", { seconds });
    } else {
        elements["ad-boost-button"].disabled = false;
        elements["ad-boost-button"].classList.add("pulsing");
        elements["ad-boost-cooldown-text"].textContent = getLangText("ad_boost_ready");
    }
}

// --- AUDIO FUNCTIONS ---
// Инициализация AudioContext
function initAudio() {
    if (audioCtx) return; // Если уже инициализирован, выходим

    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        musicGainNode = audioCtx.createGain();
        musicGainNode.connect(audioCtx.destination); // Подключаем к выходу аудио

        sfxGainNode = audioCtx.createGain();
        sfxGainNode.connect(audioCtx.destination); // Подключаем к выходу аудио
        sfxGainNode.gain.value = 0.1; // Уменьшаем громкость SFX, чтобы избежать клиппинга
    } catch (e) {
        console.error("AudioContext initialization failed:", e);
        showToast(getLangText("no_audio_support"), "error");
    }
}

// Активация аудио при первом взаимодействии пользователя (для обхода политики автовоспроизведения)
function enableAudioOnFirstInteraction() {
    if (!audioCtx) return;

    if (audioCtx.state === "suspended") {
        audioCtx
            .resume()
            .then(() => {
                // После возобновления контекста, если музыка включена и не играет, запускаем ее
                if (!isMusicPlaying && backgroundMusicBuffer && gameState.isMusicEnabled) {
                    playBackgroundMusic();
                }
                updateAudioControlsUI(); // Обновляем UI элементов управления аудио
            })
            .catch((e) => {
                console.error("AudioContext resume error:", e);
            });
    } else if (!isMusicPlaying && backgroundMusicBuffer && gameState.isMusicEnabled) {
        // Если контекст уже активен, но музыка не играет, запускаем ее
        playBackgroundMusic();
    }
}

// Загрузка фоновой музыки
async function loadBackgroundMusic() {
    if (!audioCtx) return;

    try {
        const response = await fetch("assets/audio/menu.ogg");
        const arrayBuffer = await response.arrayBuffer();
        backgroundMusicBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // Если AudioContext уже запущен и музыка включена, начинаем воспроизведение
        if (audioCtx.state === "running" && gameState.isMusicEnabled) {
            playBackgroundMusic();
        }
    } catch (e) {
        console.error("Error loading background music:", e);
        showToast(getLangText("toast_music_load_fail"), "error");
    }
}

// Воспроизведение фоновой музыки
function playBackgroundMusic(fadeIn = false) {
    if (!backgroundMusicBuffer || !audioCtx || !gameState.isMusicEnabled) return;

    // Останавливаем любую уже играющую музыку
    if (backgroundMusicSource) {
        backgroundMusicSource.stop();
        backgroundMusicSource.disconnect();
    }

    backgroundMusicSource = audioCtx.createBufferSource();
    backgroundMusicSource.buffer = backgroundMusicBuffer;
    backgroundMusicSource.loop = true; // Зацикливаем музыку
    backgroundMusicSource.connect(musicGainNode);

    if (fadeIn) {
        musicGainNode.gain.value = 0;
        musicGainNode.gain.linearRampToValueAtTime(gameState.musicVolume, audioCtx.currentTime + 2); // Плавное появление
    } else {
        musicGainNode.gain.value = gameState.musicVolume;
    }

    backgroundMusicSource.start(0);
    isMusicPlaying = true;
}

// Остановка фоновой музыки
function stopBackgroundMusic() {
    if (!backgroundMusicSource) return;

    // Плавное затухание перед остановкой
    musicGainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    setTimeout(() => {
        if (backgroundMusicSource) {
            backgroundMusicSource.stop();
            backgroundMusicSource.disconnect();
            backgroundMusicSource = null;
        }
        isMusicPlaying = false;
    }, 1000); // Задержка для затухания
}

// Переключение состояния музыки (вкл/выкл)
function toggleMusic() {
    if (!audioCtx || audioCtx.state === "suspended") {
        showToast(getLangText("toast_audio_interact"), "info");
        return;
    }

    gameState.isMusicEnabled = !gameState.isMusicEnabled;

    if (gameState.isMusicEnabled) {
        playBackgroundMusic(true); // Запускаем с плавным появлением
        showToast(getLangText("toast_music_on"));
    } else {
        stopBackgroundMusic(); // Останавливаем с плавным затуханием
        showToast(getLangText("toast_music_off"));
    }

    updateAudioControlsUI(); // Обновляем UI
    saveProgress(); // Сохраняем состояние
}

// Обновление громкости музыки
function updateMusicVolume() {
    if (!musicGainNode || !elements["music-volume-slider"]) return;

    gameState.musicVolume = parseFloat(elements["music-volume-slider"].value);

    if (gameState.isMusicEnabled) {
        musicGainNode.gain.value = gameState.musicVolume;
    }

    saveProgress();
}

// Переключение состояния звуковых эффектов (вкл/выкл)
function toggleSfx() {
    if (!audioCtx || audioCtx.state === "suspended") {
        showToast(getLangText("toast_audio_interact"), "info");
        return;
    }
    gameState.isSfxEnabled = !gameState.isSfxEnabled;

    if (sfxGainNode) {
        sfxGainNode.gain.value = gameState.isSfxEnabled ? gameState.sfxVolume * 0.1 : 0; // Применяем громкость SFX
    }
    showToast(gameState.isSfxEnabled ? getLangText("toast_sfx_on") : getLangText("toast_sfx_off"));
    updateAudioControlsUI();
    saveProgress();
}

// Обновление громкости звуковых эффектов
function updateSfxVolume() {
    if (!sfxGainNode || !elements["sfx-volume-slider"]) return;

    gameState.sfxVolume = parseFloat(elements["sfx-volume-slider"].value);

    if (gameState.isSfxEnabled) {
        sfxGainNode.gain.value = gameState.sfxVolume * 0.1; // Применяем громкость SFX
    }

    saveProgress();
}

// Обновление UI элементов управления аудио
function updateAudioControlsUI() {
    if (!gameState) return;

    elements["music-volume-slider"].value = gameState.musicVolume;
    elements["music-toggle-button"].textContent = gameState.isMusicEnabled
        ? getLangText("music_on")
        : getLangText("music_off");

    elements["sfx-volume-slider"].value = gameState.sfxVolume;
    elements["sfx-toggle-button"].textContent = gameState.isSfxEnabled ? getLangText("sfx_on") : getLangText("sfx_off");
}

// Воспроизведение звукового эффекта
function playSound(type) {
    if (!audioCtx || !gameState.isSfxEnabled || audioCtx.state !== "running") return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(sfxGainNode);

    // Настройка осциллятора и усиления в зависимости от типа звука
    switch (type) {
        case "click":
            oscillator.type = "triangle";
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.1;
            break;

        case "critical":
            oscillator.type = "square";
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.2;
            break;

        case "upgrade":
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(660, audioCtx.currentTime + 0.1);
            gainNode.gain.value = 0.15;
            break;

        case "prestige":
            oscillator.type = "sawtooth";
            oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.5);
            gainNode.gain.value = 0.3;
            break;

        case "newStage":
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(750, audioCtx.currentTime + 0.1);
            oscillator.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.2);
            gainNode.gain.value = 0.2;
            break;

        case "reward":
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
            oscillator.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
            gainNode.gain.value = 0.25;
            break;

        default:
            oscillator.type = "triangle";
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.1;
    }

    // Применяем плавное затухание
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    // Запускаем и останавливаем осциллятор
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// Показ всплывающего текста (например, +100 энергии)
function showFloatingText(amount, x, y, isCritical = false) {
    // Очищаем старые всплывающие тексты, если их слишком много
    while (floatingTexts.length >= MAX_FLOATING_TEXTS) {
        const text = floatingTexts.shift();
        if (text && document.body.contains(text)) {
            text.remove();
        }
    }

    const text = document.createElement("div");
    text.className = `floating-text ${isCritical ? "critical" : ""}`;
    text.textContent = `+${formatNumber(amount)}`;

    document.body.appendChild(text);

    // Позиционируем текст по месту клика
    text.style.left = `${x - text.clientWidth / 2}px`;
    text.style.top = `${y - text.clientHeight / 2}px`;

    // Добавляем случайное смещение для визуального разнообразия
    const offsetX = 50 * (Math.random() - 0.5);
    const offsetY = 50 * (Math.random() - 0.5);
    text.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    // Добавляем текст в массив отслеживания и устанавливаем таймер для удаления
    floatingTexts.push(text);
    setTimeout(() => {
        if (document.body.contains(text)) {
            text.remove();
            const index = floatingTexts.indexOf(text);
            if (index !== -1) {
                floatingTexts.splice(index, 1);
            }
        }
    }, 1000);
}

// Показ всплывающего уведомления (toast)
function showToast(message, type = "default") {
    // Если количество тостов превышает лимит, удаляем самый старый
    while (activeToasts.length >= MAX_TOASTS) {
        const oldestToast = activeToasts.shift(); // Удаляем самый старый тост из начала массива
        if (oldestToast && elements["toast-container"].contains(oldestToast)) {
            elements["toast-container"].removeChild(oldestToast);
        }
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    if (elements["toast-container"]) {
        elements["toast-container"].appendChild(toast);
        activeToasts.push(toast); // Добавляем новый тост в массив отслеживания

        // Удаляем тост через 3 секунды
        setTimeout(() => {
            if (elements["toast-container"].contains(toast)) {
                elements["toast-container"].removeChild(toast);
                // Удаляем тост из массива activeToasts после его исчезновения
                const index = activeToasts.indexOf(toast);
                if (index > -1) {
                    activeToasts.splice(index, 1);
                }
            }
        }, 3000);
    }
}

// --- UTILITY FUNCTIONS ---
// Форматирование больших чисел в сокращенный вид (K, M, B и т.д.)
function formatNumber(value) {
    if (value < 1000) return Math.floor(value).toString();

    const suffixes = ["", "K", "M", "B", "T", "P", "E", "Z", "Y"];
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3) || 0;

    if (tier === 0) return value.toString();

    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = value / scale;

    return scaled.toFixed(1).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + suffix;
}

// Форматирование времени из миллисекунд в удобочитаемый формат (дни, часы, минуты, секунды)
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];

    if (days > 0) parts.push(`${days}д`);
    if (hours % 24 > 0) parts.push(`${hours % 24}ч`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}м`);
    if (seconds % 60 > 0 && parts.length === 0) parts.push(`${seconds % 60}с`); // Показываем секунды, если это единственная единица

    return parts.join(" ") || "0с";
}

// Сохранение прогресса игры
function saveProgress() {
    if (!gameState) return;

    gameState.lastSaveTime = Date.now(); // Обновляем время последнего сохранения

    if (ysdk && ysdk.storage && player && !IS_LOCAL_TESTING) {
        // Сохраняем в облачное хранилище Яндекс Игр
        ysdk.storage.set(gameState).catch((e) => {
            console.error("Yandex Cloud Save Error:", e);
        });
        submitScoreToLeaderboard(); // Отправляем очки в таблицу лидеров
    } else {
        try {
            // Сохраняем в локальное хранилище браузера
            localStorage.setItem("evolutionClickerSave", JSON.stringify(gameState));
        } catch (e) {
            console.error("Local Storage Save Error:", e);
        }
    }
}

// Загрузка прогресса игры
function loadProgress() {
    // Внутренняя функция для обработки загруженных данных
    const processLoadedData = (data) => {
        if (!data || Object.keys(data).length === 0) return;

        const defaultState = createDefaultGameState();

        // Объединяем загруженные данные с состоянием по умолчанию, чтобы избежать ошибок из-за отсутствующих полей
        Object.keys(defaultState).forEach((key) => {
            if (data[key] !== undefined) {
                gameState[key] = data[key];
            } else {
                gameState[key] = defaultState[key];
            }
        });

        previousStageIndex = gameState.currentStageIndex; // Устанавливаем предыдущий индекс этапа

        // Расчет оффлайн-прогресса
        const now = Date.now();
        const timeAway = Math.min(now - (gameState.lastSaveTime || now), MAX_OFFLINE_TIME_MS);

        if (timeAway > 1000) {
            // Рассчитываем прирост энергии в оффлайне
            let energyGain = gameState.autoPower * (1 + 0.1 * gameState.prestigeAutoLevel) * (timeAway / 1000);

            // Применяем бонус престижа к оффлайн-доходу
            const prestigeMultiplier = 1 + gameState.prestigeLevel * (0.05 + 0.01 * gameState.prestigeBonusLevel);
            energyGain *= prestigeMultiplier;

            if (energyGain > 0) {
                showOfflineBonusModal(timeAway, energyGain); // Показываем модальное окно оффлайн-бонуса
            }
        }
        updateAllUI(); // Обновляем UI после загрузки данных
    };

    if (ysdk && ysdk.storage && player && !IS_LOCAL_TESTING) {
        // Загружаем из облачного хранилища Яндекс Игр
        console.log("Attempting to load from Yandex Cloud storage...");
        ysdk.storage
            .get()
            .then((cloudData) => {
                if (cloudData && Object.keys(cloudData).length > 0) {
                    console.log("Loaded from Yandex Cloud.");
                    processLoadedData(cloudData);
                } else {
                    console.log("No data in Yandex Cloud. Loading from local storage.");
                    loadFromLocalStorageFallback();
                }
            })
            .catch((e) => {
                console.error("Yandex Cloud Load Error, falling back to local storage:", e);
                loadFromLocalStorageFallback(); // При ошибке загрузки из облака, пробуем localStorage
            });
    } else {
        // Если SDK недоступен или локальное тестирование, загружаем из localStorage
        console.log("Yandex SDK/Player not available or local testing. Loading from local storage.");
        loadFromLocalStorageFallback();
    }
}

// Загрузка прогресса из localStorage (резервный вариант)
function loadFromLocalStorageFallback() {
    try {
        const saveData = localStorage.getItem("evolutionClickerSave");
        const data = saveData ? JSON.parse(saveData) : {};
        console.log("Loaded from local storage.");
        processLoadedData(data);
    } catch (e) {
        console.error("Local Storage Load Error:", e);
    }
}

// Отправка очков в таблицу лидеров
async function submitScoreToLeaderboard() {
    if (!ysdk || !player || IS_LOCAL_TESTING) return; // Пропускаем, если SDK недоступен или локальное тестирование

    try {
        const score = gameState.prestigeLevel;
        const extraData = {
            evolutionStage: evolutionStages[gameState.currentStageIndex].name[gameState.language],
            maxStage: evolutionStages[gameState.maxUnlockedStageIndex].name[gameState.language]
        };

        await ysdk.leaderboards.setLeaderboardScore(LEADERBOARD_NAME, score, JSON.stringify(extraData));
    } catch (e) {
        console.error("Leaderboard submit error:", e);
    }
}

// Показ таблицы лидеров
async function showLeaderboard() {
    if (!ysdk || !player || IS_LOCAL_TESTING) {
        showToast(getLangText("toast_leaderboard_unavailable"), "error");
        return;
    }

    try {
        elements["leaderboard-modal"].classList.add("visible");
        elements["leaderboard-loading"].classList.remove("hidden");
        elements["leaderboard-list"].innerHTML = "";

        const entries = await ysdk.leaderboards.getLeaderboardEntries(LEADERBOARD_NAME, {
            quantityTop: 10, // Топ-10 записей
            quantityAround: 5, // 5 записей вокруг игрока
            includeSelf: true // Включаем запись самого игрока
        });

        elements["leaderboard-loading"].classList.add("hidden"); // Скрываем загрузку

        if (entries.length === 0) {
            elements["leaderboard-list"].innerHTML =
                `<li class='text-center text-gray-400'>${getLangText("leaderboard_empty")}</li>`;
            return;
        }

        entries.forEach((entry) => {
            const li = document.createElement("li");
            const extraData = entry.extraData ? JSON.parse(entry.extraData) : {};

            let playerName =
                entry.player.publicName ||
                getLangText("leaderboard_player_entry", { id: entry.player.uniqueID.substring(0, 8) });

            // Выделяем текущего игрока
            if (player && entry.player.uniqueID === player.getUniqueID()) {
                li.classList.add("player-entry");
                playerName += ` ${getLangText("leaderboard_you")}`;
            }

            // Добавляем дополнительную информацию, если доступна
            let extraInfo = "";
            if (extraData.evolutionStage || extraData.maxStage) {
                extraInfo = getLangText("leaderboard_entry_extra", {
                    stage: extraData.evolutionStage || "?",
                    maxStage: extraData.maxStage || "?"
                });
            }

            li.innerHTML = `
                <span class="rank">${entry.rank}.</span>
                <span class="name">${playerName}</span>
                <span class="score">${entry.score} ${getLangText("pp_unit")} ${extraInfo}</span>
            `;

            elements["leaderboard-list"].appendChild(li);
        });
    } catch (e) {
        console.error("Leaderboard load error:", e);
        elements["leaderboard-loading"].classList.add("hidden");
        elements["leaderboard-list"].innerHTML =
            `<li class='text-center text-red-400'>${getLangText("leaderboard_error")}</li>`;
    }
}