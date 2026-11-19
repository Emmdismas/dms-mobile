# DMS Mobile App (React Native & Expo)

Programu tumizi ya simu (Mobile Application) ya **Dealer Management System (DMS)** iliyojengwa kwa **React Native + Expo + TypeScript**, kwa ajili ya maduka na stoo za pikipiki za TVS na wauzaji wengine.

Programu hii inawasiliana moja kwa moja na seva ya Laravel kupitia REST API (`/api/v1`).

---

## Muundo wa Mradi (Architecture)

```text
DMS-mobile/
├── src/
│   ├── api/
│   │   ├── client.ts         # Axios/fetch wrapper yenye token storage na error handling
│   │   ├── auth.ts           # Login, me, logout
│   │   └── operations.ts     # Inventory receive, sales, transfers, expenses
│   ├── context/
│   │   ├── AuthContext.tsx   # Session management, user state, active branch selector
│   │   └── AppContext.tsx    # Live workspace datasets, instant sync, theme & i18n
│   ├── theme/
│   │   └── index.ts          # Brand colors (#006948, #273D80), typography, touch targets
│   ├── i18n/
│   │   └── translations.ts   # Lugha: Kiswahili (chaguo-msingi) na Kiingereza
│   ├── components/
│   │   ├── Header.tsx        # Top banner yenye branch switcher na language pill
│   │   ├── StatCard.tsx      # Kadi za takwimu (Stricly 2 kwa mstari kwenye simu)
│   │   ├── UnitCard.tsx      # Kadi ya pikipiki (Chassis, Engine, Status, Sell button)
│   │   ├── SaleCard.tsx      # Kadi ya mauzo (Risiti, Mteja, Kiasi, Njia ya malipo)
│   │   ├── StatusBadge.tsx   # Lebo za rangi kulingana na hali (IN STOCK, SOLD, n.k.)
│   │   └── BranchSelectorModal.tsx # Dirisha la kubadili tawi
│   ├── screens/
│   │   ├── LoginScreen.tsx       # Ukurasa wa kuingilia (Credentials + API Host config)
│   │   ├── DashboardScreen.tsx   # Dashibodi yenye viashiria vikuu na vitendo vya haraka
│   │   ├── InventoryScreen.tsx   # Orodha ya stoo, utafutaji wa chassis, filter chips
│   │   ├── ReceiveStockScreen.tsx # Fomu ya kupokea mzigo mpya (Chassis, Engine, Bei)
│   │   ├── RecordSaleScreen.tsx   # Fomu ya kurekodi mauzo na taarifa za mteja
│   │   ├── TransfersScreen.tsx   # Uhamisho wa pikipiki kati ya matawi
│   │   └── SettingsScreen.tsx    # Mipangilio ya giza, lugha, API URL, na kutoka
│   └── navigation/
│       └── RootNavigator.tsx # Bottom Tabs + Modals Stack
├── App.tsx                   # Safe area, Context providers, Theme wrapper
└── package.json
```

---

## Jinsi ya Kuendesha (Running Locally)

### 1. Washa Seva ya Backend (Laravel API):
Ndani ya folda la `DMS-web`:
```bash
php artisan serve --port=8001
```

### 2. Washa Mobile App (Expo):
Ndani ya folda hili la `DMS-mobile`:
```bash
npm start
```
- Bonyeza `a` kufungua kwenye **Android Emulator** au simu iliyounganishwa kwa USB.
- Bonyeza `w` kufungua kwenye **Web Browser**.
- Scan QR code kwa kutumia app ya **Expo Go** kwenye simu yako halisi (Android/iPhone).

---

## Akaunti za Majaribio (Seeded Logins)
- **Mmiliki wa Duka (Dealer Owner):** `owner@nassor.co.tz` / `Nassor@2026`
- **Msimamizi Mkuu (Super Admin):** `superadmin@dms.co.tz` / `ChangeMe@2026`

---

## Kuunganisha Simu Halisi (Physical Device via Wi-Fi)
Ukifungua app kwenye simu yako halisi kupitia Wi-Fi:
1. Kwenye skrini ya Kuingia (Login Screen), bonyeza kitufe cha **"API Host"**.
2. Weka anwani ya IP ya kompyuta yako (mfano: `http://192.168.1.100:8001/api/v1`).
3. Bonyeza **Hifadhi**. App itaungana moja kwa moja na kompyuta yako bila waya!
