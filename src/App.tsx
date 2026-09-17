/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Save, AlertCircle, RefreshCw, Layers, Sparkles, CheckCircle, Database, HelpCircle, Copy
} from 'lucide-react';
import OffersSidebar from './components/OffersSidebar';
import FormPanel from './components/FormPanel';
import PreviewPanel from './components/PreviewPanel';
import ConstantDataEditor from './components/ConstantDataEditor';
import PrintPage from './components/PrintPage';
import { DaneOferty, OfferType, normalizeOffer } from './types';

// Helper function to extract numerical journal number from offer number (e.g., L. Dz. 154/06/26 -> 154)
export function extractOfferNumber(numStr?: string): number {
  if (!numStr) return 0;
  const match = numStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Helper function to sort offers newest first (by highest journal number)
export function sortOffersNewestFirst(offersList: DaneOferty[]): DaneOferty[] {
  return [...offersList].sort((a, b) => {
    const numA = extractOfferNumber(a.numer_oferty);
    const numB = extractOfferNumber(b.numer_oferty);
    if (numA !== numB) {
      return numB - numA; // Higher journal number comes first (newest)
    }
    return 0;
  });
}

// Helper function to find the highest offer number string across all offers
export function getHighestOfferNumber(offersList: DaneOferty[]): string | undefined {
  if (!offersList || offersList.length === 0) return undefined;
  let maxNum = -1;
  let maxStr: string | undefined = undefined;

  for (const o of offersList) {
    if (!o.numer_oferty) continue;
    const val = extractOfferNumber(o.numer_oferty);
    if (val > maxNum) {
      maxNum = val;
      maxStr = o.numer_oferty;
    }
  }
  return maxStr || offersList[0]?.numer_oferty;
}

// Helper function to auto-increment journal number (L. Dz.) from last offer
export function generateNextOfferNumber(lastOfferNumber?: string): string {
  const now = new Date();
  const yearShort = now.getFullYear() % 100;
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const fallback = `L. Dz. 154/${monthStr}/${yearShort}`;

  if (!lastOfferNumber || !lastOfferNumber.trim()) {
    return fallback;
  }

  const match = lastOfferNumber.trim().match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) {
    return fallback;
  }

  const [, prefix, numStr, suffix] = match;
  const numVal = parseInt(numStr, 10);
  if (isNaN(numVal)) {
    return fallback;
  }

  const nextNumVal = numVal + 1;
  const paddedNextNum = numStr.startsWith('0') && numStr.length > 1
    ? String(nextNumVal).padStart(numStr.length, '0')
    : String(nextNumVal);

  return `${prefix}${paddedNextNum}${suffix}`;
}

