# ПЛАН РАЗРАБОТКИ EVOLUTION CLICKER v4.0

## Статус документа
- **Версия плана:** 1.0
- **Дата создания:** 2025
- **Статус:** Ожидает утверждения

---

## ЧАСТЬ 1: АНАЛИЗ ТЕКУЩИХ ОШИБОК И ПРОБЛЕМ

### 1.1 Критические ошибки

#### ❌ [CRITICAL-001] Логика начисления очков престижа
**Файл:** `script.js`, строки 1047-1076 (`executePrestigeLogic`)
**Проблема:** 
- Игрок получает только +1 очко престижа за каждый сброс
- Нет накопления потенциальных очков престижа до сброса
- Формула не учитывает текущий прогресс (энергию, этап)

**Текущий код:**
```javascript
gameState.prestigePoints = oldState.prestigePoints + 1;
```

**Ожидаемое поведение:**
- Очки престижа должны накапливаться во время игры
- При сбросе игрок получает все накопленные очки
- Формула должна учитывать: текущий этап, общую энергию, уровень престижа

---

#### ❌ [CRITICAL-002] Отсутствие системы реликвий
**Файл:** `index.html`, строки 276-278
**Проблема:** 
- Кнопка "Реликвии" заблокирована (`disabled`)
- Нет модального окна для реликвий
- Нет логики покупки/активации реликвий

**Требуется:**
- Создать новую панель/модальное окно для реликвий
- Реализовать систему покупки реликвий за очки престижа
- Добавить пассивные бонусы от реликвий

---

#### ❌ [CRITICAL-003] Отсутствие древа навыков
**Файл:** `index.html`, строки 271-275
**Проблема:** 
- Кнопка "Древо навыков" заблокирована
- Нет визуализации древа
- Нет механики прокачки навыков

**Требуется:**
- Создать UI для древа навыков
- Реализовать систему навыков с зависимостями
- Добавить механику сброса навыков (ресет)

---

### 1.2 Ошибки средней важности

#### ⚠️ [MEDIUM-001] Потенциальная утечка памяти в floatingTexts
**Файл:** `script.js`, строки 2046-2083
**Проблема:** 
- Массив `floatingTexts` может расти бесконечно при быстрой генерации
- Удаление элементов происходит только после завершения анимации

**Рекомендация:**
- Добавить жесткое ограничение на размер массива
- Использовать WeakRef для DOM элементов

---

#### ⚠️ [MEDIUM-002] Жестко заданные пороги этапов эволюции
**Файл:** `script.js`, строки 330-425
**Проблема:** 
- Пороги этапов заданы константами
- Сложно балансировать игру
- Нет масштабируемости под престиж

**Рекомендация:**
- Вынести конфигурацию в отдельный объект
- Добавить множитель сложности от уровня престижа

---

#### ⚠️ [MEDIUM-003] Отсутствие валидации данных при загрузке
**Файл:** `script.js`, строки 2172-2233 (`loadProgress`)
**Проблема:** 
- Нет проверки на корректность JSON
- Нет проверки диапазонов значений
- Поврежденный save может сломать игру

**Рекомендация:**
- Добавить try-catch для JSON.parse
- Валидировать все числовые поля
- Добавить сброс при критических ошибках

---

### 1.3 Оптимизации

#### 🔄 [OPT-001] Избыточные вызовы updateAllUI()
**Файл:** `script.js`,多处
**Проблема:** 
- `updateAllUI()` вызывается слишком часто
- Перерисовываются все элементы даже при минимальных изменениях

**Рекомендация:**
- Разделить на специализированные функции обновления
- Использовать dirty-checking для изменений
- Кэшировать DOM запросы

---

#### 🔄 [OPT-002] Неэффективная работа с localStorage
**Файл:** `script.js`, строки 2150-2170 (`saveProgress`)
**Проблема:** 
- Сохранение происходит слишком часто
- Нет debouncing для серийных сохранений

**Рекомендация:**
- Добавить throttling (сохранение не чаще 1 раза в 5 сек)
- Сохранять только при значительных изменениях

---

#### 🔄 [OPT-003] Глобальные переменные без инкапсуляции
**Файл:** `script.js`, строки 2-34
**Проблема:** 
- Много глобальных переменных
- Риск конфликтов имен
- Сложность тестирования

**Рекомендация:**
- Обернуть в IIFE или ES6 модуль
- Использовать const вместо let где возможно

---

