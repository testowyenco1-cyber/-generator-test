/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OfferType = string;

export interface BudynekStacji {
  typ_budynku: 'NZ' | 'BEK' | 'komponenty';
  wymiary_dlugosc: string;
  wymiary_szerokosc: string;
  wymiary_wysokosc: string;
  wymiary_wysokosc_typ?: 'zewnetrzna' | 'wewnetrzna';
  przepusty_nn: string;
  przepusty_sn: string;
  przepusty_uziemienie: string;
  powloka_antygraffiti: boolean;
  kolor_obudowa: string;
  kolor_slusarka: string;
  kolor_dach: string;
  kolor_drzwi_kraty: string;
  drzwi_typ_ilosc: string;
  drzwi_rozmiary: string;
  drzwi_ei: string;
  kraty_typ_ilosc: string;
  wentylatory_nawiew: string;
  wentylatory_wywiew: string;
  konstrukcja_budynku?: string;
  sciany_rei120_ilosc?: string;
  sciany_rei_klasa?: string;
  dach_rei120?: boolean;
  dach_rei_klasa?: string;
  typ_dachu?: string;
  przepusty_nn_typ?: string;
  przepusty_sn_typ?: string;
  przepusty_uziemienie_typ?: string;
  dodatkowe_punkty?: string[];
}

export interface PoleRozdzielnicySN {
  id: string;
  nazwa: string;
  ilosc: string;
  aparat_typ?: string;
  wyposazenie: string;
}

export const DEFAULT_POLA_SN: PoleRozdzielnicySN[] = [
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
];

export const DEFAULT_DODATKOWE_SN: string[] = [
  'czujnik ciśnienia gazu ze stykiem',
  'uzgadniacz faz'
];

export interface RozdzielnicaSN {
  typ: 'AirSet' | 'Xiria' | 'Siemens' | 'Inna';
  typ_custom_opis?: string;
  izolacja?: string;
  ilosc_pol: string;
  pol_liniowe: string; // np. "2 szt. rozłącznik z uziemieniem..."
  pol_transformatorowe: string; // np. "1 szt. rozłącznik z bezpiecznikami..."
  pol_niestandardowe: string;
  parametry: string; // np. "IIQ - 24kV, 630A, 20kA/1s"
  pola?: PoleRozdzielnicySN[];
  dodatkowe_wyposazenie?: string[];
}

export interface PoleRozdzielnicyNN {
  id: string;
  nazwa: string;
  parametry: string;
  ilosc: string;
}

export const DEFAULT_POLA_NN: PoleRozdzielnicyNN[] = [
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
];

export interface CustomPunktNN {
  id: string;
  etykieta: string;
  wartosc: string;
}

export interface RozdzielnicaNN {
  ilosc_pol: string;
  rozlacznik_zasilajacy: '1250A' | '1600A' | 'Inny';
  rozlacznik_niestandardowy_opis: string;
  przydzial_630a: string;
  przydzial_400a: string;
  technologia_smart: boolean;
  custom_punkty?: CustomPunktNN[];
  pola?: PoleRozdzielnicyNN[];
}

export interface Telemechanika {
  wlaczone: boolean;
  sterownik: string; // np. RTU7M / inny
  sensory: string; // np. "sensory prądowe i napięciowe"
}

export interface PolaczeniaKablowe {
  most_sn: string;
  most_nn: string;
  inne: string;
}

export interface ElementyDodatkowe {
  selected: string[];
  custom: string;
}

export interface DostawaNieObejmuje {
  selected: string[];
  custom: string;
}

export interface CenaInfo {
  cena_netto: string;
  cena_brutto: string; // automatycznie liczone lub wpisane
  waluta: string; // PLN, EUR itp.
  etykieta_ceny?: string;
  opis_ceny?: string;
}

export interface DaneOferty {
  id: string;
  offer_type: OfferType;
  numer_oferty: string; // np. "L. Dz. 123/06/25"
  tytul_oferty?: string; // np. "OFERTA DO ZAKUPU" lub "OFERTA"
  data_oferty: string; // np. "05.06.2026"
  post_temat: string; // np. "POST 01071"
  klient_nazwa: string;
  klient_adres: string;
  klient_miejscowosc_kod: string;
  klient_osoba_kontaktowa: string;
  klient_telefon: string;
  klient_email: string;
  