// Helper function to generate default state templates
function createDefaultOffer(type: OfferType, lastOfferNumber?: string): DaneOferty {
  const nextNumerOferty = generateNextOfferNumber(lastOfferNumber);

  const savedDefault = localStorage.getItem('enco_default_offer_template');
  if (savedDefault) {
    try {
      const parsed = JSON.parse(savedDefault);
      const idStr = 'enco-' + Math.random().toString(36).substring(2, 9);
      const now = new Date();
      const dateStr = now.toLocaleDateString('pl-PL');

      // Regenerate IDs for stations in the template
      const stacje = parsed.stacje && parsed.stacje.length > 0
        ? parsed.stacje.map((st: any) => ({
            ...st,
            id: 'stacja-' + Math.random().toString(36).substring(2, 9)
          }))
        : [];

      return {
        ...parsed,
        id: idStr,
        offer_type: type,
        data_oferty: dateStr,
        numer_oferty: nextNumerOferty,
        stacje: stacje
      };
    } catch (e) {
      console.error("Error using saved default template, falling back to built-in template", e);
    }
  }

  const idStr = 'enco-' + Math.random().toString(36).substring(2, 9);
  const now = new Date();
  const dateStr = now.toLocaleDateString('pl-PL');

  const standardBase = {
    id: idStr,
    offer_type: type,
    data_oferty: dateStr,
    tytul_oferty: 'OFERTA DO ZAKUPU',
    klient_nazwa: 'NOWY KLIENT SP. Z O.O.',
    klient_adres: 'ul. Energetyków 12',
    klient_miejscowosc_kod: '00-001 Warszawa',
    klient_osoba_kontaktowa: 'Jan Kowalski',
    klient_telefon: '500 600 700',
    klient_email: 'kontakt@nowyklient.pl',
    termin_dostawy: '12 tygodni od zamówienia i zatwierdzenia rysunków',
    warunki_dostawy: 'na miejsce wskazane przez Zamawiającego (DAP)',
    warunki_gwarancji: '36 miesięcy',
    warunki_platnosci: 'przelew 30 dni',
    waznosc_oferty: '30 dni',
    osoba_zatwierdzajaca: 'Barbara Baprawska',
    osoba_zatwierdzajaca_telefon: '(22) 543 72 31',
    osoba_zatwierdzajaca_email: 'bbaprawska@grupaenco.pl'
  };

  if (type === 'stacja_nz') {
    return {
      ...standardBase,
      numer_oferty: nextNumerOferty,
      post_temat: 'POST NZ-Stacja Transformatorowa Zewnętrzna',
      budynek: {
        typ_budynku: 'NZ',
        wymiary_dlugosc: '2.1',
        wymiary_szerokosc: '2.9',
        wymiary_wysokosc: '2.66',
        wymiary_wysokosc_typ: 'zewnetrzna',
        przepusty_nn: '12',
        przepusty_sn: '2',
        przepusty_uziemienie: '3',
        powloka_antygraffiti: true,
        kolor_obudowa: 'RAL 1013',
        kolor_slusarka: 'RAL 8014',
        kolor_dach: 'RAL 8014',
        kolor_drzwi_kraty: 'RAL 8014',
        drzwi_typ_ilosc: '1 x drzwi jednoskrzydłowe pełne EI 120 do komory transformatora\n1 x drzwi jednoskrzydłowe pełne do tablicy pomiarowej\n1 x drzwi dwuskrzydłowe z kratą wentylacyjną do pomieszczenia rozdzielnicy SN i nN\n1 x otwór fi 100 zaślepiony demontowalną przegrodą (kable agregatu)',
        drzwi_rozmiary: 'standardowe',
        drzwi_ei: 'EI 120 / standard',
        kraty_typ_ilosc: '1 szt. wkomponowana w skrzydło',
        wentylatory_nawiew: '0',
        wentylatory_wywiew: '0',
        konstrukcja_budynku: 'żelbetowa z betonu C35/45',
        sciany_rei120_ilosc: '0',
        dach_rei120: false,
        typ_dachu: 'kopertowy'
      },
      rozdzielnica_sn: {
        typ: 'AirSet',
        ilosc_pol: '4-polowa',
        pol_liniowe: 'Pole liniowe - 2 szt. rozłącznik z uziemnikiem, napęd silnikowy 24V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania',
        pol_transformatorowe: 'Pole transformatorowe - 1 szt. rozłącznik z uziemnikiem i bezpiecznikami, napęd silnikowy 24V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania',
        pol_niestandardowe: 'Czujnik ciśnienia powietrza (izolacja powietrzna, bez gazu SF6)\nUzgadniacz faz',
        parametry: '24 kV, 630 A, 20 kA/1s',
        izolacja: 'powietrzna',
        pola: [
          {
            id: 'sn-pole-1',
            nazwa: 'Pole liniowe',
            ilosc: '3',
            wyposazenie: 'rozłącznik z uziemnikiem, napęd silnikowy 24 V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania, wskaźniki przepływu prądu zwarciowego CPZ-4s'
          },
          {
            id: 'sn-pole-2',
            nazwa: 'Pole transformatorowe',
            ilosc: '1',
            wyposazenie: 'rozłącznik z uziemnikiem i bezpiecznikami, napęd ręczny, wskaźnik obecności napięcia, styki pomocnicze'
          }
        ],
        dodatkowe_wyposazenie: [
          'czujnik ciśnienia gazu ze stykiem',
          'uzgadniacz faz'
        ],
        typ_custom_opis: ''
      },
      rozdzielnica_nn: {
        ilosc_pol: '12',
        rozlacznik_zasilajacy: '1250A',
        rozlacznik_niestandardowy_opis: 'SIRCO 1250A',
        przydzial_630a: '9 x ARS3 Smart pro 630A z sygnalizacją przepalenia wkładki bezpiecznikowej',
        przydzial_400a: '2 x SL3-3-3: 400A',
        technologia_smart: true,
        custom_punkty: [],
        pola: [
          {
            id: 'nn-pole-1',
            nazwa: 'Pole zasilające',
            parametry: 'Rozłącznik: SIRCO 1250A',
            ilosc: '1'
          },
          {
            id: 'nn-pole-2',
            nazwa: 'Pola odpływowe (bez wkładek bezpiecznikowych)',
            parametry: 'NSL2 400A',
            ilosc: '10'
          },
          {
            id: 'nn-pole-3',
            nazwa: 'Pola odpływowe (bez wkładek bezpiecznikowych)',
            parametry: 'NSL3 630A',
            ilosc: '10'
          },
          {
            id: 'nn-pole-4',
            nazwa: 'Przekładniki prądowe',
            parametry: 'wzorcowane do układu pomiarowego',
            ilosc: '1 kpl.'
          },
          {
            id: 'nn-pole-5',
            nazwa: 'Zasilanie potrzeb własnych stacji',
            parametry: 'standardowe (zabezpieczenie nadprądowe)',
            ilosc: '1'
          }
        ]
      },
      telemechanika: {
        wlaczone: true,
        sterownik: 'RTU7M',
        sensory: 'szafa telemechaniki wyposażona w sterownik RTU7M oraz sensory prądowe i napięciowe'
      },
      polaczenia_kablowe: {
        most_sn: 'Most kablowy SN pomiędzy transformatorem a rozdzielnicą SN – kabel 3 x YHAKXS 1 x 70mm² wraz z głowicami',
        most_nn: 'Most kablowy nN pomiędzy transformatorem a rozdzielnicą nN – kabel 4 x 2 x YKXS 1 x 240mm²',
        inne: 'Zasilanie potrzeb własnych stacji\nMaszt + antena zewnętrzna'
      },
      dodatkowe_elementy: {
        selected: [
          'Dostawa stacji na plac budowy',
          'Podkładki antywibracyjne pod transformator (1 kpl.)',
          'Szafa telemechaniki, sensory prądowe i napięciowe',
          'Ugadniacz faz do rozdzielnicy SN',
          'Przepusty systemowe i wkłady uszczelniające'
        ],
        custom: ''
      },
      dostawa_nie_obejmuje: {
        selected: [
          'Dostawy i montażu transformatora',
          'Przygotowania wykopu, rozładunku stacji i posadowienia w wykopie',
          'Wyprowadzenia i podłączenia kabli zewnętrznych SN i nN',
          'Wykonania otoku uziemiającego'
        ],
        custom: ''
      },
      cena: {
        cena_netto: '0',
        cena_brutto: '0',
        waluta: 'PLN'
      }
    };
  } else if (type === 'stacja_bek') {
    return {
      ...standardBase,
      numer_oferty: nextNumerOferty,
      post_temat: 'POST BEK-Stacja Transformatorowa Kontenerowa',
      budynek: {
        typ_budynku: 'BEK',
        wymiary_dlugosc: '2.5',
        wymiary_szerokosc: '3.6',
        wymiary_wysokosc: '2.5',
        przepusty_nn: '16',
        przepusty_sn: '4',
        przepusty_uziemienie: '4',
        powloka_antygraffiti: true,
        kolor_obudowa: 'RAL 7035 (szary)',
        kolor_slusarka: 'RAL 7016 (antracyt)',
        kolor_dach: 'RAL 7016',
        kolor_drzwi_kraty: 'RAL 7016',
        drzwi_typ_ilosc: '2 x drzwi dwuskrzydłowe stalowe EI 60 z kratkami nawiewnymi oraz demontowalny świetlik dachowy',
        drzwi_rozmiary: 'szerokie bramowe',
        drzwi_ei: 'EI 60',
        kraty_typ_ilosc: '2 x zintegrowane',
        wentylatory_nawiew: '1',
        wentylatory_wywiew: '1',
        konstrukcja_budynku: 'żelbetowa z betonu C35/45',
        sciany_rei120_ilosc: '0',
        dach_rei120: false,
        typ_dachu: 'kopertowy'
      },
      rozdzielnica_sn: {
        typ: 'Siemens',
        ilosc_pol: '4-polowa',
        pol_liniowe: 'Pole liniowe Siemens - 3 szt. rozłącznik, napęd silnikowy, wyzwalacze zdalne',
        pol_transformatorowe: 'Pole transformatorowe Siemens - 1 szt. rozłącznik bezpiecznikowy z uziemnikiem szybkim',
        pol_niestandardowe: 'Sygnalizacja przepalenia bezpiecznika oraz zintegrowane czujniki temperatury',
        parametry: 'Siemens 8DJH w układzie IIIQ - 24kV, 630A, 20kA/1s',
        izolacja: 'gazowa SF6',
        pola: [
          {
            id: 'sn-pole-1',
            nazwa: 'Pole liniowe',
            ilosc: '3',
            wyposazenie: 'Siemens - rozłącznik, napęd silnikowy, wyzwalacze zdalne, wskaźnik obecności napięcia'
          },
          {
            id: 'sn-pole-2',
            nazwa: 'Pole transformatorowe',
            ilosc: '1',
            wyposazenie: 'Siemens - rozłącznik bezpiecznikowy z uziemnikiem szybkim, wskaźnik obecności napięcia'
          }
        ],
        dodatkowe_wyposazenie: [
          'czujnik ciśnienia gazu ze stykiem',
          'uzgadniacz faz'
        ]
      },
      rozdzielnica_nn: {
        ilosc_pol: '16',
        rozlacznik_zasilajacy: '1600A',
        rozlacznik_niestandardowy_opis: 'SIRCO 1600A w polu zasilającym',
        przydzial_630a: '12 x ARS3 Smart pro 630A',
        przydzial_400a: '4 x SL3-3-3: 400A',
        technologia_smart: true,
        custom_punkty: [],
        pola: [
          {
            id: 'nn-pole-1',
            nazwa: 'Pole zasilające',
            parametry: 'Rozłącznik: SIRCO 1600A w polu zasilającym',
            ilosc: '1'
          },
          {
            id: 'nn-pole-2',
            nazwa: 'Pola odpływowe',
            parametry: 'ARS3 Smart pro 630A',
            ilosc: '12'
          },
          {
            id: 'nn-pole-3',
            nazwa: 'Pola odpływowe (bezpiecznikowe)',
            parametry: 'SL3-3-3: 400A',
            ilosc: '4'
          }
        ]
      },
      telemechanika: {
        wlaczone: true,
        sterownik: 'RTU7M',
        sensory: 'Pełna telemetria z sensorami prądu fazowego i napięcia szyn'
      },
      polaczenia_kablowe: {
        most_sn: 'Zestaw mostu kablowego SN kabel 3 x YHAKXS 1x120mm²',
        most_nn: 'Podwójny most kablowy nN kabel 8 x 2 x YKXS 1x240mm²',
        inne: 'Układ oświetlenia LED, uziemienia główne i dodatkowe szafy RTU'
      },
      dodatkowe_elementy: {
        selected: [
          'Dostawa stacji na plac budowy',
          'Szafa telemechaniki, sensory prądowe i napięciowe',
          'Edycja kanału i testy telemechaniki'
        ],
        custom: 'Zewnętrzny maszt antenowy składany, maszt uziemiający.'
      },
      dostawa_nie_obejmuje: {
        selected: [
          'Dostawy i montażu transformatora',
          'Przygotowania wykopu, rozładunku stacji i posadowienia w wykopie',
          'Wykonania otoku uziemiającego'
        ],
        custom: ''
      },
      cena: {
        cena_netto: '0',
        cena_brutto: '0',
        waluta: 'PLN'
      }
    };
  } else {
    // Komponenty
    return {
      ...standardBase,
      numer_oferty: nextNumerOferty,
      post_temat: 'POST Dostawa podzespołów rozdzielczych',
      budynek: {
        typ_budynku: 'komponenty',
        wymiary_dlugosc: '0',
        wymiary_szerokosc: '0',
        wymiary_wysokosc: '0',
        przepusty_nn: '0',
        przepusty_sn: '0',
        przepusty_uziemienie: '0',
        powloka_antygraffiti: false,
        kolor_obudowa: 'brak',
        kolor_slusarka: 'brak',
        kolor_dach: 'brak',
        kolor_drzwi_kraty: 'brak',
        drzwi_typ_ilosc: '',
        drzwi_rozmiary: 'brak',
        drzwi_ei: 'brak',
        kraty_typ_ilosc: 'brak',
        wentylatory_nawiew: '0',
        wentylatory_wywiew: '0',
        konstrukcja_budynku: 'brak',
        sciany_rei120_ilosc: '0',
        dach_rei120: false,
        typ_dachu: 'brak'
      },
      rozdzielnica_sn: {
        typ: 'Xiria',
        ilosc_pol: '3-polowa',
        pol_liniowe: 'Eaton Xiria - 2 szt. pola liniowe rozłącznikowe, izolowane próżniowo i stało żywicznie',
        pol_transformatorowe: 'Eaton Xiria - 1 szt. pole transformatorowe z zabezpieczeniem elektronicznym',
        pol_niestandardowe: 'Sygnalizacja zwarć',
        parametry: 'Eaton Xiria blok kompaktowy - 24kV, 630A, 16kA/1s',
        izolacja: 'stała / próżniowa',
        pola: [
          {
            id: 'sn-pole-1',
            nazwa: 'Pole liniowe',
            ilosc: '2',
            wyposazenie: 'Eaton Xiria - pola liniowe rozłącznikowe, izolowane próżniowo i stało żywicznie'
          },
          {
            id: 'sn-pole-2',
            nazwa: 'Pole transformatorowe',
            ilosc: '1',
            wyposazenie: 'Eaton Xiria - pole transformatorowe z zabezpieczeniem elektronicznym'
          }
        ],
        dodatkowe_wyposazenie: []
      },
      rozdzielnica_nn: {
        ilosc_pol: '8',
        rozlacznik_zasilajacy: '1250A',
        rozlacznik_niestandardowy_opis: 'SIRCO 1250A',
        przydzial_630a: '6 x ARS3 Smart pro 630A',
        przydzial_400a: '2 x SL3 400A',
        technologia_smart: false,
        custom_punkty: [],
        pola: [
          {
            id: 'nn-pole-1',
            nazwa: 'Pole zasilające',
            parametry: 'Rozłącznik: SIRCO 1250A',
            ilosc: '1'
          },
          {
            id: 'nn-pole-2',
            nazwa: 'Pola odpływowe',
            parametry: 'ARS3 Smart pro 630A',
            ilosc: '6'
          },
          {
            id: 'nn-pole-3',
            nazwa: 'Pola odpływowe',
            parametry: 'SL3 400A',
            ilosc: '2'
          }
        ]
      },
      telemechanika: {
        wlaczone: false,
        sterownik: '',
        sensory: ''
      },
      polaczenia_kablowe: {
        most_sn: 'brak',
        most_nn: 'brak',
        inne: 'brak'
      },
      dodatkowe_elementy: {
        selected: [],
        custom: 'Dostawa komponentów w fabrycznych opakowaniach zabezpieczających, ubezpieczona na czas przewozu.'
      },
      dostawa_nie_obejmuje: {
        selected: [
          'Dostawy i montażu transformatora',
          'Przygotowania wykopu, rozładunku stacji i posadowienia w wykopie'
        ],
        custom: 'Wyciszenia akustycznego, nadzoru inżynierskiego, prac instalacji polowej, uruchomienia obiektowego.'
      },
      cena: {
        cena_netto: '0',
        cena_brutto: '0',
        waluta: 'PLN'
      }
    };
  }
}

