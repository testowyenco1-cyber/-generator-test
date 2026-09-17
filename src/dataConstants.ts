/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConstantLists {
  typy_stacji: string[];
  typy_rozdzielnic_sn: string[];
  typy_pol_sn: string[];
  typy_rozdzielnic_nn: string[];
  kolory_ral: string[];
  typy_drzwi: string[];
  typy_wentylacji: string[];
  typy_telemechaniki: string[];
  typy_polaczen_kablowych: string[];
  dodatkowe_elementy: string[];
  dostawa_nie_obejmuje: string[];
  typy_aparatow_nn: string[];
  konstrukcje_budynku: string[];
  sciany_rei120_opcje: string[];
  sciany_rei_klasa_opcje: string[];
  dach_rei_klasa_opcje: string[];
  typy_przepustow: string[];
  typy_dachow: string[];
  dodatkowe_punkty_budynku: string[];
  szczegolowe_opisy_sn: string[];
  parametry_rozdzielnic_sn: string[];
  nazwy_pol_sn: string[];
  wyposazenie_pol_sn: string[];
  etykiety_ceny_pozycji?: string[];
  opisy_ceny_pozycji?: string[];
}

export const DEFAULT_CONSTANT_LISTS: ConstantLists = {
  typy_stacji: [
    'NZ', 
    'BEK', 
    'ZKSN', 
    'OBUDOWA', 
    'KOMPONENTY'
  ],
  typy_rozdzielnic_sn: [
    'AirSet', 
    'Xiria', 
    'Siemens', 
    'Inna'
  ],
  typy_pol_sn: [
    'Pole liniowe - 2 szt. rozłącznik z uziemnikiem, napęd silnikowy 24V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania',
    'Pole transformatorowe - 1 szt. rozłącznik z uziemnikiem i bezpiecznikami, napęd silnikowy 24V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania',
    'Pole liniowe Siemens - 3 szt. rozłącznik, napęd silnikowy, wyzwalacze zdalne',
    'Pole transformatorowe Siemens - 1 szt. rozłącznik bezpiecznikowy z uziemnikiem szybkim',
    'Eaton Xiria - 2 szt. pola liniowe rozłącznikowe, izolowane próżniowo i stało żywicznie',
    'Eaton Xiria - 1 szt. pole transformatorowe z zabezpieczeniem elektronicznym',
    'Pole sprzęgłowe z wyłącznikiem próżniowym',
    'Pole pomiarowe – przekładniki napięciowe i prądowe'
  ],
  typy_rozdzielnic_nn: [
    'ARS3 Smart pro 630A z sygnalizacją przepalenia wkładki bezpiecznikowej',
    'SL3-3-3: 400A (zasilanie agregatu)',
    '12 x ARS3 Smart pro 630A',
    '4 x SL3-3-3: 400A',
    '6 x ARS3 Smart pro 630A',
    '2 x SL3 400A',
    'Inna'
  ],
  kolory_ral: [
    'RAL 1013 (kremowy)',
    'RAL 8014 (brązowy)',
    'RAL 7035 (szary)',
    'RAL 7016 (antracyt)',
    'RAL 9006 (srebrny)',
    'RAL 6005 (zielony)',
    'brak'
  ],
  typy_drzwi: [
    '1 x drzwi jednoskrzydłowe pełne EI 120 do komory transformatora',
    '1 x drzwi jednoskrzydłowe pełne do tablicy pomiarowej',
    '1 x drzwi dwuskrzydłowe z kratą wentylacyjną do pomieszczenia rozdzielnicy SN i nN',
    '1 x otwór fi 100 zaślepiony demontowalną przegrodą (kable agregatu)',
    '1 x drzwi jednoskrzydłowe pełne do przedziału pomiarów',
    '1 x drzwi dwuskrzydłowe z kratą wentylacyjną do pomieszczenia rozdzielnic',
    '2 x drzwi dwuskrzydłowe stalowe EI 60 z kratkami nawiewnymi oraz demontowalny świetlik dachowy'
  ],
  typy_wentylacji: [
    'wentylacja grawitacyjna (kratki wentylacyjne)',
    'grawitacyjna + 1 x wentylator wyciągowy mechaniczny sterowany termostatem',
    'brak wentylacji mechanicznej',
    'wentylatory nawiewno-wywiewne z autouruchomieniem'
  ],
  typy_telemechaniki: [
    'RTU7M',
    'RTU-X',
    'Sterownik Telkom',
    'RTU7M + sensor prądu fazowego i napięcia',
    'brak telemechaniki'
  ],
  typy_polaczen_kablowych: [
    'Most kablowy SN pomiędzy transformatorem a rozdzielnicą SN – kabel 3 x YHAKXS 1 x 70mm² wraz z głowicami',
    'Most kablowy nN pomiędzy transformatorem a rozdzielnicą nN – kabel 4 x 2 x YKXS 1 x 240mm²',
    'Zestaw mostu kablowego SN kabel 3 x YHAKXS 1x120mm²',
    'Podwójny most kablowy nN kabel 8 x 2 x YKXS 1x240mm²',
    'Podwójny most kablowy nN kabel 8 x 2 x YKXS 1x120mm²',
    'brak mostów kablowych'
  ],
  dodatkowe_elementy: [
    "Dostawa stacji na plac budowy",
    "Podkładki antywibracyjne pod transformator (1 kpl.)",
    "Szafa telemechaniki, sensory prądowe i napięciowe",
    "Edycja kanału i testy telemechaniki",
    "Ugadniacz faz do rozdzielnicy SN",
    "Przepusty systemowe i wkłady uszczelniające"
  ],
  dostawa_nie_obejmuje: [
    "Dostawy i montażu transformatora",
    "Przygotowania wykopu, rozładunku stacji i posadowienia w wykopie",
    "Wyprowadzenia i podłączenia kabli zewnętrznych SN i nN",
    "Wykonania otoku uziemiającego",
    "Wkładek bezpiecznikowych nN",
    "Głowic kablowych do pól liniowych i ograniczników przepięć",
    "Pomiarów pomontażowych",
    "Innych, niewymienionych w ofercie elementów"
  ],
  typy_aparatow_nn: [
    "ARS3 Smart pro 630A z sygnalizacją przepalenia wkładki bezpiecznikowej",
    "ARS2 Smart pro 400A z sygnalizacją przepalenia wkładki bezpiecznikowej",
    "ARS3 630A",
    "ARS2 400A",
    "NSL2 400A",
    "NSL3 630A"
  ],
  konstrukcje_budynku: [
    "żelbetowa z betonu C35/45",
    "żelbetowa z betonu C30/37",
    "lekka aluminiowa",
    "brak"
  ],
  sciany_rei120_opcje: [
    "0",
    "1",
    "2",
    "3",
    "4"
  ],
  sciany_rei_klasa_opcje: [
    "REI 120",
    "REI 60",
    "REI 90",
    "REI 180"
  ],
  dach_rei_klasa_opcje: [
    "REI 120",
    "REI 60",
    "REI 90",
    "REI 180"
  ],
  typy_przepustow: [
    "BWS 100",
    "BWS 150",
    "HSI 90",
    "HSI 150",
    "HEA"
  ],
  typy_dachow: [
    "kopertowy",
    "dwuspadowy",
    "wannowy",
    "brak"
  ],
  dodatkowe_punkty_budynku: [
    "Wewnętrzna instalacja uziemiająca i oświetleniowa (standard)",
    "Zewnętrzny tynk akrylowy w kolorystyce RAL",
    "Instalacja ogrzewania i klimatyzacji",
    "Dodatkowy przedział kablowy",
    "Fundament podwyższony"
  ],
  szczegolowe_opisy_sn: [
    "Siemens 8DJH 24 blue-GIS (bez gazu SF6), układ R-R-R-T, 24 kV, 630 A, 16 kA/1s",
    "Xiria 24kV, 630A, 16kA/1s",
    "AirSeT 24kV, 630A, 16kA/1s (bez SF6)",
    "Siemens 8DJH w układzie R-R-T - 24kV, 630A, 16kA/1s",
    "Eaton Xiria blok kompaktowy, układ R-R-T - 24kV, 630A, 16kA/1s"
  ],
  parametry_rozdzielnic_sn: [
    "24 kV, 630 A, 16 kA/1s",
    "Siemens 8DJH w układzie IIIQ - 24kV, 630A, 20kA/1s",
    "Eaton Xiria blok kompaktowy - 24kV, 630A, 16kA/1s",
    "Schneider Electric RM AirSet w układzie IIQ - 24kV, 630A, 20kA/1s",
    "24 kV, 630 A, 20 kA/1s",
    "12 kV, 630 A, 16 kA/1s"
  ],
  nazwy_pol_sn: [
    "Pole liniowe",
    "Pole transformatorowe",
    "Pole sprzęgłowe",
    "Pole pomiarowe",
    "Pole liniowo-wyłącznikowe",
    "Pole odpływowe",
    "Pole transformatorowo-wyłącznikowe",
    "Pole agregatowe"
  ],
  wyposazenie_pol_sn: [
    "rozłącznik z uziemnikiem, napęd silnikowy 24 V DC, wskaźnik obecności napięcia, styki pomocnicze, przełączniki sterowania, wskaźniki przepływu prądu zwarciowego CPZ-4s",
    "rozłącznik z uziemnikiem i bezpiecznikami, napęd ręczny, wskaźnik obecności napięcia, styki pomocnicze",
    "rozłącznik z uziemnikiem, napęd ręczny, wskaźnik obecności napięcia, styki pomocnicze",
    "odłącznik z uziemnikiem, przekładniki napięciowe, bezpieczniki, wskaźnik obecności napięcia, styki pomocnicze",
    "wyłącznik próżniowy, rozłącznik z uziemnikiem, zabezpieczenie cyfrowe (np. VIP 400), przekładniki prądowe, napęd silnikowy 24 V DC, wskaźnik obecności napięcia",
    "rozłącznik z uziemnikiem, napęd ręczny, wskaźnik obecności napięcia",
    "wyłącznik próżniowy, zabezpieczenie cyfrowe, napęd silnikowy 24 V DC, wskaźnik obecności napięcia",
    "wyłącznik z zabezpieczeniem nadprądowym, napęd silnikowy, styki sygnalizacyjne"
  ],
  etykiety_ceny_pozycji: [
    "Cena pozycji netto:",
    "Cena stacji transformatorowej netto:",
    "Cena jednostkowa netto dla pozycji:",
    "Cena stacji bez transformatora netto:",
    "Cena zespołu urządzeń netto:",
    "Cena kompletnej stacji netto:"
  ],
  opisy_ceny_pozycji: [
    "(bez transformatora)",
    "(bez transportu i montażu)",
    "(kompletne wyposażenie z transportem)",
    "(cena netto loco plac budowy)",
    "(z rozładunkiem i posadowieniem)"
  ]
};

export function getConstantLists(): ConstantLists {
  const saved = localStorage.getItem('enco_constant_lists');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Migrate old station types to new Polish ones
      if (parsed.typy_stacji && (parsed.typy_stacji.includes('stacja_nz') || parsed.typy_stacji.length < 4)) {
        parsed.typy_stacji = DEFAULT_CONSTANT_LISTS.typy_stacji;
        localStorage.setItem('enco_constant_lists', JSON.stringify(parsed));
      }
      return { ...DEFAULT_CONSTANT_LISTS, ...parsed };
    } catch (e) {
      console.error("Error parsing constant lists, using defaults", e);
    }
  }
  return DEFAULT_CONSTANT_LISTS;
}

export function saveConstantLists(lists: ConstantLists) {
  localStorage.setItem('enco_constant_lists', JSON.stringify(lists));
}