## ЧАСТЬ 2: ИНТЕГРАЦИЯ GAMEPUSH SDK

### 2.1 Подготовка

#### 📦 [GP-001] Регистрация проекта в GamePush
**Задачи:**
- [ ] Зарегистрироваться на https://gamepush.com
- [ ] Создать новый проект
- [ ] Получить API ключ и ID проекта
- [ ] Настроить вебхуки для событий

**Документация:** https://gamepush.com/docs/

---

#### 📦 [GP-002] Подключение SDK
**Файл:** `index.html`
**Изменения:**
```html
<!-- Добавить в <head> после Yandex SDK -->
<script src="https://gamepush.com/gamepush.js"></script>
```

**Файл:** `script.js`
**Изменения:**
- Добавить глобальную переменную `gamepush`
- Инициализировать SDK после загрузки страницы

---

### 2.2 Реализация функций

#### 🎮 [GP-003] Инициализация GamePush
**Файл:** `script.js`
**Новая функция:**
```javascript
async function initGamePush() {
    return new Promise((resolve, reject) => {
        gp.init({
            projectId: GAMEPUSH_PROJECT_ID,
            onSuccess: () => {
                console.log('GamePush initialized');
                resolve();
            },
            onError: (err) => {
                console.error('GamePush init error:', err);
                reject(err);
            }
        });
    });
}
```

---

#### 💾 [GP-004] Сохранение прогресса в облако
**Файл:** `script.js`
**Изменения в `saveProgress()`:**
- Добавить синхронизацию с GamePush cloud save
- Реализовать merge локальных и облачных данных

**Новая функция:**
```javascript
async function saveToCloud() {
    if (gp && gp.player) {
        await gp.player.setData({
            saveData: JSON.stringify(gameState),
            timestamp: Date.now()
        });
    }
}
```

---

#### 📥 [GP-005] Загрузка прогресса из облака
**Файл:** `script.js`
**Изменения в `loadProgress()`:**
- Проверить наличие облачного сохранения
- Сравнить timestamp с локальным
- Выбрать наиболее свежую версию

**Новая функция:**
```javascript
async function loadFromCloud() {
    if (gp && gp.player) {
        const data = await gp.player.getData();
        if (data && data.saveData) {
            return JSON.parse(data.saveData);
        }
    }
    return null;
}
```

---

#### 🏆 [GP-006] Таблица лидеров через GamePush
**Файл:** `script.js`
**Изменения:**
- Заменить Yandex Leaderboard на GamePush
- Добавить отправку очков при престиже
- Обновить UI таблицы лидеров

**Новые функции:**
```javascript
async function submitScoreToGamePush(score) {
    if (gp && gp.leaderboards) {
        await gp.leaderboards.set({
            name: 'prestige_global',
            score: score,
            extra: { stage: gameState.currentStageIndex }
        });
    }
}

async function showGamePushLeaderboard() {
    if (gp && gp.leaderboards) {
        const entries = await gp.leaderboards.get({ name: 'prestige_global' });
        renderLeaderboard(entries);
    }
}
```

---

#### 🔔 [GP-007] Push-уведомления (опционально)
**Файл:** `script.js`
**Новые функции:**
- Отправка пушей о готовности бонусов
- Напоминание об оффлайн-прогрессе

---

#### 📊 [GP-008] Аналитика событий
**Файл:** `script.js`
**События для отслеживания:**
```javascript
// При клике
gp.event.send('click', { energy: amount, isCritical: isCritical });

// При покупке улучшения
gp.event.send('upgrade_buy', { type: upgradeType, level: newLevel });

// При престиже
gp.event.send('prestige', { 
    level: newPrestigeLevel, 
    totalEnergy: oldState.energy 
});

// При достижении этапа
gp.event.send('stage_reached', { stageIndex: newIndex });
```

---

### 2.3 Конфигурация

#### ⚙️ [GP-009] Константы GamePush
**Файл:** `script.js`
**Добавить:**
```javascript
const GAMEPUSH_PROJECT_ID = 'YOUR_PROJECT_ID'; // Заменить на реальный
const GAMEPUSH_LEADERBOARD_NAME = 'prestige_global';
const ENABLE_GAMEPUSH_CLOUD_SAVE = true;
const ENABLE_GAMEPUSH_ANALYTICS = true;
```

---

## ЧАСТЬ 3: ДОРАБОТКА МЕХАНИКИ ПРЕСТИЖА

### 3.1 Система накопления очков престижа