export default function App() {
  // Check special print router view path
  const isPrintView = window.location.pathname === '/print' || window.location.pathname === '/druk';
  if (isPrintView) {
    return <PrintPage />;
  }

  const [offers, setOffers] = useState<DaneOferty[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeOffer, setActiveOffer] = useState<DaneOferty | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [showDatabaseEditor, setShowDatabaseEditor] = useState<boolean>(false);

  // Helper to safely parse JSON from a response, handling non-200 or HTML error responses
  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (!res.ok) {
      let errorMsg = `Błąd serwera (${res.status})`;
      if (contentType.includes('application/json') || text.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errorMsg = parsed.error;
        } catch (_) {}
      } else if (text.includes('<!doctype') || text.includes('<html')) {
        errorMsg = `Serwer zwrócił odpowiedź HTML (${res.status}). Przeładuj stronę lub sprawdź serwer API.`;
      }
      throw new Error(errorMsg);
    }

    if (!contentType.includes('application/json') && !text.trim().startsWith('[') && !text.trim().startsWith('{')) {
      throw new Error("Nieprawidłowy format odpowiedzi z serwera (oczekiwano JSON).");
    }

    try {
      return JSON.parse(text);
    } catch (e: any) {
      throw new Error("Nie udało się odczytać odpowiedzi JSON z serwera.");
    }
  };

  // Load from DB
  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await safeFetchJson('/api/offers');
      const normalizedData = (data || []).map((o: any) => normalizeOffer(o));
      const sorted = sortOffersNewestFirst(normalizedData);
      setOffers(sorted);
      if (sorted && sorted.length > 0) {
        setSelectedId(sorted[0].id);
        setActiveOffer(sorted[0]);
      }
    } catch (err) {
      console.error("Error loading offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Safe manual select
  const handleSelectOffer = (id: string) => {
    const found = offers.find(o => o.id === id);
    if (found) {
      const normalized = normalizeOffer(found);
      // If we have unsaved work, warn briefly or autosave immediately! Let's do a quiet save of the current work first
      if (unsavedChanges && activeOffer) {
        saveOffer(activeOffer);
      }
      setSelectedId(id);
      setActiveOffer(normalized);
      setUnsavedChanges(false);
    }
  };

  // Modify active offer locally
  const handleActiveOfferChange = (updated: DaneOferty) => {
    const normalized = normalizeOffer(updated);
    setActiveOffer(normalized);
    setUnsavedChanges(true);

    // Also sync back to main array local cache and sort newest first
    setOffers(prev => sortOffersNewestFirst(prev.map(o => o.id === normalized.id ? normalized : o)));
  };

  // Save changes to DB
  const saveOffer = async (offerToSave: DaneOferty) => {
    try {
      setSaving(true);
      const normalized = normalizeOffer(offerToSave);
      await safeFetchJson('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      setUnsavedChanges(false);
      // Refresh local items
      try {
        const listData = await safeFetchJson('/api/offers');
        const normalizedData = (listData || []).map((o: any) => normalizeOffer(o));
        setOffers(sortOffersNewestFirst(normalizedData));
      } catch (_) {
        setOffers(prev => sortOffersNewestFirst(prev.map(o => o.id === normalized.id ? normalized : o)));
      }
    } catch (err: any) {
      console.error("Error saving offer:", err);
      alert(`Błąd podczas zapisywania oferty: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  // Create new template
  const handleAddNewOffer = async (type: OfferType) => {
    const highestNumStr = getHighestOfferNumber(offers) || activeOffer?.numer_oferty;
    const newO = normalizeOffer(createDefaultOffer(type, highestNumStr));
    
    // Save to server first
    try {
      setSaving(true);
      await safeFetchJson('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newO)
      });
      try {
        const listData = await safeFetchJson('/api/offers');
        const normalizedData = (listData || []).map((o: any) => normalizeOffer(o));
        const sorted = sortOffersNewestFirst(normalizedData);
        setOffers(sorted);
      } catch (_) {
        setOffers(prev => sortOffersNewestFirst([newO, ...prev]));
      }
      setSelectedId(newO.id);
      setActiveOffer(newO);
      setUnsavedChanges(false);
    } catch (err) {
      console.error("Error adding template:", err);
      setOffers(prev => sortOffersNewestFirst([newO, ...prev]));
      setSelectedId(newO.id);
      setActiveOffer(newO);
    } finally {
      setSaving(false);
    }
  };

  // Clone an offer
  const handleCloneOffer = async (idToClone?: string) => {
    const targetId = idToClone || selectedId;
    const sourceOffer = offers.find(o => o.id === targetId) || activeOffer;
    if (!sourceOffer) return;

    // Deep copy offer
    const cloned: DaneOferty = JSON.parse(JSON.stringify(sourceOffer));

    // Assign new unique ID
    cloned.id = 'enco-' + Math.random().toString(36).substring(2, 9);

    // Auto increment offer number (L. Dz.)
    const highestNumStr = getHighestOfferNumber(offers) || sourceOffer.numer_oferty;
    cloned.numer_oferty = generateNextOfferNumber(highestNumStr);

    // Set today's date
    cloned.data_oferty = new Date().toLocaleDateString('pl-PL');

    // Ensure stations inside have unique IDs if present
    if (cloned.stacje && cloned.stacje.length > 0) {
      cloned.stacje = cloned.stacje.map(st => ({
        ...st,
        id: 'st-' + Math.random().toString(36).substring(2, 9)
      }));
    }

    const normalized = normalizeOffer(cloned);

    // Save to server
    try {
      setSaving(true);
      await safeFetchJson('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      try {
        const listData = await safeFetchJson('/api/offers');
        const normalizedData = (listData || []).map((o: any) => normalizeOffer(o));
        const sorted = sortOffersNewestFirst(normalizedData);
        setOffers(sorted);
      } catch (_) {
        setOffers(prev => sortOffersNewestFirst([normalized, ...prev]));
      }
      setSelectedId(normalized.id);
      setActiveOffer(normalized);
      setUnsavedChanges(false);
    } catch (err) {
      console.error("Error cloning offer:", err);
      setOffers(prev => sortOffersNewestFirst([normalized, ...prev]));
      setSelectedId(normalized.id);
      setActiveOffer(normalized);
    } finally {
      setSaving(false);
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (id: string) => {
    try {
      await safeFetchJson(`/api/offers/${id}`, { method: 'DELETE' });
      const remaining = sortOffersNewestFirst(offers.filter(o => o.id !== id));
      setOffers(remaining);
      if (selectedId === id) {
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
          setActiveOffer(remaining[0]);
        } else {
          setSelectedId('');
          setActiveOffer(null);
        }
      }
      setUnsavedChanges(false);
    } catch (err: any) {
      console.error("Error deleting offer:", err);
      alert(`Błąd podczas usuwania oferty: ${err.message || err}`);
    }
  };

  // Export db to browser JSON download
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(offers, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ENCO_OFERTY_DATABASE_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const offersArray = Array.isArray(parsed) ? parsed : [parsed];
          
          // Post each offer to DB
          for (const item of offersArray) {
            if (item.id) {
              await safeFetchJson('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              });
            }
          }
          alert("Pomyślnie zaimportowano oferty!");
          loadOffers();
        } catch (ex) {
          alert("Błąd podczas odczytu pliku JSON. Upewnij się, że plik ma poprawny schemat ENCO.");
        }
      };
    }
  };

  return (
    <div id="anco-app-container" className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: SAVED OFFERS DATABASE */}
      <OffersSidebar 
        offers={offers}
        selectedId={selectedId}
        onSelect={handleSelectOffer}
        onAddNew={handleAddNewOffer}
        onClone={handleCloneOffer}
        onDelete={handleDeleteOffer}
        onImportJSON={handleImportJSON}
        onExportJSON={handleExportJSON}
      />

      {/* CORE LAYOUT split: Form (left) + Preview (right) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-150 text-slate-900">
        
        {/* TOP STATUS BAR (No-print) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center shrink-0 no-print">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-enco-navy" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-wide font-heading">
                  Panel Operacyjny Generatora ENCO
                </h1>
                <span className="text-[10px] bg-slate-100 text-enco-navy px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-slate-200">
                  v1.2.0
                </span>
                {unsavedChanges && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full font-bold animate-pulse inline-flex items-center gap-1 border border-amber-500/20">
                    Niezapisane zmiany
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Wprowadzaj parametry budynku i rozdzielnic po lewej. Gotowy tekst w formacie ENCO zaktualizuje się dynamicznie po prawej.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick stats on the server file base */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-550">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Baza: <strong>{offers.length}</strong> ofert w JSON</span>
            </div>

            <button
              onClick={() => setShowDatabaseEditor(!showDatabaseEditor)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border ${
                showDatabaseEditor
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Edytuj predefiniowane opcje i słowniki"
            >
              <Database className="w-3.5 h-3.5 text-enco-blue" />
              <span>Baza słowników</span>
            </button>

            {activeOffer && (
              <button
                type="button"
                onClick={() => handleCloneOffer(activeOffer.id)}
                disabled={saving}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Utwórz kopię (klon) tej oferty z kolejnym numerem L. Dz."
              >
                <Copy className="w-3.5 h-3.5 text-cyan-600" />
                <span>Klonuj ofertę</span>
              </button>
            )}

            {activeOffer && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('enco_default_offer_template', JSON.stringify(activeOffer));
                  alert("Obecna oferta (ustawienia i treść) została pomyślnie zapisana jako Twój domyślny szablon dla nowo tworzonych ofert!");
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Zapisz tę ofertę jako domyślny szablon dla nowo tworzonych ofert"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ustaw jako domyślną</span>
              </button>
            )}

            {activeOffer && (
              <button
                onClick={() => saveOffer(activeOffer)}
                disabled={saving}
                className={`py-1.5 px-4 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                  unsavedChanges 
                    ? 'bg-enco-blue hover:bg-enco-blue-hover text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Zapisywanie...</span>
                  </>
                ) : (
                  <>
                    <Save className={`w-3.5 h-3.5 ${unsavedChanges ? 'text-white' : 'text-enco-blue'}`} />
                    <span>Zapisz ofertę</span>
                  </>
                )}
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-3">
            <RefreshCw className="w-8 h-8 text-enco-blue animate-spin" />
            <span className="text-sm font-semibold text-slate-500 font-heading">Ładowanie bazy ofert ENCO...</span>
          </div>
        ) : showDatabaseEditor ? (
          <ConstantDataEditor 
            onBack={() => setShowDatabaseEditor(false)}
          />
        ) : activeOffer ? (
          <div className="flex-1 flex overflow-hidden">
            {/* FORM CONFIGURATOR PANEL */}
            <FormPanel 
              offer={activeOffer}
              onChange={handleActiveOfferChange}
            />

            {/* REAL-TIME PREVIEW / PRINT PANEL */}
            <PreviewPanel 
              offer={activeOffer}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">Brak aktywnej oferty</h3>
            <p className="text-xs text-slate-450 max-w-sm mt-1 mb-4">
              Nie wybrano żadnej oferty z bazy. Kliknij "Nowa Oferta" w lewym panelu lub zaimportuj plik JSON, aby zacząć pracę z kreatorem.
            </p>
            <button
              onClick={() => handleAddNewOffer('stacja_nz')}
              className="bg-enco-blue hover:bg-enco-blue-hover inline-flex items-center gap-2 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md cursor-pointer transition-colors"
            >
              Utwórz pierwszą szablonową stację NZ
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
