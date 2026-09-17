/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Cable, Cpu, Coins, Sliders, User, Sparkles, Check, ChevronRight, ChevronLeft, Info, Eye, Trash2, Plus, ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import { 
  DaneOferty, 
  LIST_ELEMENTY_DODATKOWE_STACJA, 
  LIST_DOSTAWA_NIE_OBEJMOWE_STACJA, 
  OfferType,
  StacjaOferty,
  DEFAULT_POLA_NN,
  DEFAULT_POLA_SN,
  DEFAULT_DODATKOWE_SN
} from '../types';
import { getConstantLists, saveConstantLists } from '../dataConstants';
import EditableSelect from './EditableSelect';

interface FormPanelProps {
  offer: DaneOferty;
  onChange: (updated: DaneOferty) => void;
}

export default function FormPanel({ offer: propOffer, onChange }: FormPanelProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  const [constantLists, setConstantLists] = useState(getConstantLists());
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [confirmClearField, setConfirmClearField] = useState<string | null>(null);
  const [localInneLines, setLocalInneLines] = useState<string[]>([]);
  const [localSlusarkaLines, setLocalSlusarkaLines] = useState<string[]>([]);
  const [newBuildingPoint, setNewBuildingPoint] = useState<string>('');
  const [savePointToSlo, setSavePointToSlo] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setConstantLists(getConstantLists());
    };
    window.addEventListener('enco-constants-updated', handleUpdate);
    return () => {
      window.removeEventListener('enco-constants-updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (confirmDeleteIdx !== null) {
      const timer = setTimeout(() => {
        setConfirmDeleteIdx(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteIdx]);

  useEffect(() => {
    if (confirmClearField !== null) {
      const timer = setTimeout(() => {
        setConfirmClearField(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [confirmClearField]);

  // Ensure 'stacje' is normalized and populated
  const currentStacje = propOffer.stacje && propOffer.stacje.length > 0 ? propOffer.stacje : [
    {
      id: 'default',
      post_temat: propOffer.post_temat || 'POST __________',
      offer_type: propOffer.offer_type || 'stacja_nz',
      budynek: propOffer.budynek,
      rozdzielnica_sn: propOffer.rozdzielnica_sn,
      rozdzielnica_nn: propOffer.rozdzielnica_nn,
      telemechanika: propOffer.telemechanika,
      polaczenia_kablowe: propOffer.polaczenia_kablowe,
      dodatkowe_elementy: propOffer.dodatkowe_elementy,
      cena: propOffer.cena,
      pomin_budynek_stacji: propOffer.pomin_budynek_stacji,
      pomin_rozdzielnice_SN: propOffer.pomin_rozdzielnice_SN,
      pomin_rozdzielnice_NN: propOffer.pomin_rozdzielnice_NN,
      pomin_telemechanike: propOffer.pomin_telemechanike,
      pomin_polaczenia_kablowe: propOffer.pomin_polaczenia_kablowe,
      pomin_tablice_licznikowa: propOffer.pomin_tablice_licznikowa,
      naglowek_stacji_tekst: propOffer.naglowek_stacji_tekst,
      tablica_licznikowa_tytul: propOffer.tablica_licznikowa_tytul,
      tablica_licznikowa_tekst: propOffer.tablica_licznikowa_tekst
    } as StacjaOferty
  ];

  const activeStationIndexSafe = Math.min(activeStationIndex, currentStacje.length - 1);
  const activeStacja = currentStacje[activeStationIndexSafe];

  // Resolve virtual 'offer' fields to current active station so standard form fields work out of the box
  const offer = {
    ...propOffer,
    post_temat: activeStacja.post_temat,
    offer_type: activeStacja.offer_type,
    budynek: activeStacja.budynek,
    rozdzielnica_sn: activeStacja.rozdzielnica_sn,
    rozdzielnica_nn: activeStacja.rozdzielnica_nn,
    telemechanika: activeStacja.telemechanika,
    polaczenia_kablowe: activeStacja.polaczenia_kablowe,
    dodatkowe_elementy: activeStacja.dodatkowe_elementy,
    cena: activeStacja.cena,
    pomin_budynek_stacji: activeStacja.pomin_budynek_stacji,
    pomin_rozdzielnice_SN: activeStacja.pomin_rozdzielnice_SN,
    pomin_rozdzielnice_NN: activeStacja.pomin_rozdzielnice_NN,
    pomin_telemechanike: activeStacja.pomin_telemechanike,
    pomin_polaczenia_kablowe: activeStacja.pomin_polaczenia_kablowe,
    pomin_tablice_licznikowa: activeStacja.pomin_tablice_licznikowa,
    naglowek_stacji_tekst: activeStacja.naglowek_stacji_tekst,
    tablica_licznikowa_tytul: activeStacja.tablica_licznikowa_tytul,
    tablica_licznikowa_tekst: activeStacja.tablica_licznikowa_tekst,
    dostawa_nie_obejmuje: activeStacja.dostawa_nie_obejmuje || propOffer.dostawa_nie_obejmuje || { selected: [], custom: '' },
  };

  useEffect(() => {
    if (activeStacja && activeStacja.polaczenia_kablowe) {
      const rawInne = activeStacja.polaczenia_kablowe.inne || '';
      if (rawInne === '') {
        setLocalInneLines([]);
      } else {
        setLocalInneLines(rawInne.split('\n'));
      }
    } else {
      setLocalInneLines([]);
    }
  }, [activeStationIndexSafe, activeStacja?.id, activeStacja?.polaczenia_kablowe?.inne]);

  useEffect(() => {
    if (activeStacja && activeStacja.budynek) {
      const rawDrzwi = activeStacja.budynek.drzwi_typ_ilosc || '';
      if (rawDrzwi === '') {
        setLocalSlusarkaLines([]);
      } else {
        setLocalSlusarkaLines(rawDrzwi.split('\n'));
      }
    } else {
      setLocalSlusarkaLines([]);
    }
  }, [activeStationIndexSafe, activeStacja?.id, activeStacja?.budynek?.drzwi_typ_ilosc]);

  // Helper additions for managing multiple stations
  const handleAddStation = () => {
    const newStation: StacjaOferty = {
      id: 'stacja-' + Math.random().toString(36).substring(2, 9),
      post_temat: propOffer.post_temat || `POST STACJA ${currentStacje.length + 1}`,
      offer_type: 'stacja_nz',
      budynek: {
        typ_budynku: 'NZ',
        wymiary_dlugosc: '2.1',
        wymiary_szerokosc: '2.9',
        wymiary_wysokosc: '2.66',
        przepusty_nn: '12',
        przepusty_sn: '2',
        przepusty_uziemienie: '3',
        powloka_antygraffiti: true,
        kolor_obudowa: 'RAL 1013',
        kolor_slusarka: 'RAL 8014',
        kolor_dach: 'RAL 8014',
        kolor_drzwi_kraty: 'RAL 8014',
        drzwi_typ_ilosc: '1 x drzwi jednoskrzydłowe pełne  do komory transformatora',
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
        ilosc_pol: '3',
        pol_liniowe: 'Pole liniowe - 2 szt. rozłącznik z uziemnikiem, napęd silnikowy 24V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania',
        pol_transformatorowe: 'Pole transformatorowe - 1 szt. rozłącznik z uziemnikiem i bezpiecznikami, napęd silnikowy 24V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania',
        pol_niestandardowe: 'Czujnik ciśnienia powietrza (izolacja powietrzna, bez gazu SF6)\nUzgadniacz faz',
        parametry: 'Schneider Electric RM AirSet w układzie IIQ - 24kV, 630A, 20kA/1s'
      },
      rozdzielnica_nn: {
        ilosc_pol: '12',
        rozlacznik_zasilajacy: '1250A',
        rozlacznik_niestandardowy_opis: 'SIRCO 1250A',
        przydzial_630a: '9 x ARS3 Smart pro 630A z sygnalizacją przepalenia wkładki bezpiecznikowej',
        przydzial_400a: '2 x SL3-3-3: 400A',
        technologia_smart: true,
        custom_punkty: [],
        pola: DEFAULT_POLA_NN
      },
      telemechanika: {
        wlaczone: true,
        sterownik: 'RTU7M',
        sensory: 'szafa telemechaniki wyposażona w sterownik RTU7M oraz sensory prądowe i napięciowe'
      },
      polaczenia_kablowe: {
        most_sn: 'Most kablowy SN pomiędzy transformatorem a rozdzielnicą SN – kabel 3 x YHAKXS 1 x 70mm² wraz z głowicami',
        most_nn: 'Most kablowy nN pomiędzy transformatorem a rozdzielnicą nN – kabel 4 x 2 x YKXS 1 x 240mm²',
        inne: ''
      },
      dodatkowe_elementy: {
        selected: [...(constantLists.dodatkowe_elementy || [])],
        custom: ''
      },
      dostawa_nie_obejmuje: {
        selected: [...(constantLists.dostawa_nie_obejmuje || [])],
        custom: ''
      },
      cena: {
        cena_netto: '0',
        cena_brutto: '0',
        waluta: 'PLN'
      }
    };

    const nextStacje = [...currentStacje, newStation];
    setActiveStationIndex(nextStacje.length - 1);

    const updatedOffer = {
      ...propOffer,
      stacje: nextStacje
    };
    onChange(updatedOffer);
  };

  const handleRemoveStation = (idxToRemove: number) => {
    if (currentStacje.length <= 1) return;
    const nextStacje = currentStacje.filter((_, idx) => idx !== idxToRemove);
    let nextIndex = activeStationIndexSafe;
    if (nextIndex >= nextStacje.length) {
      nextIndex = nextStacje.length - 1;
    }
    setActiveStationIndex(nextIndex);

    const updatedOffer = {
      ...propOffer,
      stacje: nextStacje
    };
    if (nextStacje[0]) {
      const s0 = nextStacje[0];
      updatedOffer.offer_type = s0.offer_type;
      updatedOffer.post_temat = s0.post_temat;
      updatedOffer.budynek = s0.budynek;
      updatedOffer.rozdzielnica_sn = s0.rozdzielnica_sn;
      updatedOffer.rozdzielnica_nn = s0.rozdzielnica_nn;
      updatedOffer.telemechanika = s0.telemechanika;
      updatedOffer.polaczenia_kablowe = s0.polaczenia_kablowe;
      updatedOffer.dodatkowe_elementy = s0.dodatkowe_elementy;
      updatedOffer.cena = s0.cena;
      updatedOffer.pomin_budynek_stacji = s0.pomin_budynek_stacji;
      updatedOffer.pomin_rozdzielnice_SN = s0.pomin_rozdzielnice_SN;
      updatedOffer.pomin_rozdzielnice_NN = s0.pomin_rozdzielnice_NN;
      updatedOffer.pomin_telemechanike = s0.pomin_telemechanike;
      updatedOffer.pomin_polaczenia_kablowe = s0.pomin_polaczenia_kablowe;
      updatedOffer.pomin_tablice_licznikowa = s0.pomin_tablice_licznikowa;
      updatedOffer.naglowek_stacji_tekst = s0.naglowek_stacji_tekst;
      updatedOffer.tablica_licznikowa_tytul = s0.tablica_licznikowa_tytul;
      updatedOffer.tablica_licznikowa_tekst = s0.tablica_licznikowa_tekst;
    }
    onChange(updatedOffer);
  };

  // Stepper steps
  const steps = [
    { title: "Ogólne i Klient", icon: User },
    { title: "Budynek stacji", icon: Building2, disabled: offer.offer_type?.toLowerCase().includes('komponenty') },
    { title: "Rozdzielnica SN", icon: Sliders },
    { title: "Rozdzielnica nN", icon: Sliders },
    { title: "Kable & Telemechanika", icon: Cable },
    { title: "Dodatki, Wyłączenia & Ceny", icon: Coins },
  ];

  // Helper updates
  const updateField = (section: keyof DaneOferty | null, field: string, value: any) => {
    // Determine if station specific:
    const stationSpecificSections = ['budynek', 'rozdzielnica_sn', 'rozdzielnica_nn', 'telemechanika', 'polaczenia_kablowe', 'dodatkowe_elementy', 'cena', 'dostawa_nie_obejmuje'];
    const stationSpecificKeys = [
      'post_temat', 'offer_type', 
      'pomin_budynek_stacji', 'pomin_rozdzielnice_SN', 'pomin_rozdzielnice_NN', 'pomin_telemechanike', 'pomin_polaczenia_kablowe', 'pomin_tablice_licznikowa',
      'naglowek_stacji_tekst', 'tablica_licznikowa_tytul', 'tablica_licznikowa_tekst'
    ];

    const isStationSpecific = 
      (section !== null && stationSpecificSections.includes(section as string)) || 
      (section === null && stationSpecificKeys.includes(field));

    if (isStationSpecific) {
      const updatedStacje = currentStacje.map((st, idx) => {
        // Since post_temat is a shared document-wide value, update it for all stations
        if (field === 'post_temat' && section === null) {
          return {
            ...st,
            post_temat: value
          };
        }
        if (idx !== activeStationIndexSafe) return st;
        if (section === null) {
          return {
            ...st,
            [field]: value
          };
        } else {
          return {
            ...st,
            [section]: {
              ...(st[section as keyof StacjaOferty] as any),
              [field]: value
            }
          };
        }
      }) as StacjaOferty[];

      const updatedOffer = {
        ...propOffer,
        stacje: updatedStacje
      } as DaneOferty;

      // Sync top level properties with stacje[0] for retro compatibility
      if (updatedStacje[0]) {
        const s0 = updatedStacje[0];
        updatedOffer.offer_type = s0.offer_type;
        updatedOffer.post_temat = s0.post_temat;
        updatedOffer.budynek = s0.budynek;
        updatedOffer.rozdzielnica_sn = s0.rozdzielnica_sn;
        updatedOffer.rozdzielnica_nn = s0.rozdzielnica_nn;
        updatedOffer.telemechanika = s0.telemechanika;
        updatedOffer.polaczenia_kablowe = s0.polaczenia_kablowe;
        updatedOffer.dodatkowe_elementy = s0.dodatkowe_elementy;
        updatedOffer.dostawa_nie_obejmuje = s0.dostawa_nie_obejmuje || { selected: [], custom: '' };
        updatedOffer.cena = s0.cena;
        updatedOffer.pomin_budynek_stacji = s0.pomin_budynek_stacji;
        updatedOffer.pomin_rozdzielnice_SN = s0.pomin_rozdzielnice_SN;
        updatedOffer.pomin_rozdzielnice_NN = s0.pomin_rozdzielnice_NN;
        updatedOffer.pomin_telemechanike = s0.pomin_telemechanike;
        updatedOffer.pomin_polaczenia_kablowe = s0.pomin_polaczenia_kablowe;
        updatedOffer.pomin_tablice_licznikowa = s0.pomin_tablice_licznikowa;
        updatedOffer.naglowek_stacji_tekst = s0.naglowek_stacji_tekst;
        updatedOffer.tablica_licznikowa_tytul = s0.tablica_licznikowa_tytul;
        updatedOffer.tablica_licznikowa_tekst = s0.tablica_licznikowa_tekst;
      }

      onChange(updatedOffer);
    } else {
      if (section === null) {
        onChange({
          ...propOffer,
          [field]: value
        });
      } else {
        onChange({
          ...propOffer,
          [section]: {
            ...(propOffer[section as keyof DaneOferty] as any),
            [field]: value
          }
        });
      }
    }
  };

  const updateFields = (section: keyof DaneOferty, fields: Record<string, any>) => {
    // Determine if station specific:
    const stationSpecificSections = ['budynek', 'rozdzielnica_sn', 'rozdzielnica_nn', 'telemechanika', 'polaczenia_kablowe', 'dodatkowe_elementy', 'cena', 'dostawa_nie_obejmuje'];
    const isStationSpecific = stationSpecificSections.includes(section as string);

    if (isStationSpecific) {
      const updatedStacje = currentStacje.map((st, idx) => {
        if (idx !== activeStationIndexSafe) return st;
        return {
          ...st,
          [section]: {
            ...(st[section as keyof StacjaOferty] as any),
            ...fields
          }
        };
      }) as StacjaOferty[];

      const updatedOffer = {
        ...propOffer,
        stacje: updatedStacje
      } as DaneOferty;

      // Sync top level properties with stacje[0] for retro compatibility
      if (updatedStacje[0]) {
        const s0 = updatedStacje[0];
        updatedOffer.offer_type = s0.offer_type;
        updatedOffer.post_temat = s0.post_temat;
        updatedOffer.budynek = s0.budynek;
        updatedOffer.rozdzielnica_sn = s0.rozdzielnica_sn;
        updatedOffer.rozdzielnica_nn = s0.rozdzielnica_nn;
        updatedOffer.telemechanika = s0.telemechanika;
        updatedOffer.polaczenia_kablowe = s0.polaczenia_kablowe;
        updatedOffer.dodatkowe_elementy = s0.dodatkowe_elementy;
        updatedOffer.dostawa_nie_obejmuje = s0.dostawa_nie_obejmuje || { selected: [], custom: '' };
        updatedOffer.cena = s0.cena;
        updatedOffer.pomin_budynek_stacji = s0.pomin_budynek_stacji;
        updatedOffer.pomin_rozdzielnice_SN = s0.pomin_rozdzielnice_SN;
        updatedOffer.pomin_rozdzielnice_NN = s0.pomin_rozdzielnice_NN;
        updatedOffer.pomin_telemechanike = s0.pomin_telemechanike;
        updatedOffer.pomin_polaczenia_kablowe = s0.pomin_polaczenia_kablowe;
        updatedOffer.pomin_tablice_licznikowa = s0.pomin_tablice_licznikowa;
        updatedOffer.naglowek_stacji_tekst = s0.naglowek_stacji_tekst;
        updatedOffer.tablica_licznikowa_tytul = s0.tablica_licznikowa_tytul;
        updatedOffer.tablica_licznikowa_tekst = s0.tablica_licznikowa_tekst;
      }

      onChange(updatedOffer);
    } else {
      onChange({
        ...propOffer,
        [section]: {
          ...(propOffer[section as keyof DaneOferty] as any),
          ...fields
        }
      });
    }
  };

  const updateOfferTypeAndBuilding = (newOfferType: string) => {
    const normalized = newOfferType.toLowerCase();
    let typBudynku: 'NZ' | 'BEK' | 'komponenty' = 'NZ';
    if (normalized.includes('bek')) {
      typBudynku = 'BEK';
    } else if (normalized.includes('nz')) {
      typBudynku = 'NZ';
    } else if (normalized.includes('zksn')) {
      typBudynku = 'BEK';
    } else if (normalized.includes('obudowa')) {
      typBudynku = 'NZ';
    } else if (normalized.includes('komponenty') || normalized.includes('komp')) {
      typBudynku = 'komponenty';
    }

    const updatedStacje = currentStacje.map((st, idx) => {
      if (idx !== activeStationIndexSafe) return st;
      return {
        ...st,
        offer_type: newOfferType,
        budynek: {
          ...st.budynek,
          typ_budynku: typBudynku
        }
      };
    }) as StacjaOferty[];

    const updatedOffer = {
      ...propOffer,
      stacje: updatedStacje
    } as DaneOferty;

    if (updatedStacje[0]) {
      const s0 = updatedStacje[0];
      updatedOffer.offer_type = s0.offer_type;
      updatedOffer.post_temat = s0.post_temat;
      updatedOffer.budynek = s0.budynek;
      updatedOffer.rozdzielnica_sn = s0.rozdzielnica_sn;
      updatedOffer.rozdzielnica_nn = s0.rozdzielnica_nn;
      updatedOffer.telemechanika = s0.telemechanika;
      updatedOffer.polaczenia_kablowe = s0.polaczenia_kablowe;
      updatedOffer.dodatkowe_elementy = s0.dodatkowe_elementy;
      updatedOffer.dostawa_nie_obejmuje = s0.dostawa_nie_obejmuje || { selected: [], custom: '' };
      updatedOffer.cena = s0.cena;
      updatedOffer.pomin_budynek_stacji = s0.pomin_budynek_stacji;
      updatedOffer.pomin_rozdzielnice_SN = s0.pomin_rozdzielnice_SN;
      updatedOffer.pomin_rozdzielnice_NN = s0.pomin_rozdzielnice_NN;
      updatedOffer.pomin_telemechanike = s0.pomin_telemechanike;
      updatedOffer.pomin_polaczenia_kablowe = s0.pomin_polaczenia_kablowe;
      updatedOffer.pomin_tablice_licznikowa = s0.pomin_tablice_licznikowa;
      updatedOffer.naglowek_stacji_tekst = s0.naglowek_stacji_tekst;
      updatedOffer.tablica_licznikowa_tytul = s0.tablica_licznikowa_tytul;
      updatedOffer.tablica_licznikowa_tekst = s0.tablica_licznikowa_tekst;
    }

    onChange(updatedOffer);
  };

  // Helper to parse price string safely supporting spaces or Polish separators
  const parsePrice = (valStr: string | undefined | null): number => {
    if (!valStr) return 0;
    let clean = String(valStr).trim();
    clean = clean.replace(/[\s\xa0]/g, '');
    clean = clean.replace(/[a-zA-Z]/g, ''); // strip out currency signs if any
    
    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    
    if (lastDot !== -1 && lastComma !== -1) {
      if (lastComma > lastDot) {
        clean = clean.replace(/\./g, '').replace(/,/g, '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (lastComma !== -1) {
      clean = clean.replace(/,/g, '.');
    } else if (lastDot !== -1) {
      const parts = clean.split('.');
      if (parts.length === 2 && parts[1].length === 3) {
        clean = clean.replace(/\./g, '');
      }
    }
    
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Automated Netto -> Brutto calculator updating both fields atomically
  const handleNettoChange = (valStr: string) => {
    const numeric = parsePrice(valStr);
    const isNumericInput = /^[0-9\s.,złzŁ]*$/i.test(valStr.trim());
    const calculatedBrutto = isNumericInput && numeric > 0 ? Math.round(numeric * 1.23).toString() : valStr;
    
    const updatedStacje = currentStacje.map((st, idx) => {
      if (idx !== activeStationIndexSafe) return st;
      return {
        ...st,
        cena: {
          ...st.cena,
          cena_netto: valStr,
          cena_brutto: calculatedBrutto
        }
      };
    }) as StacjaOferty[];

    const updatedOffer = {
      ...propOffer,
      stacje: updatedStacje
    } as DaneOferty;

    if (updatedStacje[0]) {
      const s0 = updatedStacje[0];
      updatedOffer.cena = s0.cena;
    }

    onChange(updatedOffer);
  };

  // AI assistant to polish text fields on the server
  const optimizeTextWithAI = async (section: string | null, field: string, currentValue: string, contextDescription: string) => {
    if (!currentValue.trim()) {
      alert("Proszę wpisać najpierw opis roboczy (np. 'dwie linie z silnikami 24V'), aby AI mogło go ulepszyć.");
      return;
    }
    const fieldKey = `${section || 'root'}-${field}`;
    setEnhancingField(fieldKey);

    try {
      const response = await fetch('/api/gemini/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentValue, 
          context: contextDescription 
         })
      });

      const data = await response.json();
      if (data.warning) {
        alert(data.warning);
      }
      if (data.enhancedText) {
        if (section === null) {
          updateField(null, field, data.enhancedText);
        } else {
          updateField(section as any, field, data.enhancedText);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Wystąpił błąd podczas optymalizacji tekstu: " + err.message);
    } finally {
      setEnhancingField(null);
    }
  };

  // Toggle checks in list
  const toggleCheckbox = (section: 'dodatkowe_elementy' | 'dostawa_nie_obejmuje', item: string) => {
    const currentList = offer[section].selected || [];
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    updateField(section, 'selected', newList);
  };

  const handleAddCustomItem = (section: 'dodatkowe_elementy' | 'dostawa_nie_obejmuje', item: string) => {
    const allLists = { ...constantLists };
    const currentList = allLists[section] || [];
    
    if (!currentList.includes(item)) {
      const updatedList = [...currentList, item];
      allLists[section] = updatedList;
      setConstantLists(allLists);
      saveConstantLists(allLists);
      
      // Notify other components (like ConstantDataEditor) in case they are mounted
      window.dispatchEvent(new CustomEvent('enco-constants-updated'));
    }
    
    // Check it inside the current offer
    const currentSelected = offer[section].selected || [];
    if (!currentSelected.includes(item)) {
      updateField(section, 'selected', [...currentSelected, item]);
    }
  };

  const handleRemoveCustomItem = (section: 'dodatkowe_elementy' | 'dostawa_nie_obejmuje', itemToRemove: string) => {
    const allLists = { ...constantLists };
    const currentList = allLists[section] || [];
    const updatedList = currentList.filter(item => item !== itemToRemove);
    allLists[section] = updatedList;
    setConstantLists(allLists);
    saveConstantLists(allLists);
    
    // Notify lists and components of update
    window.dispatchEvent(new CustomEvent('enco-constants-updated'));
    
    // Also remove from selected in current offer if it was checked
    const currentSelected = offer[section].selected || [];
    if (currentSelected.includes(itemToRemove)) {
      updateField(section, 'selected', currentSelected.filter(item => item !== itemToRemove));
    }
  };

  // Safe navigation
  const nextStep = () => {
    let next = activeStep + 1;
    while (next < steps.length && steps[next]?.disabled) {
      next++;
    }
    if (next < steps.length) setActiveStep(next);
  };

  const prevStep = () => {
    let prev = activeStep - 1;
    while (prev >= 0 && steps[prev]?.disabled) {
      prev--;
    }
    if (prev >= 0) setActiveStep(prev);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200 no-print">
      {/* Stepper Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 no-print">
        <div className="flex justify-between items-center overflow-x-auto gap-4 py-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const isDisabled = step.disabled;

            if (isDisabled) return null;

            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-enco-blue text-white shadow-sm'
                    : isCompleted 
                      ? 'bg-slate-200 text-enco-navy' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Station Selector Controls & Tabs (Always Visible) */}
      <div className="bg-slate-50/80 border-b border-zinc-200 px-6 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 no-print select-none">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Pozycja w ofercie:</span>
          {currentStacje.map((st, idx) => (
            <div key={st.id} className="inline-flex items-center relative group mr-1">
              <button
                type="button"
                onClick={() => setActiveStationIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 border shrink-0 ${
                  activeStationIndexSafe === idx
                    ? 'bg-[#004a99] border-[#004a99] text-white shadow-sm'
                    : 'bg-white border-zinc-200 text-[#0F3A60] hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer'
                }`}
              >
                <span>{idx + 1}. {st.offer_type?.toLowerCase().includes('komponenty') ? 'Komponenty' : `${st.offer_type?.toUpperCase() || 'NZ'}`}</span>
              </button>
              {currentStacje.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeleteIdx === idx) {
                      handleRemoveStation(idx);
                      setConfirmDeleteIdx(null);
                    } else {
                      setConfirmDeleteIdx(idx);
                    }
                  }}
                  className={confirmDeleteIdx === idx
                    ? "absolute -top-2 -right-3 bg-red-700 hover:bg-red-800 text-white rounded px-1.5 py-0.5 text-[8px] font-bold flex items-center justify-center border border-white cursor-pointer transition-all scale-105 shadow-md z-50 whitespace-nowrap animate-pulse"
                    : "absolute -top-1.5 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center border border-white cursor-pointer hover:scale-110 transition-transform shadow-xs opacity-90 mr-1 z-10"
                  }
                  title={confirmDeleteIdx === idx ? "Kliknij ponownie aby usunąć stację" : "Usuń pozycję"}
                >
                  {confirmDeleteIdx === idx ? "Usuń? 🗑" : <span className="relative -top-[1px]">&times;</span>}
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddStation}
            className="bg-white hover:bg-zinc-50 text-[#004a99] hover:text-[#003875] border border-dashed border-[#004a99]/60 hover:border-[#004a99] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <span>+ Dodaj kolejną stację / pozycję</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* STEP 0: OGÓLNE I DANE KLIENTA */}
        {activeStep === 0 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-heading font-semibold text-enco-blue border-b border-slate-200 pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-enco-blue" />
              Dane handlowe i Klient
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <EditableSelect
                  label="Typ Oferty"
                  value={offer.offer_type || 'NZ'}
                  onChange={(val) => {
                    updateOfferTypeAndBuilding(val);
                  }}
                  options={constantLists.typy_stacji || []}
                  categoryKey="typy_stacji"
                  placeholder="Wybierz lub dodaj typ pozycji..."
                />
              </div>

              <div className="col-span-2 bg-slate-50 border border-slate-150 p-3 rounded-lg">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tytuł dokumentu / oferty</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={offer.tytul_oferty || 'OFERTA DO ZAKUPU'}
                    placeholder="np. OFERTA DO ZAKUPU, OFERTA, OFERTA HANDLOWA"
                    onChange={(e) => updateField(null, 'tytul_oferty', e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-enco-blue"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => updateField(null, 'tytul_oferty', 'OFERTA DO ZAKUPU')}
                    className={`text-xs py-1 px-2.5 rounded transition-colors font-medium border cursor-pointer ${
                      (offer.tytul_oferty || 'OFERTA DO ZAKUPU') === 'OFERTA DO ZAKUPU'
                        ? 'bg-enco-blue text-white border-enco-blue font-bold shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    OFERTA DO ZAKUPU
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField(null, 'tytul_oferty', 'OFERTA')}
                    className={`text-xs py-1 px-2.5 rounded transition-colors font-medium border cursor-pointer ${
                      (offer.tytul_oferty || 'OFERTA DO ZAKUPU') === 'OFERTA'
                        ? 'bg-enco-blue text-white border-enco-blue font-bold shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    OFERTA
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField(null, 'tytul_oferty', 'OFERTA HANDLOWA')}
                    className={`text-xs py-1 px-2.5 rounded transition-colors font-medium border cursor-pointer ${
                      (offer.tytul_oferty || 'OFERTA DO ZAKUPU') === 'OFERTA HANDLOWA'
                        ? 'bg-enco-blue text-white border-enco-blue font-bold shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    OFERTA HANDLOWA
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Numer Oferty</label>
                <input 
                  type="text" 
                  value={offer.numer_oferty}
                  placeholder="np. L. Dz. 154/06/26"
                  onChange={(e) => updateField(null, 'numer_oferty', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-enco-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data Oferty</label>
                <input 
                  type="date" 
                  value={(() => {
                    if (!offer.data_oferty) return '';
                    const parts = offer.data_oferty.split('.');
                    if (parts.length === 3) {
                      const day = parts[0].padStart(2, '0');
                      const month = parts[1].padStart(2, '0');
                      const year = parts[2];
                      if (year.length === 4) {
                        return `${year}-${month}-${day}`;
                      }
                    }
                    return offer.data_oferty;
                  })()}
                  onChange={(e) => {
                    const val = e.target.value; // YYYY-MM-DD
                    if (!val) {
                      updateField(null, 'data_oferty', '');
                      return;
                    }
                    const parts = val.split('-');
                    if (parts.length === 3) {
                      const plDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
                      updateField(null, 'data_oferty', plDate);
                    } else {
                      updateField(null, 'data_oferty', val);
                    }
                  }}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Temat POST</label>
                <input 
                  type="text" 
                  value={offer.post_temat}
                  placeholder="np. POST 01071 (Augustów / Wyszńskiego)"
                  onChange={(e) => updateField(null, 'post_temat', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-enco-blue"
                />
              </div>
            </div>

            {/* Custom headlines section */}
            <div className="bg-[#FFFED4]/40 p-4 rounded-lg border border-amber-200/60 mt-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Edycja stałych wierszy i nagłówków
              </h4>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-0.5">Wiersz Dotyczy ("Dot. Dostawy stacji...")</label>
                <input 
                  type="text" 
                  value={offer.dot_tekst !== undefined ? offer.dot_tekst : `Dot. Dostawy stacji transformatorowej do ${offer.post_temat || 'POST __________'}`}
                  onChange={(e) => updateField(null, 'dot_tekst', e.target.value)}
                  placeholder="Dowolny tekst dotyczy..."
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Służy do nadpisania żółtej ramki "Dot. Dostawy stacji..." u góry oferty.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-0.5">Nagłówek sekcji 1 ("1. STACJA TRANSFORMATOROWA...")</label>
                <input 
                  type="text" 
                  value={offer.naglowek_stacji_tekst !== undefined ? offer.naglowek_stacji_tekst : `1. STACJA TRANSFORMATOROWA ${offer.post_temat.toUpperCase() || 'NZ / BEK __________'}`}
                  onChange={(e) => updateField(null, 'naglowek_stacji_tekst', e.target.value)}
                  placeholder="Dowolny nagłówek stacji..."
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue font-bold text-enco-navy text-xs uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Służy do nadpisania niebieskiego paska sekcji nr 1.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-0.5">Tekst wstępu / wprowadzający (Pierwsza strona)</label>
                <textarea 
                  rows={3}
                  value={offer.wstep_tekst || ''}
                  onChange={(e) => updateField(null, 'wstep_tekst', e.target.value)}
                  placeholder="Zostaw puste, aby użyć domyślnego tekstu: 'ENCO Sp. z o.o. niniejszym składa ofertę...'"
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue font-medium resize-y"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Pozwala zmienić treść domyślnego akapitu na pierwszej stronie (pod tytułem).</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 mt-4 space-y-3">
              <h4 className="text-xs font-bold text-enco-navy uppercase tracking-widest">Dane Zamawiającego / Klienta</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-0.5">Nazwa Firmy</label>
                <input 
                  type="text" 
                  value={offer.klient_nazwa}
                  placeholder="np. ELEKTRO-SILVER Sp. z o.o."
                  onChange={(e) => updateField(null, 'klient_nazwa', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-enco-blue font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Ulica i nr</label>
                  <input 
                    type="text" 
                    value={offer.klient_adres}
                    placeholder="np. ul. Łomżyńska 206"
                    onChange={(e) => updateField(null, 'klient_adres', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Miejscowość i Kod pocztowy</label>
                  <input 
                    type="text" 
                    value={offer.klient_miejscowosc_kod}
                    placeholder="np. 18-400 Łomża"
                    onChange={(e) => updateField(null, 'klient_miejscowosc_kod', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Osoba kontaktowa</label>
                  <input 
                    type="text" 
                    value={offer.klient_osoba_kontaktowa}
                    placeholder="np. Marek Olszyński"
                    onChange={(e) => updateField(null, 'klient_osoba_kontaktowa', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Telefon</label>
                  <input 
                    type="text" 
                    value={offer.klient_telefon}
                    placeholder="np. 538 516 612"
                    onChange={(e) => updateField(null, 'klient_telefon', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Email</label>
                  <input 
                    type="email" 
                    value={offer.klient_email}
                    placeholder="np. oferty@elektrosilver.pl"
                    onChange={(e) => updateField(null, 'klient_email', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
              </div>
            </div>

            {/* ZARZĄDZANIE SEKCJAMI (POMIJANIE SEKCJI) */}
            <div className="bg-gradient-to-br from-slate-50 to-zinc-100 p-4 rounded-lg border border-zinc-250 mt-4 space-y-3">
              <h4 className="text-xs font-bold text-enco-navy uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-enco-blue" />
                Zarządzanie sekcjami (Wykluczanie z oferty)
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Zaznacz sekcje, które chcesz **całkowicie pominąć**. Pominięte sekcje znikną z formularza krok po kroku oraz nie wygenerują się w gotowym dokumencie oferty.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-zinc-200 hover:border-enco-blue transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!offer.pomin_budynek_stacji}
                    onChange={(e) => updateField(null, 'pomin_budynek_stacji', e.target.checked)}
                    className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">Pomiń budynek stacji</span>
                    <span className="text-[10px] text-zinc-500">Wyłącz i ukryj sekcję I</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-zinc-200 hover:border-enco-blue transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!offer.pomin_rozdzielnice_SN}
                    onChange={(e) => updateField(null, 'pomin_rozdzielnice_SN', e.target.checked)}
                    className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">Pomiń rozdzielnicę SN</span>
                    <span className="text-[10px] text-zinc-500">Kompaktowe / bez SN</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-zinc-200 hover:border-enco-blue transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!offer.pomin_rozdzielnice_NN}
                    onChange={(e) => updateField(null, 'pomin_rozdzielnice_NN', e.target.checked)}
                    className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">Pomiń rozdzielnicę nN</span>
                    <span className="text-[10px] text-zinc-500">Tylko SN / czyste komponenty</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-zinc-200 hover:border-enco-blue transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!offer.pomin_telemechanike}
                    onChange={(e) => updateField(null, 'pomin_telemechanike', e.target.checked)}
                    className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">Pomiń telemechanikę</span>
                    <span className="text-[10px] text-zinc-500">Wyłączenie szafy i sensoryki</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-zinc-200 hover:border-enco-blue transition-colors cursor-pointer md:col-span-2">
                  <input
                    type="checkbox"
                    checked={!!offer.pomin_polaczenia_kablowe}
                    onChange={(e) => updateField(null, 'pomin_polaczenia_kablowe', e.target.checked)}
                    className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">Pomiń połączenia kablowe (Mosty SN/nN)</span>
                    <span className="text-[10px] text-zinc-500">Kable leżą w zakresie inwestora</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-amber-50/40 rounded border border-amber-200/85 hover:border-enco-blue transition-colors cursor-pointer md:col-span-2">
                  <input
                    type="checkbox"
                    checked={!!offer.pomin_tablice_licznikowa}
                    onChange={(e) => updateField(null, 'pomin_tablice_licznikowa', e.target.checked)}
                    className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-amber-900">Pomiń Tablicę Licznikową</span>
                    <span className="text-[10px] text-amber-700">Całkowicie usuń punkt "3. Tablica Licznikowa" z wygenerowanego dokumentu</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: BUDYNEK STACJI (HIDDEN FOR COMPONENT OFFERS) */}
        {activeStep === 1 && !offer.offer_type?.toLowerCase().includes('komponenty') && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-heading font-semibold text-enco-blue border-b border-slate-200 pb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-enco-blue" />
              Budynek stacji (Konstrukcja i Ślusarka)
            </h3>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="col-span-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Wymiary budynku</h4>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-0.5">Długość (m)</label>
                <input 
                  type="text" 
                  value={offer.budynek.wymiary_dlugosc}
                  onChange={(e) => updateField('budynek', 'wymiary_dlugosc', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-0.5">Szerokość (m)</label>
                <input 
                  type="text" 
                  value={offer.budynek.wymiary_szerokosc}
                  onChange={(e) => updateField('budynek', 'wymiary_szerokosc', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-0.5">Wysokość (m)</label>
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    value={offer.budynek.wymiary_wysokosc}
                    onChange={(e) => updateField('budynek', 'wymiary_wysokosc', e.target.value)}
                    className="w-full min-w-0 bg-white border border-slate-250 rounded px-3 py-1 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                  <select
                    value={offer.budynek.wymiary_wysokosc_typ || 'zewnetrzna'}
                    onChange={(e) => updateField('budynek', 'wymiary_wysokosc_typ', e.target.value as any)}
                    className="bg-white border border-slate-250 text-xs font-semibold text-slate-700 rounded px-2 py-1 focus:outline-none focus:border-enco-blue cursor-pointer shrink-0"
                    title="Wybierz czy wysokość jest zewnętrzna czy wewnętrzna"
                  >
                    <option value="zewnetrzna">zewnętrzna</option>
                    <option value="wewnetrzna">wewnętrzna</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="col-span-2 border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Konstrukcja i dach</h4>
              </div>
              
              <div>
                <EditableSelect
                  label="Konstrukcja budynku"
                  value={offer.budynek.konstrukcja_budynku || 'żelbetowa z betonu C35/45'}
                  onChange={(val) => updateField('budynek', 'konstrukcja_budynku', val)}
                  options={constantLists.konstrukcje_budynku || []}
                  categoryKey="konstrukcje_budynku"
                  placeholder="Wpisz lub wybierz konstrukcję..."
                />
              </div>

              <div>
                <EditableSelect
                  label="Typ dachu"
                  value={offer.budynek.typ_dachu || 'kopertowy'}
                  onChange={(val) => updateField('budynek', 'typ_dachu', val)}
                  options={constantLists.typy_dachow || []}
                  categoryKey="typy_dachow"
                  placeholder="Wpisz lub wybierz typ dachu..."
                />
              </div>

              <div className="col-span-2 border-t border-slate-200/80 pt-3 mt-1">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Odporność ogniowa ścian (REI)</h5>
              </div>

              <div>
                <EditableSelect
                  label="Klasa ścian REI"
                  value={offer.budynek.sciany_rei_klasa || 'REI 120'}
                  onChange={(val) => updateField('budynek', 'sciany_rei_klasa', val)}
                  options={constantLists.sciany_rei_klasa_opcje || []}
                  categoryKey="sciany_rei_klasa_opcje"
                  placeholder="np. REI 120"
                />
              </div>

              <div>
                <EditableSelect
                  label="Ilość ścian"
                  value={offer.budynek.sciany_rei120_ilosc || '0'}
                  onChange={(val) => updateField('budynek', 'sciany_rei120_ilosc', val)}
                  options={constantLists.sciany_rei120_opcje || []}
                  categoryKey="sciany_rei120_opcje"
                  placeholder="Wpisz lub wybierz..."
                />
              </div>

              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 mt-0.5 block italic">
                  * Wpisz "0" lub "brak" w ilości, aby ukryć informację o ścianach REI w ofercie.
                </span>
              </div>

              <div className="col-span-2 pt-3 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                    <input 
                      type="checkbox"
                      checked={offer.budynek.dach_rei120 || false}
                      onChange={(e) => updateField('budynek', 'dach_rei120', e.target.checked)}
                      className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">Dach o odporności ogniowej</span>
                      <span className="text-[10.5px] text-slate-400">Zaznacz, jeśli dach stacji musi posiadać odporność ogniową</span>
                    </div>
                  </label>

                  {offer.budynek.dach_rei120 && (
                    <div className="w-full sm:w-48 animate-fade-in">
                      <EditableSelect
                        label="Klasa dachu REI"
                        value={offer.budynek.dach_rei_klasa || 'REI 120'}
                        onChange={(val) => updateField('budynek', 'dach_rei_klasa', val)}
                        options={constantLists.dach_rei_klasa_opcje || []}
                        categoryKey="dach_rei_klasa_opcje"
                        placeholder="np. REI 120"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border-2 border-slate-200/85 shadow-sm">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Cable className="w-4.5 h-4.5 text-enco-blue" />
                  Ilość i typ przepustów kablowych
                </h4>
              </div>
              
              <div className="space-y-4">
                {/* nN block */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm items-end hover:shadow-md transition-shadow">
                  <div className="sm:col-span-3 pb-2 sm:pb-0">
                    <h5 className="text-sm font-extrabold text-enco-blue uppercase tracking-wider flex items-center gap-1.5">
                      Przepusty nN
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Niskie napięcie</p>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Ilość
                    </label>
                    <input 
                      type="text" 
                      value={offer.budynek.przepusty_nn}
                      placeholder="np. 12"
                      onChange={(e) => updateField('budynek', 'przepusty_nn', e.target.value)}
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue transition-all cursor-text shadow-sm placeholder-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <EditableSelect
                      label="Typ przepustu"
                      value={offer.budynek.przepusty_nn_typ || 'BWS 100'}
                      onChange={(val) => updateField('budynek', 'przepusty_nn_typ', val)}
                      options={constantLists.typy_przepustow || []}
                      categoryKey="typy_przepustow"
                      placeholder="np. BWS 100"
                    />
                  </div>
                </div>

                {/* SN block */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm items-end hover:shadow-md transition-shadow">
                  <div className="sm:col-span-3 pb-2 sm:pb-0">
                    <h5 className="text-sm font-extrabold text-enco-blue uppercase tracking-wider flex items-center gap-1.5">
                      Przepusty SN
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Średnie napięcie</p>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Ilość
                    </label>
                    <input 
                      type="text" 
                      value={offer.budynek.przepusty_sn}
                      placeholder="np. 2"
                      onChange={(e) => updateField('budynek', 'przepusty_sn', e.target.value)}
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue transition-all cursor-text shadow-sm placeholder-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <EditableSelect
                      label="Typ przepustu"
                      value={offer.budynek.przepusty_sn_typ || 'BWS 150'}
                      onChange={(val) => updateField('budynek', 'przepusty_sn_typ', val)}
                      options={constantLists.typy_przepustow || []}
                      categoryKey="typy_przepustow"
                      placeholder="np. BWS 150"
                    />
                  </div>
                </div>

                {/* Uziemienie block */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm items-end hover:shadow-md transition-shadow">
                  <div className="sm:col-span-3 pb-2 sm:pb-0">
                    <h5 className="text-sm font-extrabold text-enco-blue uppercase tracking-wider flex items-center gap-1.5">
                      Uziemiające
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Przepusty uziemienia</p>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Ilość
                    </label>
                    <input 
                      type="text" 
                      value={offer.budynek.przepusty_uziemienie}
                      placeholder="np. 3"
                      onChange={(e) => updateField('budynek', 'przepusty_uziemienie', e.target.value)}
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue transition-all cursor-text shadow-sm placeholder-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <EditableSelect
                      label="Typ przepustu"
                      value={offer.budynek.przepusty_uziemienie_typ || 'HEA'}
                      onChange={(val) => updateField('budynek', 'przepusty_uziemienie_typ', val)}
                      options={constantLists.typy_przepustow || []}
                      categoryKey="typy_przepustow"
                      placeholder="np. HEA"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kolorystyka (paleta RAL)</label>
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <EditableSelect
                    label="Obudowa zewnętrzna"
                    value={offer.budynek.kolor_obudowa}
                    onChange={(val) => updateField('budynek', 'kolor_obudowa', val)}
                    options={constantLists.kolory_ral}
                    categoryKey="kolory_ral"
                    placeholder="Wybierz lub wpisz kolor obudowy..."
                  />
                  <EditableSelect
                    label="Ślusarka drzwiowa"
                    value={offer.budynek.kolor_slusarka}
                    onChange={(val) => updateField('budynek', 'kolor_slusarka', val)}
                    options={constantLists.kolory_ral}
                    categoryKey="kolory_ral"
                    placeholder="Wybierz lub wpisz kolor ślusarki..."
                  />
                  <EditableSelect
                    label="Dach stacji"
                    value={offer.budynek.kolor_dach}
                    onChange={(val) => updateField('budynek', 'kolor_dach', val)}
                    options={constantLists.kolory_ral}
                    categoryKey="kolory_ral"
                    placeholder="Wybierz lub wpisz kolor dachu..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opcje AntyGraffiti & Wentylacja</label>
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200 h-full flex flex-col justify-between">
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input 
                      type="checkbox"
                      checked={offer.budynek.powloka_antygraffiti}
                      onChange={(e) => updateField('budynek', 'powloka_antygraffiti', e.target.checked)}
                      className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">Powłoka antygraffiti w standardzie</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Went. Nawiewne</span>
                      <input 
                        type="number" 
                        value={offer.budynek.wentylatory_nawiew}
                        onChange={(e) => updateField('budynek', 'wentylatory_nawiew', e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded px-2 py-0.5 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Went. Wywiewne</span>
                      <input 
                        type="number" 
                        value={offer.budynek.wentylatory_wywiew}
                        onChange={(e) => updateField('budynek', 'wentylatory_wywiew', e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded px-2 py-0.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drzwi i kraty (Opis tekstowy) */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Opis drzwi i krat wentylacyjnych (Parametry ślusarki)
                </label>
                <div className="flex items-center gap-1.5">
                  {offer.budynek.drzwi_typ_ilosc && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmClearField === 'drzwi_typ_ilosc') {
                          setLocalSlusarkaLines([]);
                          updateField('budynek', 'drzwi_typ_ilosc', '');
                          setConfirmClearField(null);
                        } else {
                          setConfirmClearField('drzwi_typ_ilosc');
                        }
                      }}
                      className={confirmClearField === 'drzwi_typ_ilosc'
                        ? "text-red-650 bg-red-50 hover:bg-red-100 text-[10px] font-extrabold py-1 px-2.5 rounded cursor-pointer transition-all flex items-center gap-1 animate-pulse border border-red-250"
                        : "text-red-500 hover:text-red-650 hover:bg-red-50 text-[10px] font-semibold py-1 px-2.5 rounded cursor-pointer transition-all flex items-center gap-1"
                      }
                      title={confirmClearField === 'drzwi_typ_ilosc' ? "Kliknij ponownie aby bezpowrotnie skasować wszystkie wpisy" : "Skasuj wszystkie wpisy"}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>{confirmClearField === 'drzwi_typ_ilosc' ? 'Potwierdź usunięcie ⚠️' : 'Wyczyść wszystko'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => optimizeTextWithAI('budynek', 'drzwi_typ_ilosc', offer.budynek.drzwi_typ_ilosc, 'Opis ślusarki stacji transformatorowej, drzwi stalowe, EI, otwory, szczelność')}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-enco-navy text-[10px] font-semibold py-1 px-2.5 rounded flex items-center gap-1 transition-all cursor-pointer"
                    disabled={enhancingField === 'budynek-drzwi_typ_ilosc'}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    {enhancingField === 'budynek-drzwi_typ_ilosc' ? 'Ulepszanie...' : 'Ulepsz z AI'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-2">
                {localSlusarkaLines.length === 0 ? (
                  <div className="text-center p-4 bg-white border border-dashed border-slate-200 rounded text-slate-400 text-xs italic">
                    Brak zdefiniowanych elementów ślusarki. Kliknij przycisk poniżej, aby dodać nową pozycję.
                  </div>
                ) : (
                  localSlusarkaLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs w-4 text-right select-none">{idx + 1}.</span>
                      <div className="flex-1 max-w-xl">
                        <EditableSelect
                          value={line}
                          placeholder="np. 1 x drzwi jednoskrzydłowe pełne EI 120..."
                          options={constantLists.typy_drzwi || []}
                          categoryKey="typy_drzwi"
                          onChange={(val) => {
                            const newLines = [...localSlusarkaLines];
                            newLines[idx] = val;
                            setLocalSlusarkaLines(newLines);
                            updateField('budynek', 'drzwi_typ_ilosc', newLines.join('\n'));
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newLines = localSlusarkaLines.filter((_, i) => i !== idx);
                          setLocalSlusarkaLines(newLines);
                          updateField('budynek', 'drzwi_typ_ilosc', newLines.join('\n'));
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                        title="Usuń tę pozycję"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newLines = [...localSlusarkaLines, ''];
                  setLocalSlusarkaLines(newLines);
                  updateField('budynek', 'drzwi_typ_ilosc', newLines.join('\n'));
                }}
                className="w-full mt-1.5 py-1.5 bg-white border border-dashed border-slate-300 hover:border-enco-blue hover:bg-enco-blue/5 text-slate-650 hover:text-enco-blue rounded flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Dodaj element ślusarki</span>
              </button>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Użyj słownika powyżej lub dodaj własny element. Zmiany w słowniku są zapisywane automatycznie.</span>
              </div>
            </div>

            {/* Dodatkowe punkty budynku (custom list with dictionary) */}
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200/85 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-enco-blue" />
                    Dodatkowe punkty techniczne budynku
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Zdefiniuj dodatkowe podpunkty wyświetlane na wydruku w opisie budynku.
                  </p>
                </div>
              </div>

              {/* List of currently added points */}
              <div className="space-y-2">
                {(!offer.budynek.dodatkowe_punkty || offer.budynek.dodatkowe_punkty.length === 0) ? (
                  <div className="text-center p-4 bg-white border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs italic">
                    Brak dodatkowych punktów technicznych budynku.
                  </div>
                ) : (
                  (offer.budynek.dodatkowe_punkty || []).map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-slate-400 font-mono text-xs w-5 text-right select-none">{idx + 1}.</span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const updated = [...(offer.budynek.dodatkowe_punkty || [])];
                          updated[idx] = e.target.value;
                          updateField('budynek', 'dodatkowe_punkty', updated);
                        }}
                        className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-enco-blue rounded-md px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-enco-blue/20"
                      />
                      
                      {/* Reordering buttons */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx > 0) {
                            const updated = [...(offer.budynek.dodatkowe_punkty || [])];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            updateField('budynek', 'dodatkowe_punkty', updated);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-enco-blue hover:bg-slate-50 rounded disabled:opacity-30 cursor-pointer"
                        title="Przesuń w górę"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (offer.budynek.dodatkowe_punkty || []).length - 1}
                        onClick={() => {
                          if (idx < (offer.budynek.dodatkowe_punkty || []).length - 1) {
                            const updated = [...(offer.budynek.dodatkowe_punkty || [])];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            updateField('budynek', 'dodatkowe_punkty', updated);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-enco-blue hover:bg-slate-50 rounded disabled:opacity-30 cursor-pointer"
                        title="Przesuń w dół"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = (offer.budynek.dodatkowe_punkty || []).filter((_, i) => i !== idx);
                          updateField('budynek', 'dodatkowe_punkty', updated);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Usuń pozycję"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form to add a new point */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Wybierz ze słownika lub wpisz nowy punkt:
                  </label>
                  
                  {/* Select from existing dictionary options */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setNewBuildingPoint(e.target.value);
                      }
                    }}
                    value=""
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-enco-blue cursor-pointer font-semibold shadow-xs"
                  >
                    <option value="">-- Wybierz gotowy szablon ze słownika --</option>
                    {(constantLists.dodatkowe_punkty_budynku || []).map((preset, pIdx) => (
                      <option key={pIdx} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>

                  {/* Text input to edit/type the point */}
                  <input
                    type="text"
                    value={newBuildingPoint}
                    onChange={(e) => setNewBuildingPoint(e.target.value)}
                    placeholder="Wpisz treść podpunktu..."
                    className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={savePointToSlo}
                      onChange={(e) => setSavePointToSlo(e.target.checked)}
                      className="rounded text-enco-blue focus:ring-enco-blue w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 font-semibold">Zapisz ten punkt na stałe do słownika budynku</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (newBuildingPoint.trim()) {
                        const trimmed = newBuildingPoint.trim();
                        const currentPoints = offer.budynek.dodatkowe_punkty || [];
                        
                        // Add to current offer points
                        updateField('budynek', 'dodatkowe_punkty', [...currentPoints, trimmed]);
                        
                        // Save to dictionary if checked
                        if (savePointToSlo) {
                          const allLists = getConstantLists();
                          if (!allLists.dodatkowe_punkty_budynku.includes(trimmed)) {
                            allLists.dodatkowe_punkty_budynku = [...allLists.dodatkowe_punkty_budynku, trimmed];
                            saveConstantLists(allLists);
                            window.dispatchEvent(new Event('enco-constants-updated'));
                          }
                        }
                        
                        // Clear input
                        setNewBuildingPoint('');
                        setSavePointToSlo(false);
                      }
                    }}
                    className="py-2 px-4 bg-enco-blue hover:bg-enco-blue/90 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Dodaj do stacji</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ROZDZIELNICA SN */}
        {activeStep === 2 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-heading font-semibold text-enco-blue border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-enco-blue" />
              Rozdzielnica Średniego Napięcia (SN)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-150">
              <div className="col-span-1 md:col-span-2 space-y-3">
                <div>
                  <EditableSelect
                    label="Typ / Model rozdzielnicy SN"
                    value={offer.rozdzielnica_sn.typ || ''}
                    onChange={(val) => {
                      let customOpis = offer.rozdzielnica_sn.typ_custom_opis || '';
                      let parametry = offer.rozdzielnica_sn.parametry || '';
                      
                      if (val === 'Siemens') {
                        customOpis = 'Siemens 8DJH 24 blue-GIS (bez gazu SF6), układ R-R-R-T, 24 kV, 630 A, 16 kA/1s';
                        parametry = 'Siemens 8DJH w układzie IIIQ - 24kV, 630A, 20kA/1s';
                      } else if (val === 'Xiria') {
                        customOpis = 'Xiria 24kV, 630A, 16kA/1s';
                        parametry = 'Eaton Xiria blok kompaktowy - 24kV, 630A, 16kA/1s';
                      } else if (val === 'AirSet') {
                        customOpis = 'AirSeT 24kV, 630A, 16kA/1s (bez SF6)';
                        parametry = 'Schneider Electric RM AirSet w układzie IIQ - 24kV, 630A, 20kA/1s';
                      }
                      
                      updateFields('rozdzielnica_sn', {
                        typ: val,
                        typ_custom_opis: customOpis,
                        parametry: parametry
                      });
                    }}
                    options={constantLists.typy_rozdzielnic_sn || []}
                    categoryKey="typy_rozdzielnic_sn"
                    placeholder="Wybierz lub wpisz model rozdzielnicy SN..."
                  />
                </div>
                <div>
                  <EditableSelect
                    label="Szczegółowy model i opis w nagłówku SN"
                    value={offer.rozdzielnica_sn.typ_custom_opis || ''}
                    onChange={(val) => updateField('rozdzielnica_sn', 'typ_custom_opis', val)}
                    options={constantLists.szczegolowe_opisy_sn || []}
                    categoryKey="szczegolowe_opisy_sn"
                    placeholder="Wpisz lub wybierz szczegółowy opis rozdzielnicy SN..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Izolacja</label>
                <select
                  value={
                    ['powietrzna', 'blue-GIS (bez gazu SF6)', 'gazowa SF6'].includes(offer.rozdzielnica_sn.izolacja)
                      ? offer.rozdzielnica_sn.izolacja
                      : 'Inna'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Inna') {
                      updateField('rozdzielnica_sn', 'izolacja', '');
                    } else {
                      updateField('rozdzielnica_sn', 'izolacja', val);
                    }
                  }}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-enco-blue font-semibold"
                >
                  <option value="powietrzna">powietrzna</option>
                  <option value="blue-GIS (bez gazu SF6)">blue-GIS (bez gazu SF6)</option>
                  <option value="gazowa SF6">gazowa SF6</option>
                  <option value="Inna">Inna / Własna (Wpisz...)</option>
                </select>
                {!['powietrzna', 'blue-GIS (bez gazu SF6)', 'gazowa SF6'].includes(offer.rozdzielnica_sn.izolacja) && (
                  <input
                    type="text"
                    value={offer.rozdzielnica_sn.izolacja || ''}
                    placeholder="Wpisz rodzaj izolacji..."
                    onChange={(e) => updateField('rozdzielnica_sn', 'izolacja', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800 mt-1.5 focus:outline-none focus:border-enco-blue font-medium"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Całkowita ilość pól (np. 4-polowa)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={offer.rozdzielnica_sn.ilosc_pol}
                    placeholder="np. 4-polowa"
                    onChange={(e) => updateField('rozdzielnica_sn', 'ilosc_pol', e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const total = (offer.rozdzielnica_sn.pola || []).reduce((acc, p) => acc + (parseInt(p.ilosc) || 0), 0);
                      updateField('rozdzielnica_sn', 'ilosc_pol', `${total}-polowa`);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 rounded border border-slate-250 font-semibold transition-all cursor-pointer"
                    title="Oblicz sumę pól z tabeli poniżej"
                  >
                    Przelicz z układu
                  </button>
                </div>
              </div>

              <div>
                <EditableSelect
                  label="Napięcie znamionowe / Parametry ogólne"
                  value={offer.rozdzielnica_sn.parametry || ''}
                  onChange={(val) => updateField('rozdzielnica_sn', 'parametry', val)}
                  options={constantLists.parametry_rozdzielnic_sn || []}
                  categoryKey="parametry_rozdzielnic_sn"
                  placeholder="Wybierz lub wpisz parametry rozdzielnicy SN..."
                />
              </div>
            </div>

            {/* WYPOSAŻENIE ROZDZIELNICY SN (DYNAMIC LIST OF FIELDS) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-enco-navy uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#004a99]" />
                    Układ i opis pól rozdzielnicy SN
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                    Dodawaj, usuwaj, zmieniaj kolejność oraz edytuj parametry poszczególnych pól (aparaty, prądy, wyposażenie).
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const currentPola = offer.rozdzielnica_sn.pola || [];
                      const newPole = {
                        id: 'sn-pole-' + Math.random().toString(36).substring(2, 9),
                        nazwa: 'Pole liniowe',
                        ilosc: '1',
                        wyposazenie: 'rozłącznik z uziemnikiem, napęd silnikowy 24 V DC, wskaźnik obecności napięcia, styki pomocnicze'
                      };
                      updateField('rozdzielnica_sn', 'pola', [...currentPola, newPole]);
                    }}
                    className="bg-[#004a99] hover:bg-[#003c80] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dodaj pole SN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Czy na pewno chcesz przywrócić domyślny układ SN R-R-R-T? Nadpisze to obecną konfigurację.")) {
                        updateField('rozdzielnica_sn', 'pola', DEFAULT_POLA_SN);
                      }
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[11px] font-semibold py-1.5 px-2.5 rounded border border-slate-250 transition-all cursor-pointer flex items-center gap-1"
                    title="Przywróć standardowy układ R-R-R-T"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Przywróć domyślne</span>
                  </button>
                </div>
              </div>

              {(offer.rozdzielnica_sn.pola || []).length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                  Brak pól. Kliknij „Dodaj pole SN” lub „Przywróć domyślne”.
                </div>
              ) : (
                <div className="space-y-5">
                  {(offer.rozdzielnica_sn.pola || []).map((pole, index) => (
                    <div key={pole.id || index} className="bg-white p-5 md:p-6 rounded-xl border-2 border-slate-200 shadow-sm flex flex-col gap-5 transition-all hover:border-[#004a99]/40 hover:shadow-md relative">
                      
                      {/* Control buttons & numbers in top-right */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-1">
                        <span className="text-xs md:text-sm font-bold text-[#004a99] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-[#004a99] animate-pulse"></span>
                          Pole #{index + 1}: <strong className="font-extrabold text-zinc-900">{pole.nazwa || 'Bez nazwy'}</strong> {pole.ilosc ? `(${pole.ilosc} szt.)` : ''}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const list = [...(offer.rozdzielnica_sn.pola || [])];
                              const temp = list[index];
                              list[index] = list[index - 1];
                              list[index - 1] = temp;
                              updateField('rozdzielnica_sn', 'pola', list);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Przesuń w górę"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
 
                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={index === (offer.rozdzielnica_sn.pola || []).length - 1}
                            onClick={() => {
                              const list = [...(offer.rozdzielnica_sn.pola || [])];
                              const temp = list[index];
                              list[index] = list[index + 1];
                              list[index + 1] = temp;
                              updateField('rozdzielnica_sn', 'pola', list);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Przesuń w dół"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
 
                          {/* Delete Field */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (offer.rozdzielnica_sn.pola || []).filter((_, i) => i !== index);
                              updateField('rozdzielnica_sn', 'pola', updated);
                            }}
                            className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 ml-1 cursor-pointer transition-colors"
                            title="Usuń to pole"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
 
                      {/* Inputs grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Name of field */}
                        <div className="md:col-span-4">
                          <EditableSelect
                            label="Nazwa pola"
                            value={pole.nazwa || ''}
                            onChange={(val) => {
                              const updated = (offer.rozdzielnica_sn.pola || []).map((p, i) => 
                                i === index ? { ...p, nazwa: val } : p
                              );
                              updateField('rozdzielnica_sn', 'pola', updated);
                            }}
                            options={constantLists.nazwy_pol_sn || []}
                            categoryKey="nazwy_pol_sn"
                            placeholder="np. Pole liniowe..."
                          />
                        </div>
 
                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ilość</label>
                          <input
                            type="text"
                            value={pole.ilosc || ''}
                            placeholder="np. 3 lub 1 szt."
                            onChange={(e) => {
                              const updated = (offer.rozdzielnica_sn.pola || []).map((p, i) => 
                                i === index ? { ...p, ilosc: e.target.value } : p
                              );
                              updateField('rozdzielnica_sn', 'pola', updated);
                            }}
                            className="w-full bg-slate-50/50 focus:bg-white border border-slate-250 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none font-semibold transition-all focus:border-[#004a99]"
                          />
                        </div>
 
                        {/* Equipment Parameters */}
                        <div className="md:col-span-6">
                          <EditableSelect
                            label="Wyposażenie pola (aparaty, akcesoria)"
                            value={pole.wyposazenie || ''}
                            onChange={(val) => {
                              const updated = (offer.rozdzielnica_sn.pola || []).map((p, i) => 
                                i === index ? { ...p, wyposazenie: val } : p
                              );
                              updateField('rozdzielnica_sn', 'pola', updated);
                            }}
                            options={constantLists.wyposazenie_pol_sn || []}
                            categoryKey="wyposazenie_pol_sn"
                            isTextarea={true}
                            rows={3}
                            placeholder="np. rozłącznik z uziemnikiem, napęd silnikowy 24 V DC..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DODATKOWE ELEMENTY WYPOSAŻENIA SN */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Dodatkowe elementy wyposażenia SN</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Np. uzgadniacz faz, czujnik ciśnienia gazu ze stykiem, itp.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentExtra = offer.rozdzielnica_sn.dodatkowe_wyposazenie || [];
                    updateField('rozdzielnica_sn', 'dodatkowe_wyposazenie', [...currentExtra, '']);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold py-1.5 px-3 rounded flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj pozycję</span>
                </button>
              </div>

              {(offer.rozdzielnica_sn.dodatkowe_wyposazenie || []).length === 0 ? (
                <div className="text-center py-4 bg-white rounded border border-dashed border-slate-200 text-xs text-slate-400">
                  Brak dodatkowego wyposażenia.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(offer.rozdzielnica_sn.dodatkowe_wyposazenie || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-1.5 rounded border border-slate-200 shadow-xs">
                      <input
                        type="text"
                        value={item}
                        placeholder="Wpisz np. czujnik ciśnienia gazu ze stykiem"
                        onChange={(e) => {
                          const currentExtra = [...(offer.rozdzielnica_sn.dodatkowe_wyposazenie || [])];
                          currentExtra[idx] = e.target.value;
                          updateField('rozdzielnica_sn', 'dodatkowe_wyposazenie', currentExtra);
                        }}
                        className="flex-1 bg-white border border-slate-200 focus:border-enco-blue rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentExtra = (offer.rozdzielnica_sn.dodatkowe_wyposazenie || []).filter((_, i) => i !== idx);
                          updateField('rozdzielnica_sn', 'dodatkowe_wyposazenie', currentExtra);
                        }}
                        className="text-red-500 hover:text-red-650 hover:bg-red-50 p-1 rounded cursor-pointer"
                        title="Usuń"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: ROZDZIELNICA NN */}
        {activeStep === 3 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-heading font-semibold text-enco-blue border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-enco-blue" />
              Rozdzielnica Niskiego Napięcia (nN)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ilość odpływów/pól</label>
                <input 
                  type="text" 
                  value={offer.rozdzielnica_nn.ilosc_pol}
                  placeholder="np. RTS-z 12-polowa"
                  onChange={(e) => updateField('rozdzielnica_nn', 'ilosc_pol', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Rozłącznik zasilający</label>
                <select 
                  value={offer.rozdzielnica_nn.rozlacznik_zasilajacy}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updateField('rozdzielnica_nn', 'rozlacznik_zasilajacy', val);
                    if (val === '1250A') {
                      updateField('rozdzielnica_nn', 'rozlacznik_niestandardowy_opis', 'SIRCO 1250A');
                    } else if (val === '1600A') {
                      updateField('rozdzielnica_nn', 'rozlacznik_niestandardowy_opis', 'SIRCO 1600A');
                    }
                  }}
                  className="w-full bg-white border border-zinc-300 rounded px-3 py-1.5 text-sm text-zinc-805 focus:outline-none focus:border-enco-blue"
                >
                  <option value="1250A">1250A (SIRCO)</option>
                  <option value="1600A">1600A (SIRCO)</option>
                  <option value="Inny">Inna wartość (Wpisz obok)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Dokładna marka i amperaż (Opis)</label>
                <input 
                  type="text" 
                  value={offer.rozdzielnica_nn.rozlacznik_niestandardowy_opis}
                  placeholder="np. SIRCO 1250A"
                  onChange={(e) => updateField('rozdzielnica_nn', 'rozlacznik_niestandardowy_opis', e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded px-3 py-1.5 text-sm text-zinc-805 focus:outline-none focus:border-enco-blue"
                />
              </div>
            </div>

            {/* WYPOSAŻENIE ROZDZIELNICY nN (DYNAMIC LIST OF FIELDS) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-enco-navy uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#004a99]" />
                    Wyposażenie pól i odpływów rozdzielnicy nN
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                    Każde pole/odpływ w module nN jest w pełni edytowalne. Możesz dodawać nowe, zmieniać nazwy, parametry, ilości lub usuwać pozycje.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const currentPola = offer.rozdzielnica_nn.pola || [];
                      const newPole = {
                        id: 'nn-pole-' + Math.random().toString(36).substring(2, 9),
                        nazwa: '',
                        parametry: '',
                        ilosc: '1'
                      };
                      updateField('rozdzielnica_nn', 'pola', [...currentPola, newPole]);
                    }}
                    className="bg-[#004a99] hover:bg-[#003c80] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dodaj pole</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Czy na pewno chcesz przywrócić domyślne wyposażenie rozdzielnicy nN? Nadpisze to obecną konfigurację.")) {
                        updateField('rozdzielnica_nn', 'pola', DEFAULT_POLA_NN);
                      }
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[11px] font-semibold py-1.5 px-2.5 rounded border border-slate-250 transition-all cursor-pointer"
                    title="Przywróć standardowe wyposażenie ENCO"
                  >
                    Przywróć domyślne
                  </button>
                </div>
              </div>

              {(offer.rozdzielnica_nn.pola || []).length === 0 ? (
                <div className="text-center py-6 bg-white rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                  Brak zdefiniowanych pól. Kliknij „Dodaj pole” lub „Przywróć domyślne”.
                </div>
              ) : (
                <div className="space-y-3">
                  {(offer.rozdzielnica_nn.pola || []).map((pole, index) => (
                    <div key={pole.id || index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-4 transition-all hover:shadow-sm border-l-4 border-l-enco-blue">
                      
                      {/* Row 1: Name of the field, Quantity, and Delete Action */}
                      <div className="flex flex-col md:flex-row gap-3 items-end w-full">
                        {/* Name of the field */}
                        <div className="flex-1 w-full min-w-0">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Nazwa pola / pozycji
                          </label>
                          <input
                            type="text"
                            value={pole.nazwa}
                            placeholder="np. Pole zasilające, Odpływ"
                            onChange={(e) => {
                              const updatedPola = (offer.rozdzielnica_nn.pola || []).map((p, i) => 
                                (p.id === pole.id || (!pole.id && i === index)) ? { ...p, nazwa: e.target.value } : p
                              );
                              updateField('rozdzielnica_nn', 'pola', updatedPola);
                            }}
                            className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-enco-blue rounded px-3 py-2 text-xs text-slate-800 focus:outline-none font-bold transition-all"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="w-full md:w-32 shrink-0">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Ilość
                          </label>
                          <input
                            type="text"
                            value={pole.ilosc}
                            placeholder="np. 1, 10, 1 kpl."
                            onChange={(e) => {
                              const updatedPola = (offer.rozdzielnica_nn.pola || []).map((p, i) => 
                                (p.id === pole.id || (!pole.id && i === index)) ? { ...p, ilosc: e.target.value } : p
                              );
                              updateField('rozdzielnica_nn', 'pola', updatedPola);
                            }}
                            className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-enco-blue rounded px-3 py-2 text-xs text-slate-800 text-center focus:outline-none font-semibold transition-all"
                          />
                        </div>

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedPola = (offer.rozdzielnica_nn.pola || []).filter((p, i) => 
                              p.id ? p.id !== pole.id : i !== index
                            );
                            updateField('rozdzielnica_nn', 'pola', updatedPola);
                          }}
                          className="text-red-500 hover:text-red-650 hover:bg-red-50 p-2 rounded cursor-pointer transition-all shrink-0 border border-transparent hover:border-red-100 flex items-center justify-center self-end h-9 w-9 md:w-auto md:px-3 gap-1.5"
                          title="Usuń to pole"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                          <span className="md:hidden text-xs font-bold">Usuń pole</span>
                        </button>
                      </div>

                      {/* Row 2: Equipment parameters (moved below and enlarged!) */}
                      <div className="w-full min-w-0 pt-2 border-t border-slate-100">
                        <label className="block text-[10px] font-extrabold text-enco-blue uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 bg-enco-blue rounded-full"></span>
                          Wyposażenie / Parametry aparatu nN
                        </label>
                        <EditableSelect
                          value={pole.parametry}
                          placeholder="Wybierz aparat..."
                          options={constantLists.typy_aparatow_nn || []}
                          categoryKey="typy_aparatow_nn"
                          onChange={(val) => {
                            const updatedPola = (offer.rozdzielnica_nn.pola || []).map((p, i) => 
                              (p.id === pole.id || (!pole.id && i === index)) ? { ...p, parametry: val } : p
                            );
                            updateField('rozdzielnica_nn', 'pola', updatedPola);
                          }}
                        />
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TABLICA LICZNIKOWA CUSTOMIZATION */}
            {!offer.pomin_tablice_licznikowa && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 space-y-3">
                <h4 className="text-xs font-bold text-enco-navy uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-enco-blue" />
                  3. Tablica Licznikowa — Edycja i Dostosowanie Treści
                </h4>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Tytuł Sekcji</label>
                  <input 
                    type="text" 
                    value={offer.tablica_licznikowa_tytul !== undefined ? offer.tablica_licznikowa_tytul : 'TABLICA LICZNIKOWA'}
                    onChange={(e) => updateField(null, 'tablica_licznikowa_tytul', e.target.value)}
                    placeholder="TABLICA LICZNIKOWA"
                    className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-sm font-bold text-slate-800 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Opis / Treść Sekcji</label>
                  <textarea 
                    rows={4}
                    value={offer.tablica_licznikowa_tekst !== undefined ? offer.tablica_licznikowa_tekst : 'Zintegrowana tablica licznikowa uchylna z listwą kontrolno-pomiarową (SKa), przygotowana fabrycznie pod montaż układów pomiarowych ZE (licznika energii elektrycznej, modemu GSM i zewnętrznej anteny). Usytuowana w bezpieczny i uzgodniony sposób.'}
                    onChange={(e) => updateField(null, 'tablica_licznikowa_tekst', e.target.value)}
                    placeholder="Wpisz wolny tekst opisu tablicy licznikowej..."
                    className="w-full bg-white border border-slate-250 rounded p-2.5 text-sm text-slate-800 focus:outline-none focus:border-enco-blue leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: KABLE, TELEMECHANIKA I POŁĄCZENIA */}
        {activeStep === 4 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-heading font-semibold text-enco-blue border-b border-slate-200 pb-2 flex items-center gap-2">
              <Cable className="w-5 h-5 text-enco-blue" />
              Telemechanika & Połączenia kablowe
            </h3>

            {/* Telemechanika toggle */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-enco-navy">
                  <input 
                    type="checkbox"
                    checked={offer.telemechanika.wlaczone}
                    onChange={(e) => updateField('telemechanika', 'wlaczone', e.target.checked)}
                    className="rounded text-enco-blue w-4 h-4 cursor-pointer"
                  />
                  <span>Zawiera moduł telemechaniki</span>
                </label>
              </div>

              {offer.telemechanika.wlaczone && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-205">
                  <div>
                    <EditableSelect
                      label="Typ sterownika RTU"
                      value={offer.telemechanika.sterownik}
                      onChange={(val) => updateField('telemechanika', 'sterownik', val)}
                      options={constantLists.typy_telemechaniki}
                      categoryKey="typy_telemechaniki"
                      placeholder="Wybierz lub wpisz sterownik RTU..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-0.5">Dodatkowe sensory</label>
                    <input 
                      type="text" 
                      value={offer.telemechanika.sensory}
                      placeholder="np. sensory prądowe i napięciowe"
                      onChange={(e) => updateField('telemechanika', 'sensory', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded px-3 py-1 text-sm text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Połączenia kablowe */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Most kablowy SN (Transformatorem &lt;-&gt; SN)
                  </span>
                  <button
                    onClick={() => optimizeTextWithAI('polaczenia_kablowe', 'most_sn', offer.polaczenia_kablowe.most_sn, 'Parametry kabla SN, 3xYHAKXS 70 lub 120mm2, giętki most kablowy ze stykami')}
                    className="bg-zinc-150 hover:bg-zinc-200 text-enco-navy text-[10px] font-semibold py-1 px-2.5 rounded flex items-center gap-1 transition-all cursor-pointer"
                    disabled={enhancingField === 'polaczenia_kablowe-most_sn'}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    {enhancingField === 'polaczenia_kablowe-most_sn' ? 'Ulepszanie...' : 'Ulepsz z AI'}
                  </button>
                </div>
                <EditableSelect
                  value={offer.polaczenia_kablowe.most_sn}
                  onChange={(val) => updateField('polaczenia_kablowe', 'most_sn', val)}
                  options={constantLists.typy_polaczen_kablowych}
                  categoryKey="typy_polaczen_kablowych"
                  placeholder="Wybierz lub wpisz most kablowy SN..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Most kablowy nN (Transformatorem &lt;-&gt; nN)
                  </span>
                  <button
                    onClick={() => optimizeTextWithAI('polaczenia_kablowe', 'most_nn', offer.polaczenia_kablowe.most_nn, 'Most kablowy niskiego napięcia nN, kabel 4x2xYKXS 240mm2')}
                    className="bg-zinc-150 hover:bg-zinc-200 text-enco-navy text-[10px] font-semibold py-1 px-2.5 rounded flex items-center gap-1 transition-all cursor-pointer"
                    disabled={enhancingField === 'polaczenia_kablowe-most_nn'}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    {enhancingField === 'polaczenia_kablowe-most_nn' ? 'Ulepszanie...' : 'Ulepsz z AI'}
                  </button>
                </div>
                <EditableSelect
                  value={offer.polaczenia_kablowe.most_nn}
                  onChange={(val) => updateField('polaczenia_kablowe', 'most_nn', val)}
                  options={constantLists.typy_polaczen_kablowych}
                  categoryKey="typy_polaczen_kablowych"
                  placeholder="Wybierz lub wpisz most kablowy nN..."
                />
              </div>

              {/* Inne instalacje i połączenia */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Inne instalacje i połączenia (Dodatki kablowe, uziemienie)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {offer.polaczenia_kablowe.inne && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmClearField === 'cable_inne') {
                            setLocalInneLines([]);
                            updateField('polaczenia_kablowe', 'inne', '');
                            setConfirmClearField(null);
                          } else {
                            setConfirmClearField('cable_inne');
                          }
                        }}
                        className={confirmClearField === 'cable_inne'
                          ? "text-red-650 bg-red-50 hover:bg-red-100 text-[10px] font-extrabold py-1 px-2.5 rounded cursor-pointer transition-all flex items-center gap-1 animate-pulse border border-red-250"
                          : "text-red-500 hover:text-red-650 hover:bg-red-50 text-[10px] font-semibold py-1 px-2.5 rounded cursor-pointer transition-all flex items-center gap-1"
                        }
                        title={confirmClearField === 'cable_inne' ? "Kliknij ponownie aby bezpowrotnie skasować wszystkie wpisy" : "Skasuj wszystkie wpisy"}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>{confirmClearField === 'cable_inne' ? 'Potwierdź usunięcie ⚠️' : 'Wyczyść wszystko'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => optimizeTextWithAI('polaczenia_kablowe', 'inne', offer.polaczenia_kablowe.inne, 'Instalacje oświetleniowe stacji, uziemienia własne, zewnętrzny maszt antenowy')}
                      className="bg-zinc-150 hover:bg-zinc-200 text-enco-navy text-[10px] font-semibold py-1 px-2.5 rounded flex items-center gap-1 transition-all cursor-pointer"
                      disabled={enhancingField === 'polaczenia_kablowe-inne'}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                      {enhancingField === 'polaczenia_kablowe-inne' ? 'Ulepszanie...' : 'Ulepsz z AI'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-2">
                  {localInneLines.length === 0 ? (
                    <div className="text-center p-4 bg-zinc-50 border border-dashed border-zinc-250 rounded text-zinc-400 text-xs italic">
                      Brak dodatkowych instalacji i połączeń. Kliknij przycisk poniżej, aby dodać pozycję.
                    </div>
                  ) : (
                    localInneLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-zinc-400 font-mono text-xs w-4 text-right select-none">{idx + 1}.</span>
                        <input 
                          type="text"
                          value={line}
                          placeholder="np. Zasilanie potrzeb własnych stacji, uziemienie szafy RTU..."
                          onChange={(e) => {
                            const newLines = [...localInneLines];
                            newLines[idx] = e.target.value;
                            setLocalInneLines(newLines);
                            updateField('polaczenia_kablowe', 'inne', newLines.join('\n'));
                          }}
                          className="flex-1 bg-white border border-zinc-300 rounded px-3 py-1.5 text-sm text-zinc-850 placeholder-zinc-400 focus:outline-none focus:border-enco-blue font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newLines = localInneLines.filter((_, i) => i !== idx);
                            setLocalInneLines(newLines);
                            updateField('polaczenia_kablowe', 'inne', newLines.join('\n'));
                          }}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                          title="Usuń to pole"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newLines = [...localInneLines, ''];
                    setLocalInneLines(newLines);
                    updateField('polaczenia_kablowe', 'inne', newLines.join('\n'));
                  }}
                  className="w-full mt-1.5 py-1.5 bg-white border border-dashed border-zinc-300 hover:border-enco-blue hover:bg-enco-blue/5 text-zinc-650 hover:text-enco-blue rounded flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 text-zinc-500" />
                  <span>Dodaj dodatkowe pole / pozycję</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DODATKI, WYŁĄCZENIA I CENY */}
        {activeStep === 5 && (
          <div className="space-y-4 max-w-2xl">
            
            {/* CENA KOŃCOWA */}
            <h3 className="text-lg font-heading font-semibold text-enco-blue border-b border-slate-200 pb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-enco-blue" />
              Cena i Warunki Finansowe
            </h3>

            <div className="grid grid-cols-3 gap-3 bg-[#004a99]/5 p-4 rounded-lg border border-[#004a99]/15">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cena netto (PLN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-slate-450 text-sm font-semibold">zł</span>
                  <input 
                    type="text" 
                    value={offer.cena.cena_netto}
                    onChange={(e) => handleNettoChange(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded pl-8 pr-3 py-1 font-semibold text-base text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">VAT</label>
                <input 
                  type="text" 
                  value="23 %"
                  disabled
                  className="w-full bg-slate-100 border border-slate-250 rounded px-3 py-1 text-sm font-medium text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cena brutto (PLN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-slate-450 text-sm font-semibold">zł</span>
                  <input 
                    type="text" 
                    value={offer.cena.cena_brutto}
                    onChange={(e) => updateField('cena', 'cena_brutto', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded pl-8 pr-3 py-1 font-semibold text-base text-slate-800 focus:outline-none focus:border-enco-blue"
                  />
                </div>
              </div>

              <div className="col-span-3 pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nazwa / Etykieta ceny tej pozycji (netto)
                  </label>
                  <EditableSelect
                    value={offer.cena.etykieta_ceny || ''}
                    onChange={(val) => updateField('cena', 'etykieta_ceny', val)}
                    options={constantLists.etykiety_ceny_pozycji || [
                      "Cena pozycji netto:",
                      "Cena stacji transformatorowej netto:",
                      "Cena jednostkowa netto dla pozycji:",
                      "Cena stacji bez transformatora netto:",
                      "Cena zespołu urządzeń netto:",
                      "Cena kompletnej stacji netto:"
                    ]}
                    categoryKey="etykiety_ceny_pozycji"
                    placeholder="np. Cena pozycji netto: lub własny tytuł..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Opis / dopisek do ceny tej pozycji
                  </label>
                  <EditableSelect
                    value={offer.cena.opis_ceny || ''}
                    onChange={(val) => updateField('cena', 'opis_ceny', val)}
                    options={constantLists.opisy_ceny_pozycji || [
                      "(bez transformatora)",
                      "(bez transportu i montażu)",
                      "(kompletne wyposażenie z transportem)",
                      "(cena netto loco plac budowy)",
                      "(z rozładunkiem i posadowieniem)"
                    ]}
                    categoryKey="opisy_ceny_pozycji"
                    placeholder="np. (bez transformatora) lub własny opis..."
                  />
                </div>
              </div>

              <div className="col-span-3 border-t border-slate-200/80 pt-2.5 mt-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Etykieta ŁĄCZNEJ wartości całej oferty (podsumowanie końcowe)
                </label>
                <input 
                  type="text" 
                  value={offer.cena_netto_etykieta !== undefined ? offer.cena_netto_etykieta : ''}
                  onChange={(e) => updateField(null, 'cena_netto_etykieta', e.target.value)}
                  placeholder="np. ŁĄCZNA WARTOŚĆ OFERTY NETTO: (pozostaw puste dla domyślnego)"
                  className="w-full bg-white border border-slate-250 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-enco-blue"
                />
              </div>
            </div>

            {/* Szybkie parametry warunków handlowych */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Termin Dostawy</label>
                <input 
                  type="text" 
                  value={offer.termin_dostawy}
                  onChange={(e) => updateField(null, 'termin_dostawy', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Warunki Dostawy</label>
                <input 
                  type="text" 
                  value={offer.warunki_dostawy}
                  onChange={(e) => updateField(null, 'warunki_dostawy', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Warunki płatności</label>
                <input 
                  type="text" 
                  value={offer.warunki_platnosci}
                  onChange={(e) => updateField(null, 'warunki_platnosci', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Ważność oferty</label>
                <input 
                  type="text" 
                  value={offer.waznosc_oferty}
                  onChange={(e) => updateField(null, 'waznosc_oferty', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600">Osoba zatwierdzająca (Podpis)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    value={offer.osoba_zatwierdzajaca}
                    placeholder="Wprowadził zatwierdzającego"
                    onChange={(e) => updateField(null, 'osoba_zatwierdzajaca', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                  />
                  <input 
                    type="text" 
                    value={offer.osoba_zatwierdzajaca_telefon}
                    placeholder="Telefon"
                    onChange={(e) => updateField(null, 'osoba_zatwierdzajaca_telefon', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                  />
                  <input 
                    type="text" 
                    value={offer.osoba_zatwierdzajaca_email}
                    placeholder="Email"
                    onChange={(e) => updateField(null, 'osoba_zatwierdzajaca_email', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* LISTA CHECKBOXÓW : ELEMENTY DODATKOWE */}
            <div className="space-y-2 border-t border-slate-150 pt-4">
              <h4 className="text-sm font-semibold text-slate-800">1. Dodatkowe elementy objęte ofertą:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {(constantLists.dodatkowe_elementy || LIST_ELEMENTY_DODATKOWE_STACJA).map((item, idx) => {
                  const isChecked = offer.dodatkowe_elementy.selected.includes(item);
                  return (
                    <div key={idx} className="group/item flex items-center justify-between gap-1 hover:bg-zinc-100/60 px-1.5 py-0.5 rounded transition-all duration-150 border border-transparent hover:border-slate-200">
                      <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0 py-1">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckbox('dodatkowe_elementy', item)}
                          className="rounded text-enco-blue mt-0.5 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <span className="text-xs text-slate-700 break-words leading-tight">{item}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem('dodatkowe_elementy', item)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-450 hover:text-red-500 rounded cursor-pointer transition-all hover:bg-red-50 shrink-0"
                        title="Usuń tę pozycję z bazy opcji"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Dodawanie własnego pola */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
                <input
                  type="text"
                  placeholder="Wpisz własny element dodatkowy (np. Odbiory UDT, nadzór...) i kliknij Dodaj"
                  className="flex-1 bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004a99]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        handleAddCustomItem('dodatkowe_elementy', val);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const inputEl = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const val = inputEl.value.trim();
                    if (val) {
                      handleAddCustomItem('dodatkowe_elementy', val);
                      inputEl.value = '';
                    }
                  }}
                  className="bg-[#004a99] hover:bg-[#003c80] text-white font-semibold px-3 py-1 rounded text-xs cursor-pointer flex items-center gap-1 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mt-1 mb-0.5">Ręczne uzupełnienie elementów objętych (Opcjonalnie)</label>
                <textarea 
                  rows={2}
                  value={offer.dodatkowe_elementy.custom}
                  placeholder="Dowolny dodatkowy tekst mający się znaleźć w sekcji elementy dodatkowe..."
                  onChange={(e) => updateField('dodatkowe_elementy', 'custom', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* LISTA CHECKBOXÓW : DOSTAWA NIE OBEJMUJE */}
            <div className="space-y-2 border-t border-slate-150 pt-4">
              <h4 className="text-sm font-semibold text-slate-800">2. Dostawa NIE obejmuje:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {(constantLists.dostawa_nie_obejmuje || LIST_DOSTAWA_NIE_OBEJMOWE_STACJA).map((item, idx) => {
                  const isChecked = offer.dostawa_nie_obejmuje.selected.includes(item);
                  return (
                    <div key={idx} className="group/item flex items-center justify-between gap-1 hover:bg-zinc-100/60 px-1.5 py-0.5 rounded transition-all duration-150 border border-transparent hover:border-slate-200">
                      <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0 py-1">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckbox('dostawa_nie_obejmuje', item)}
                          className="rounded text-enco-blue mt-0.5 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <span className="text-xs text-slate-700 break-words leading-tight">{item}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem('dostawa_nie_obejmuje', item)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-450 hover:text-red-500 rounded cursor-pointer transition-all hover:bg-red-50 shrink-0"
                        title="Usuń tę pozycję z bazy opcji"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Dodawanie własnego pola */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
                <input
                  type="text"
                  placeholder="Wpisz własne wyłączenie (np. Prace ziemne...) i kliknij Dodaj"
                  className="flex-1 bg-white border border-slate-250 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004a99]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        handleAddCustomItem('dostawa_nie_obejmuje', val);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const inputEl = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const val = inputEl.value.trim();
                    if (val) {
                      handleAddCustomItem('dostawa_nie_obejmuje', val);
                      inputEl.value = '';
                    }
                  }}
                  className="bg-[#004a99] hover:bg-[#003c80] text-white font-semibold px-3 py-1 rounded text-xs cursor-pointer flex items-center gap-1 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mt-1 mb-0.5">Ręczne uzupełnienie wyłączeń (Opcjonalnie)</label>
                <textarea 
                  rows={2}
                  value={offer.dostawa_nie_obejmuje.custom}
                  placeholder="Dowolny dodatkowy tekst mający się znaleźć w sekcji wyłączeń ze stacji..."
                  onChange={(e) => updateField('dostawa_nie_obejmuje', 'custom', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Stepper Footer / Navigation */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between no-print">
        <button
          type="button"
          onClick={prevStep}
          disabled={activeStep === 0}
          className="flex items-center gap-1 text-sm font-semibold py-1.5 px-4 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Wstecz
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Krok {activeStep + 1} z {steps.length} {steps[activeStep].disabled ? '(Pominięty)' : ''}
        </span>

        {activeStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="bg-zinc-800 hover:bg-zinc-900 text-white flex items-center gap-1 text-sm font-semibold py-1.5 px-4 rounded cursor-pointer transition-all shadow-sm"
          >
            Dalej
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded flex items-center gap-1 animate-pulse">
            <Check className="w-4 h-4" />
            Wszystkie pola gotowe!
          </div>
        )}
      </div>
    </div>
  );
}