#### ✨ [PR-001] Формула расчета очков престижа
**Файл:** `script.js`
**Новая функция:**
```javascript
function calculatePendingPrestigePoints() {
    const basePoints = gameState.currentStageIndex + 1;
    
    // Бонус за общую заработанную энергию
    const energyBonus = Math.floor(Math.log10(Math.max(1, gameState.totalEnergyEarned)) / 3);
    
    // Бонус за текущий уровень престижа (убывающая отдача)
    const prestigeMultiplier = 1 + (gameState.prestigeLevel * 0.1);
    
    // Итоговые очки
    const pendingPoints = Math.floor((basePoints + energyBonus) * prestigeMultiplier);
    
    return Math.max(1, pendingPoints - gameState.prestigePointsSpent);
}
```

**Изменения в gameState:**
```javascript
{
    totalEnergyEarned: 0,        // Новая переменная
    prestigePointsSpent: 0,      // Новая переменная
    pendingPrestigePoints: 0     // Новая переменная (рассчитывается)
}
```

---

#### ✨ [PR-002] Отображение накопленных очков
**Файл:** `index.html`
**Добавить элемент:**
```html
<p class="text-sm text-purple-400">
    Доступно после престижа: <span id="pending-prestige-points">0</span> ОП
</p>
```

**Файл:** `script.js`
**Новая функция:**
```javascript
function updatePendingPrestigeUI() {
    const pending = calculatePendingPrestigePoints();
    if (elements["pending-prestige-points"]) {
        elements["pending-prestige-points"].textContent = formatNumber(pending);
    }
}
```

---

#### ✨ [PR-003] Обновленная логика выполнения престижа
**Файл:** `script.js`
**Изменения в `executePrestigeLogic()`:**
```javascript
function executePrestigeLogic() {
    playSound("prestige");
    
    const pendingPoints = calculatePendingPrestigePoints();
    const newPrestigeLevel = gameState.prestigeLevel + 1;
    const oldState = { ...gameState };
    
    // Сброс с сохранением накопленных очков
    gameState = createDefaultGameState();
    gameState.prestigeLevel = newPrestigeLevel;
    gameState.prestigePoints = oldState.prestigePoints + pendingPoints;
    gameState.prestigeClickLevel = oldState.prestigeClickLevel;
    gameState.prestigeAutoLevel = oldState.prestigeAutoLevel;
    gameState.prestigeBonusLevel = oldState.prestigeBonusLevel;
    gameState.relics = oldState.relics || [];           // Сохраняем реликвии
    gameState.skills = oldState.skills || {};           // Сохраняем навыки
    gameState.maxUnlockedStageIndex = Math.min(
        evolutionStages.length - 1, 
        oldState.maxUnlockedStageIndex + 1
    );
    // ... сохранить настройки
    
    showToast(
        getLangText("toast_prestige_done", { 
            level: newPrestigeLevel,
            points: pendingPoints 
        }), 
        "success"
    );
    saveProgress();
    submitScoreToLeaderboard();
}
```

---

### 3.2 Система реликвий

#### 💎 [RL-001] Структура данных реликвий
**Файл:** `script.js`
**Новый конфиг:**
```javascript
const RELICS_CONFIG = [
    {
        id: "ancient_atom",
        name: { ru: "Древний Атом", en: "Ancient Atom" },
        description: { 
            ru: "+10% ко всем видам дохода", 
            en: "+10% to all income types" 
        },
        cost: 5,
        effect: { type: "global_multiplier", value: 0.10 },
        icon: "⚛️"
    },
    {
        id: "quantum_crystal",
        name: { ru: "Квантовый Кристалл", en: "Quantum Crystal" },
        description: { 
            ru: "+25% к силе клика", 
            en: "+25% to click power" 
        },
        cost: 10,
        effect: { type: "click_multiplier", value: 0.25 },
        icon: "💎"
    },
    {
        id: "time_artifact",
        name: { ru: "Артефакт Времени", en: "Time Artifact" },
        description: { 
            ru: "+50% к авто-доходу", 
            en: "+50% to auto income" 
        },
        cost: 15,
        effect: { type: "auto_multiplier", value: 0.50 },
        icon: "⏳"
    },
    {
        id: "multiverse_key",
        name: { ru: "Ключ Мультивселенной", en: "Multiverse Key" },
        description: { 
            ru: "Открывает доступ к скрытым этапам", 
            en: "Unlocks hidden stages" 
        },
        cost: 25,
        effect: { type: "unlock_stages", value: 2 },
        icon: "🔑"
    },
    {
        id: "infinity_core",
        name: { ru: "Ядро Бесконечности", en: "Infinity Core" },
        description: { 
            ru: "x2 ко всем бонусам престижа", 
            en: "x2 to all prestige bonuses" 
        },
        cost: 50,
        effect: { type: "prestige_multiplier", value: 2.0 },
        icon: "∞"
    }
];
```