  budynek: BudynekStacji;
  rozdzielnica_sn: RozdzielnicaSN;
  rozdzielnica_nn: RozdzielnicaNN;
  telemechanika: Telemechanika;
  polaczenia_kablowe: PolaczeniaKablowe;
  dodatkowe_elementy: ElementyDodatkowe;
  dostawa_nie_obejmuje: DostawaNieObejmuje;
  cena: CenaInfo;

  // Warunki i stopka
  termin_dostawy: string; // np. "12 tygodni od zamówienia"
  warunki_dostawy: string; // np. "na miejsce wskazane..."
  warunki_gwarancji: string; // np. "36 miesiące"
  warunki_platnosci: string; // np. "przelew 30 dni"
  waznosc_oferty: string; // np. "30 dni"
  osoba_zatwierdzajaca: string; // np. "Barbara Baprawska"
  osoba_zatwierdzajaca_telefon: string; // np. "tel. (22) 543 72 31"
  osoba_zatwierdzajaca_email: string; // np. "bbaprawska@grupaenco.pl"

  // Możliwość pomijania całych sekcji
  pomin_budynek_stacji?: boolean;
  pomin_rozdzielnice_SN?: boolean;
  pomin_rozdzielnice_NN?: boolean;
  pomin_telemechanike?: boolean;
  pomin_polaczenia_kablowe?: boolean;

  dot_tekst?: string;
  wstep_tekst?: string;
  naglowek_stacji_tekst?: string;
  cena_netto_etykieta?: string;
  pomin_tablice_licznikowa?: boolean;
  tablica_licznikowa_tytul?: string;
  tablica_licznikowa_tekst?: string;

  stacje?: StacjaOferty[];
}

export interface StacjaOferty {
  id: string;
  post_temat: string;
  offer_type: OfferType;
  budynek: BudynekStacji;
  rozdzielnica_sn: RozdzielnicaSN;
  rozdzielnica_nn: RozdzielnicaNN;
  telemechanika: Telemechanika;
  polaczenia_kablowe: PolaczeniaKablowe;
  dodatkowe_elementy: ElementyDodatkowe;
  cena: CenaInfo;

  pomin_budynek_stacji?: boolean;
  pomin_rozdzielnice_SN?: boolean;
  pomin_rozdzielnice_NN?: boolean;
  pomin_telemechanike?: boolean;
  pomin_polaczenia_kablowe?: boolean;
  pomin_tablice_licznikowa?: boolean;

  naglowek_stacji_tekst?: string;
  tablica_licznikowa_tytul?: string;
  tablica_licznikowa_tekst?: string;
  dostawa_nie_obejmuje?: DostawaNieObejmuje;
}

export const LIST_ELEMENTY_DODATKOWE_STACJA = [
  "Dostawa stacji na plac budowy",
  "Podkładki antywibracyjne pod transformator (1 kpl.)",
  "Szafa telemechaniki, sensory prądowe i napięciowe",
  "Edycja kanału i testy telemechaniki",
  "Ugadniacz faz do rozdzielnicy SN",
  "Przepusty systemowe i wkłady uszczelniające"
];

export const LIST_DOSTAWA_NIE_OBEJMOWE_STACJA = [
  "Dostawy i montażu transformatora",
  "Przygotowania wykopu, rozładunku stacji i posadowienia w wykopie",
  "Wyprowadzenia i podłączenia kabli zewnętrznych SN i nN",
  "Wykonania otoku uziemiającego",
  "Wkładek bezpiecznikowych nN",
  "Głowic kablowych do pól liniowych i ograniczników przepięć",
  "Pomiarów pomontażowych",
  "Innych, niewymienionych w ofercie elementów"
];