---

#### 💎 [RL-002] UI панели реликвий
**Файл:** `index.html`
**Добавить модальное окно:**
```html
<!-- Relics Modal -->
<div id="relics-modal" class="modal-overlay">
    <div class="modal-content relics-modal-content">
        <h3 class="text-2xl font-bold mb-4 text-yellow-300" data-translate="menu_relics">
            Реликвии
        </h3>
        
        <div class="mb-4">
            <p class="text-sm text-gray-400">
                <span data-translate="prestige_points_label">Очки престижа</span>: 
                <span id="relics-prestige-points">0</span>
            </p>
        </div>
        
        <div id="relics-grid" class="grid grid-cols-2 gap-4 mb-4">
            <!-- Реликвии будут добавлены через JS -->
        </div>
        
        <div id="owned-relics-list" class="mb-4">
            <h4 class="text-lg font-bold mb-2">Ваши реликвии:</h4>
            <ul id="owned-relics-ul" class="text-sm"></ul>
        </div>
        
        <button
            id="close-relics-button"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
            data-translate="close_button">
            Закрыть
        </button>
    </div>
</div>
```

---

#### 💎 [RL-003] Логика покупки реликвий
**Файл:** `script.js`
**Новые функции:**
```javascript
function buyRelic(relicId) {
    const relic = RELICS_CONFIG.find(r => r.id === relicId);
    if (!relic) return;
    
    if (gameState.prestigePoints >= relic.cost) {
        if (!gameState.relics) gameState.relics = [];
        
        // Проверка на дубликат (если реликвия уникальна)
        if (relic.unique && gameState.relics.includes(relicId)) {
            showToast("Эта реликвия уже куплена!", "error");
            return;
        }
        
        gameState.prestigePoints -= relic.cost;
        gameState.relics.push(relicId);
        
        applyRelicEffect(relic);
        showToast(`Реликвия "${relic.name[gameState.language]}" приобретена!`, "success");
        saveProgress();
        updateAllUI();
    } else {
        showToast(getLangText("toast_not_enough_pp"), "error");
    }
}

function applyRelicEffect(relic) {
    switch(relic.effect.type) {
        case "global_multiplier":
            gameState.globalMultiplier = (gameState.globalMultiplier || 1) + relic.effect.value;
            break;
        case "click_multiplier":
            gameState.clickMultiplier = (gameState.clickMultiplier || 1) + relic.effect.value;
            break;
        case "auto_multiplier":
            gameState.autoMultiplier = (gameState.autoMultiplier || 1) + relic.effect.value;
            break;
        case "unlock_stages":
            gameState.maxUnlockedStageIndex = Math.min(
                evolutionStages.length - 1,
                gameState.maxUnlockedStageIndex + relic.effect.value
            );
            break;
        case "prestige_multiplier":
            gameState.prestigeMultiplier = (gameState.prestigeMultiplier || 1) * relic.effect.value;
            break;
    }
}

function calculateRelicBonuses() {
    // Пересчет всех бонусов от реликвий
    gameState.globalMultiplier = 1;
    gameState.clickMultiplier = 1;
    gameState.autoMultiplier = 1;
    gameState.prestigeMultiplier = 1;
    
    if (gameState.relics) {
        gameState.relics.forEach(relicId => {
            const relic = RELICS_CONFIG.find(r => r.id === relicId);
            if (relic) applyRelicEffect(relic);
        });
    }
}
```

---

#### 💎 [RL-004] Обновление UI реликвий
**Файл:** `script.js`
**Новые функции:**
```javascript
function renderRelicsPanel() {
    const grid = elements["relics-grid"];
    if (!grid) return;
    
    grid.innerHTML = "";
    
    RELICS_CONFIG.forEach(relic => {
        const isOwned = gameState.relics && gameState.relics.includes(relic.id);
        const canAfford = gameState.prestigePoints >= relic.cost;
        
        const relicCard = document.createElement("div");
        relicCard.className = `relic-card ${isOwned ? 'owned' : ''} ${canAfford && !isOwned ? 'affordable' : ''}`;
        relicCard.innerHTML = `
            <div class="text-4xl mb-2">${relic.icon}</div>
            <h4 class="font-bold">${relic.name[gameState.language]}</h4>
            <p class="text-xs text-gray-400 mb-2">${relic.description[gameState.language]}</p>
            <p class="text-sm font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}">
                ${relic.cost} ОП
            </p>
            ${isOwned 
                ? '<span class="text-xs text-blue-400">Куплено</span>' 
                : `<button onclick="buyRelic('${relic.id}')" 
                         ${!canAfford ? 'disabled' : ''}
                         class="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                     Купить
                   </button>`
            }
        `;
        
        grid.appendChild(relicCard);
    });
    
    updateOwnedRelicsList();
}

function updateOwnedRelicsList() {
    const ul = elements["owned-relics-ul"];
    if (!ul) return;
    
    ul.innerHTML = "";
    
    if (!gameState.relics || gameState.relics.length === 0) {
        ul.innerHTML = "<li class='text-gray-500'>Нет приобретенных реликвий</li>";
        return;
    }
    
    gameState.relics.forEach(relicId => {
        const relic = RELICS_CONFIG.find(r => r.id === relicId);
        if (relic) {
            const li = document.createElement("li");
            li.textContent = `${relic.icon} ${relic.name[gameState.language]}`;
            ul.appendChild(li);
        }
    });
}
```

---

### 3.3 Древо навыков

#### 🌳 [SK-001] Структура данных навыков
**Файл:** `script.js`
**Новый конфиг:**
```javascript
const SKILLS_TREE_CONFIG = {
    nodes: [
        {
            id: "click_mastery_1",
            name: { ru: "Мастерство клика I", en: "Click Mastery I" },
            description: { ru: "+5% к клику", en: "+5% to click" },
            cost: 3,
            requirements: [],  // Нет требований
            effect: { type: "click_bonus", value: 0.05 },
            position: { x: 0, y: 0 },
            icon: "👆"
        },
        {
            id: "click_mastery_2",
            name: { ru: "Мастерство клика II", en: "Click Mastery II" },
            description: { ru: "+10% к клику", en: "+10% to click" },
            cost: 5,
            requirements: ["click_mastery_1"],
            effect: { type: "click_bonus", value: 0.10 },
            position: { x: 0, y: 1 },
            icon: "✌️"
        },
        {
            id: "synthesis_expert_1",
            name: { ru: "Эксперт синтеза I", en: "Synthesis Expert I" },
            description: { ru: "+10% к авто-доходу", en: "+10% to auto income" },
            cost: 3,
            requirements: [],
            effect: { type: "auto_bonus", value: 0.10 },
            position: { x: -1, y: 0 },
            icon: "⚗️"
        },
        {
            id: "crit_master",
            name: { ru: "Мастер критов", en: "Crit Master" },
            description: { ru: "+5% шанс крита", en: "+5% crit chance" },
            cost: 7,
            requirements: ["click_mastery_2"],
            effect: { type: "crit_chance", value: 0.05 },
            position: { x: 0, y: 2 },
            icon: "🎯"
        },
        {
            id: "prestige_wisdom",
            name: { ru: "Мудрость престижа", en: "Prestige Wisdom" },
            description: { ru: "+20% к очкам престижа", en: "+20% to prestige points" },
            cost: 10,
            requirements: ["synthesis_expert_1", "click_mastery_2"],
            effect: { type: "prestige_points_bonus", value: 0.20 },
            position: { x: -1, y: 1 },
            icon: "🧙"
        }
    ]
};
```

---

#### 🌳 [SK-002] UI древа навыков
**Файл:** `index.html`
**Добавить модальное окно:**
```html
<!-- Skills Tree Modal -->
<div id="skills-tree-modal" class="modal-overlay">
    <div class="modal-content skills-tree-modal-content">
        <h3 class="text-2xl font-bold mb-4 text-yellow-300" data-translate="menu_skills_tree">
            Древо навыков
        </h3>
        
        <div class="mb-4 flex justify-between items-center">
            <p class="text-sm text-gray-400">
                <span data-translate="prestige_points_label">Очки престижа</span>: 
                <span id="skills-prestige-points">0</span>
            </p>
            <button id="reset-skills-button" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                Сбросить все (-50% стоимости возврата)
            </button>
        </div>
        
        <div id="skills-tree-container" class="relative w-full h-96 overflow-auto">
            <!-- Навыки будут отрисованы через JS -->
        </div>
        
        <button
            id="close-skills-tree-button"
            class="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
            data-translate="close_button">
            Закрыть
        </button>
    </div>
</div>
```