export function normalizeOffer(offer: DaneOferty): DaneOferty {
  if (offer.stacje && offer.stacje.length > 0) {
    const stacjeNormalized = offer.stacje.map(st => ({
      ...st,
      budynek: st.budynek ? {
        ...st.budynek,
        wymiary_wysokosc_typ: st.budynek.wymiary_wysokosc_typ || 'zewnetrzna'
      } : st.budynek
    }));
    return { ...offer, stacje: stacjeNormalized } as DaneOferty;
  }
  
  const firstStation: StacjaOferty = {
    id: 'stacja-' + Math.random().toString(36).substring(2, 9),
    post_temat: offer.post_temat || 'POST __________',
    offer_type: offer.offer_type || 'stacja_nz',
    budynek: offer.budynek ? {
      ...offer.budynek,
      wymiary_wysokosc_typ: offer.budynek.wymiary_wysokosc_typ || 'zewnetrzna'
    } : {
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
      drzwi_typ_ilosc: '',
      drzwi_rozmiary: 'standardowe',
      drzwi_ei: 'EI 120 / standard',
      kraty_typ_ilosc: '',
      wentylatory_nawiew: '0',
      wentylatory_wywiew: '0',
      konstrukcja_budynku: 'żelbetowa z betonu C35/45',
      sciany_rei120_ilosc: '0',
      dach_rei120: false,
      typ_dachu: 'kopertowy'
    },
    rozdzielnica_sn: offer.rozdzielnica_sn ? {
      ...offer.rozdzielnica_sn,
      izolacja: offer.rozdzielnica_sn.izolacja || 'powietrzna',
      pola: (offer.rozdzielnica_sn.pola || DEFAULT_POLA_SN).map(p => {
        if (p.aparat_typ && p.aparat_typ.trim()) {
          return {
            ...p,
            wyposazenie: p.wyposazenie 
              ? `${p.aparat_typ}, ${p.wyposazenie}` 
              : p.aparat_typ,
            aparat_typ: ''
          };
        }
        return p;
      }),
      dodatkowe_wyposazenie: offer.rozdzielnica_sn.dodatkowe_wyposazenie || DEFAULT_DODATKOWE_SN,
      typ_custom_opis: offer.rozdzielnica_sn.typ_custom_opis || (offer.rozdzielnica_sn.typ === 'Siemens' || !offer.rozdzielnica_sn.typ ? 'Siemens 8DJH 24 blue-GIS (bez gazu SF6), układ R-R-R-T, 24 kV, 630 A, 16 kA/1s' : '')
    } : {
      typ: 'Siemens',
      typ_custom_opis: 'Siemens 8DJH 24 blue-GIS (bez gazu SF6), układ R-R-R-T, 24 kV, 630 A, 16 kA/1s',
      izolacja: 'powietrzna',
      ilosc_pol: '4',
      pol_liniowe: '',
      pol_transformatorowe: '',
      pol_niestandardowe: '',
      parametry: '',
      pola: DEFAULT_POLA_SN,
      dodatkowe_wyposazenie: DEFAULT_DODATKOWE_SN
    },
    rozdzielnica_nn: offer.rozdzielnica_nn ? {
      ...offer.rozdzielnica_nn,
      custom_punkty: offer.rozdzielnica_nn.custom_punkty || [],
      pola: offer.rozdzielnica_nn.pola || DEFAULT_POLA_NN
    } : {
      ilosc_pol: '12',
      rozlacznik_zasilajacy: '1250A',
      rozlacznik_niestandardowy_opis: '',
      przydzial_630a: '',
      przydzial_400a: '',
      technologia_smart: true,
      custom_punkty: [],
      pola: DEFAULT_POLA_NN
    },
    telemechanika: offer.telemechanika || {
      wlaczone: true,
      sterownik: 'RTU7M',
      sensory: ''
    },
    polaczenia_kablowe: offer.polaczenia_kablowe || {
      most_sn: '',
      most_nn: '',
      inne: ''
    },
    dodatkowe_elementy: offer.dodatkowe_elementy || {
      selected: [],
      custom: ''
    },
    cena: offer.cena || {
      cena_netto: '0',
      cena_brutto: '0',
      waluta: 'PLN'
    },
    pomin_budynek_stacji: offer.pomin_budynek_stacji,
    pomin_rozdzielnice_SN: offer.pomin_rozdzielnice_SN,
    pomin_rozdzielnice_NN: offer.pomin_rozdzielnice_NN,
    pomin_telemechanike: offer.pomin_telemechanike,
    pomin_polaczenia_kablowe: offer.pomin_polaczenia_kablowe,
    pomin_tablice_licznikowa: offer.pomin_tablice_licznikowa,
    naglowek_stacji_tekst: offer.naglowek_stacji_tekst,
    tablica_licznikowa_tytul: offer.tablica_licznikowa_tytul,
    tablica_licznikowa_tekst: offer.tablica_licznikowa_tekst,
    dostawa_nie_obejmuje: offer.dostawa_nie_obejmuje || {
      selected: [],
      custom: ''
    }
  };

  return {
    ...offer,
    stacje: [firstStation]
  };
}