---

#### 🌳 [SK-003] Логика покупки навыков
**Файл:** `script.js`
**Новые функции:**
```javascript
function buySkill(skillId) {
    const skill = SKILLS_TREE_CONFIG.nodes.find(s => s.id === skillId);
    if (!skill) return;
    
    // Проверка требований
    if (skill.requirements && skill.requirements.length > 0) {
        const hasRequirements = skill.requirements.every(reqId => 
            gameState.skills && gameState.skills[reqId]
        );
        if (!hasRequirements) {
            showToast("Сначала изучите требуемые навыки!", "error");
            return;
        }
    }
    
    // Проверка уже купленного
    if (gameState.skills && gameState.skills[skillId]) {
        showToast("Навык уже изучен!", "error");
        return;
    }
    
    // Проверка стоимости
    if (gameState.prestigePoints >= skill.cost) {
        if (!gameState.skills) gameState.skills = {};
        
        gameState.prestigePoints -= skill.cost;
        gameState.skills[skillId] = {
            purchasedAt: Date.now(),
            level: 1
        };
        
        applySkillEffect(skill);
        showToast(`Навык "${skill.name[gameState.language]}" изучен!`, "success");
        saveProgress();
        renderSkillsTree();
        updateAllUI();
    } else {
        showToast(getLangText("toast_not_enough_pp"), "error");
    }
}

function resetAllSkills() {
    if (!gameState.skills || Object.keys(gameState.skills).length === 0) {
        showToast("Нет навыков для сброса", "info");
        return;
    }
    
    const confirmReset = confirm("Вы уверены? Вернется 50% от стоимости навыков.");
    if (!confirmReset) return;
    
    // Возврат 50% стоимости
    let refund = 0;
    Object.keys(gameState.skills).forEach(skillId => {
        const skill = SKILLS_TREE_CONFIG.nodes.find(s => s.id === skillId);
        if (skill) refund += Math.floor(skill.cost * 0.5);
    });
    
    gameState.prestigePoints += refund;
    gameState.skills = {};
    
    // Пересчет бонусов
    recalculateAllSkillBonuses();
    
    showToast(`Навыки сброшены! Возвращено ${refund} ОП`, "success");
    saveProgress();
    renderSkillsTree();
    updateAllUI();
}

function applySkillEffect(skill) {
    switch(skill.effect.type) {
        case "click_bonus":
            gameState.skillClickBonus = (gameState.skillClickBonus || 0) + skill.effect.value;
            break;
        case "auto_bonus":
            gameState.skillAutoBonus = (gameState.skillAutoBonus || 0) + skill.effect.value;
            break;
        case "crit_chance":
            gameState.skillCritChance = (gameState.skillCritChance || 0) + skill.effect.value;
            break;
        case "prestige_points_bonus":
            gameState.skillPrestigeBonus = (gameState.skillPrestigeBonus || 0) + skill.effect.value;
            break;
    }
}

function recalculateAllSkillBonuses() {
    gameState.skillClickBonus = 0;
    gameState.skillAutoBonus = 0;
    gameState.skillCritChance = 0;
    gameState.skillPrestigeBonus = 0;
    
    if (gameState.skills) {
        Object.keys(gameState.skills).forEach(skillId => {
            const skill = SKILLS_TREE_CONFIG.nodes.find(s => s.id === skillId);
            if (skill) applySkillEffect(skill);
        });
    }
}
```

---

#### 🌳 [SK-004] Отрисовка древа навыков
**Файл:** `script.js`
**Новая функция:**
```javascript
function renderSkillsTree() {
    const container = elements["skills-tree-container"];
    if (!container) return;
    
    container.innerHTML = "";
    
    // Создаем SVG для линий связей
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "absolute w-full h-full pointer-events-none");
    svg.setAttribute("id", "skills-connections");
    container.appendChild(svg);
    
    SKILLS_TREE_CONFIG.nodes.forEach(skill => {
        const isOwned = gameState.skills && gameState.skills[skill.id];
        const hasRequirements = !skill.requirements || 
            skill.requirements.every(reqId => gameState.skills && gameState.skills[reqId]);
        const canAfford = gameState.prestigePoints >= skill.cost;
        
        const skillNode = document.createElement("div");
        skillNode.className = `skill-node ${isOwned ? 'owned' : ''} ${!hasRequirements ? 'locked' : ''}`;
        skillNode.style.left = `calc(50% + ${skill.position.x * 120}px)`;
        skillNode.style.top = `${skill.position.y * 100 + 20}px`;
        
        skillNode.innerHTML = `
            <div class="skill-icon text-3xl">${skill.icon}</div>
            <div class="skill-name text-xs font-bold mt-1">${skill.name[gameState.language]}</div>
            ${isOwned 
                ? '<div class="text-xs text-green-400">✓</div>'
                : `<div class="text-xs ${canAfford && hasRequirements ? 'text-green-400' : 'text-red-400'}">
                       ${skill.cost} ОП
                   </div>`
            }
        `;
        
        if (!isOwned && hasRequirements && canAfford) {
            skillNode.onclick = () => buySkill(skill.id);
            skillNode.classList.add('cursor-pointer', 'hover:scale-110');
        }
        
        container.appendChild(skillNode);
        
        // Рисуем линии к требованиям
        if (skill.requirements && skill.requirements.length > 0) {
            skill.requirements.forEach(reqId => {
                const reqSkill = SKILLS_TREE_CONFIG.nodes.find(s => s.id === reqId);
                if (reqSkill) {
                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute("x1", `calc(50% + ${reqSkill.position.x * 120}px + 24px)`);
                    line.setAttribute("y1", `${reqSkill.position.y * 100 + 20 + 24}px`);
                    line.setAttribute("x2", `calc(50% + ${skill.position.x * 120}px + 24px)`);
                    line.setAttribute("y2", `${skill.position.y * 100 + 20 + 24}px`);
                    line.setAttribute("stroke", isOwned ? "#34d399" : "#4b5563");
                    line.setAttribute("stroke-width", "2");
                    svg.appendChild(line);
                }
            });
        }
    });
}
```

---

### 3.4 Интеграция бонусов в основную логику

#### 🔗 [INT-001] Обновление формулы силы клика
**Файл:** `script.js`
**Изменения в `performClick()`:**
```javascript
let clickPower = gameState.clickPower;

// Применяем множители
clickPower *= (1 + (gameState.prestigeClickLevel * 0.1));  // Старый бонус
clickPower *= (1 + (gameState.skillClickBonus || 0));      // Новый навык
clickPower *= (gameState.clickMultiplier || 1);            // Реликвия
clickPower *= (gameState.globalMultiplier || 1);           // Глобальный множитель
```

---

#### 🔗 [INT-002] Обновление формулы авто-дохода
**Файл:** `script.js`
**Изменения в `gameTick()`:**
```javascript
let energyPerSec = gameState.autoPower;

energyPerSec *= (1 + (gameState.prestigeAutoLevel * 0.1));  // Старый бонус
energyPerSec *= (1 + (gameState.skillAutoBonus || 0));      // Новый навык
energyPerSec *= (gameState.autoMultiplier || 1);            // Реликвия
energyPerSec *= (gameState.globalMultiplier || 1);          // Глобальный множитель
```

---

#### 🔗 [INT-003] Обновление расчета очков престижа
**Файл:** `script.js`
**Изменения в `calculatePendingPrestigePoints()`:**
```javascript
function calculatePendingPrestigePoints() {
    const basePoints = gameState.currentStageIndex + 1;
    const energyBonus = Math.floor(Math.log10(Math.max(1, gameState.totalEnergyEarned)) / 3);
    const prestigeMultiplier = 1 + (gameState.prestigeLevel * 0.1);
    
    // Бонус от навыка
    const skillBonus = 1 + (gameState.skillPrestigeBonus || 0);
    
    // Множитель от реликвии
    const relicMultiplier = gameState.prestigeMultiplier || 1;
    
    const pendingPoints = Math.floor((basePoints + energyBonus) * prestigeMultiplier * skillBonus * relicMultiplier);
    
    return Math.max(1, pendingPoints);
}
```

---

## ЧАСТЬ 4: ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ

### Этап 1: Подготовка и анализ (День 1)
- [ ] ✅ Анализ текущего кода
- [ ] ✅ Создание этого плана
- [ ] [ ] Резервное копирование проекта
- [ ] [ ] Настройка системы контроля версий (Git)

### Этап 2: Интеграция GamePush (Дни 2-3)
- [ ] [ ] GP-001: Регистрация в GamePush
- [ ] [ ] GP-002: Подключение SDK
- [ ] [ ] GP-003: Инициализация
- [ ] [ ] GP-004: Сохранение в облако
- [ ] [ ] GP-005: Загрузка из облака
- [ ] [ ] GP-006: Таблица лидеров
- [ ] [ ] GP-008: Аналитика событий
- [ ] [ ] Тестирование интеграции

### Этап 3: Доработка престижа (Дни 4-5)
- [ ] [ ] PR-001: Формула расчета очков
- [ ] [ ] PR-002: UI накопленных очков
- [ ] [ ] PR-003: Обновленная логика престижа
- [ ] [ ] Добавление totalEnergyEarned tracking
- [ ] [ ] Тестирование механики престижа

### Этап 4: Система реликвий (Дни 6-8)
- [ ] [ ] RL-001: Конфигурация реликвий
- [ ] [ ] RL-002: UI модального окна
- [ ] [ ] RL-003: Логика покупки
- [ ] [ ] RL-004: Отрисовка и обновление UI
- [ ] [ ] Балансировка стоимости
- [ ] [ ] Тестирование

### Этап 5: Древо навыков (Дни 9-12)
- [ ] [ ] SK-001: Конфигурация навыков
- [ ] [ ] SK-002: UI модального окна
- [ ] [ ] SK-003: Логика покупки и сброса
- [ ] [ ] SK-004: Визуализация древа
- [ ] [ ] Интеграция бонусов в основную логику
- [ ] [ ] Тестирование

### Этап 6: Исправление ошибок (День 13)
- [ ] [ ] CRITICAL-001: Исправлено (часть PR-001)
- [ ] [ ] CRITICAL-002: Исправлено (Этап 4)
- [ ] [ ] CRITICAL-003: Исправлено (Этап 5)
- [ ] [ ] MEDIUM-001: Оптимизация floatingTexts
- [ ] [ ] MEDIUM-002: Рефакторинг конфигов этапов
- [ ] [ ] MEDIUM-003: Валидация данных

### Этап 7: Оптимизация (День 14)
- [ ] [ ] OPT-001: Разделение updateAllUI()
- [ ] [ ] OPT-002: Throttling сохранений
- [ ] [ ] OPT-003: Инкапсуляция кода
- [ ] [ ] Профилирование производительности

### Этап 8: Финальное тестирование (День 15)
- [ ] [ ] Полное прохождение игрового цикла
- [ ] [ ] Тестирование на мобильных устройствах
- [ ] [ ] Проверка всех языковых версий
- [ ] [ ] Тестирование оффлайн-прогресса
- [ ] [ ] Проверка работы с GamePush
- [ ] [ ] Исправление найденных багов

### Этап 9: Документация и релиз (День 16)
- [ ] [ ] Обновление README.md
- [ ] [ ] Документирование новых функций
- [ ] [ ] Подготовка changelog
- [ ] [ ] Релиз версии 4.0

---

## ЧАСТЬ 5: ПРИЛОЖЕНИЯ

### A. Словарь терминов
- **ОП** - Очки Престижа
- **PP** - Prestige Points (англ.)
- **SDK** - Software Development Kit
- **UI** - User Interface
- **IIFE** - Immediately Invoked Function Expression

### B. Полезные ссылки
- GamePush Documentation: https://gamepush.com/docs/
- Yandex Games SDK: https://yandex.ru/games/sdk/v2/docs
- Tailwind CSS: https://tailwindcss.com/docs

### C. Контакты для вопросов
- GamePush Support: support@gamepush.com
- Yandex Games Support: https://yandex.ru/games/support

---

## СТАТУС ВЫПОЛНЕНИЯ

| Этап | Задач выполнено | Всего задач | Процент |
|------|-----------------|-------------|---------|
| 1. Подготовка | 2 | 4 | 50% |
| 2. GamePush | 0 | 8 | 0% |
| 3. Престиж | 0 | 5 | 0% |
| 4. Реликвии | 0 | 6 | 0% |
| 5. Навыки | 0 | 6 | 0% |
| 6. Ошибки | 0 | 6 | 0% |
| 7. Оптимизация | 0 | 4 | 0% |
| 8. Тестирование | 0 | 6 | 0% |
| 9. Релиз | 0 | 4 | 0% |
| **ИТОГО** | **2** | **45** | **4%** |

---

*Документ создан для координации разработки Evolution Clicker v4.0*
