/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DaneOferty, StacjaOferty } from '../types';
import EncoLogo from './EncoLogo';

// Helper to parse price string safely supporting spaces or Polish separators
function parsePrice(valStr: string | undefined | null): number {
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
}

const getStationHeader = (st: StacjaOferty, idx: number): string => {
  if (st.naglowek_stacji_tekst !== undefined && st.naglowek_stacji_tekst.trim() !== "") {
    return st.naglowek_stacji_tekst;
  }
  const typeStr = st.offer_type?.toLowerCase().includes('komponenty') 
    ? 'KOMPONENTY' 
    : `${st.offer_type?.toUpperCase() || 'STACJA'}`;
  const postStr = st.post_temat ? ` (${st.post_temat.toUpperCase()})` : '';
  return `OPIS TECHNICZNY DLA POZYCJI ${idx + 1}: ${typeStr}${postStr}`;
};

interface BuildingSubItem {
  type: 'basic' | 'przepusty' | 'instalacja_ral' | 'drzwi' | 'dodatkowy_punkt';
  text?: string;
  lines?: string[];
}

interface PageContent {
  type: 'station_title' | 'building' | 'building_header' | 'building_items' | 'sn_header' | 'sn_poles' | 'sn_additional' | 'sn_fallback' | 'nn_header' | 'nn_poles' | 'nn_fallback' | 'tablica' | 'telemechanika' | 'polaczenia_kablowe' | 'dodatkowe_elementy' | 'de_header' | 'de_items' | 'dostawa_nie_obejmuje' | 'dno_header' | 'dno_items' | 'cena_jednostkowa' | 'summary_table' | 'totals_box' | 'owh_box' | 'signature_box' | 'owh_signature_box';
  stacja?: StacjaOferty;
  stacjaIdx?: number;
  snNum?: number;
  nnNum?: number;
  tablicaNum?: number;
  teleNum?: number;
  kableNum?: number;
  customNum?: number;
  isContinuation?: boolean;
  poles?: any[];
  items?: string[];
  buildingSubItems?: BuildingSubItem[];
}

interface PageDefinition {
  id: string;
  type: 'cover' | 'station';
  pageNum: number;
  stacja?: StacjaOferty;
  stacjaIndex?: number;
  stationPageNum?: number;
  totalStationPages?: number;
  blocks?: PageContent[];
}

function countTextLines(text: string | undefined | null, charsPerLine = 70): number {
  if (!text) return 0;
  const lines = text.split('\n');
  let total = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    total += Math.max(1, Math.ceil(trimmed.length / charsPerLine));
  }
  return total;
}

function getBuildingHeightMm(stacja: StacjaOferty): number {
  if (!stacja.budynek) return 0;
  let h = 6.5; // Section title header
  h += 4.0; // Konstrukcja
  if (stacja.budynek.sciany_rei120_ilosc && stacja.budynek.sciany_rei120_ilosc !== '0' && stacja.budynek.sciany_rei120_ilosc !== 'brak' && stacja.budynek.sciany_rei120_ilosc.trim() !== '') {
    const text = `Ściany o klasie odporności ogniowej ${stacja.budynek.sciany_rei_klasa || 'REI 120'}: ${stacja.budynek.sciany_rei120_ilosc}`;
    h += countTextLines(text, 70) * 4.0;
  }
  const wymiaryText = `Wymiary: ${stacja.budynek.wymiary_dlugosc || '0'} m x ${stacja.budynek.wymiary_szerokosc || '0'} m x ${stacja.budynek.wymiary_wysokosc || '0'} m`;
  h += countTextLines(wymiaryText, 70) * 4.0;
  const dachText = `Dach: ${stacja.budynek.typ_dachu === 'brak' ? 'brak dachu' : `${stacja.budynek.typ_dachu || 'kopertowy'} dach betonowy`}${stacja.budynek.dach_rei120 && stacja.budynek.typ_dachu !== 'brak' ? ` o klasie odporności ogniowej ${stacja.budynek.dach_rei_klasa || 'REI 120'}` : ''}`;
  h += countTextLines(dachText, 70) * 4.0;
  h += 4.0; // Fundament
  h += 15.0; // Przepusty header + items
  h += 4.0; // Wewnętrzna instalacja
  if (stacja.budynek.powloka_antygraffiti) {
    h += 4.0;
  }
  const ralText = `Kolory RAL: obudowa ${stacja.budynek.kolor_obudowa || 'standard'}, stolarka/drzwi/dach ${stacja.budynek.kolor_slusarka || 'standard'}`;
  h += countTextLines(ralText, 70) * 4.0;

  if (stacja.budynek.drzwi_typ_ilosc) {
    h += 4.0;
    h += countTextLines(stacja.budynek.drzwi_typ_ilosc, 65) * 4.0;
  }

  if (stacja.budynek.dodatkowe_punkty && stacja.budynek.dodatkowe_punkty.length > 0) {
    for (const pt of stacja.budynek.dodatkowe_punkty) {
      if (pt && pt.trim()) {
        h += countTextLines(pt, 70) * 4.0;
      }
    }
  }

  return h;
}

function partitionAllStations(stacje: StacjaOferty[]): PageContent[][] {
  const allPages: PageContent[][] = [];
  let currentPage: PageContent[] = [];
  let currentPageHeightMm = 0;

  // Total A4 page height: 297mm.
  // Header top padding: 38mm. Footer bottom padding: 38mm.
  // Usable content area height: 221mm (from 38mm down to 259mm).
  // Target max content height per page: 209.0mm to raise the bottom margin boundary by 10mm.
  const MAX_PAGE_HEIGHT_MM = 225.0;

  function isHeaderBlock(block: PageContent): boolean {
    return (
      block.type === 'station_title' ||
      block.type === 'building_header' ||
      block.type === 'sn_header' ||
      block.type === 'nn_header' ||
      block.type === 'de_header' ||
      block.type === 'dno_header'
    );
  }

  function getBlockHeight(block: PageContent): number {
    switch (block.type) {
      case 'station_title':
        return 10.5 + countTextLines(getStationHeader(block.stacja!, block.stacjaIdx || 0), 80) * 4.2;
      case 'building_header':
        return 6.5;
      case 'sn_header':
        return block.stacja?.rozdzielnica_sn?.izolacja ? 12.5 : 9.5;
      case 'nn_header':
        return 9.5;
      case 'de_header':
        return 6.5;
      case 'dno_header':
        return 11.0;
      default:
        return 0;
    }
  }

  function addBlockToCurrentPage(block: PageContent, heightMm: number) {
    const isDirectChild =
      block.type === 'dno_items' ||
      block.type === 'de_items' ||
      block.type === 'building_items' ||
      block.type === 'sn_poles' ||
      block.type === 'nn_poles';
    const gapMm = currentPage.length > 0 && !isDirectChild ? 3.2 : 0;
    currentPage.push(block);
    currentPageHeightMm += heightMm + gapMm;
  }

  function startNewPageAndMoveOrphanHeaders(): PageContent[] {
    const poppedHeaders: PageContent[] = [];
    while (currentPage.length > 0) {
      const last = currentPage[currentPage.length - 1];
      if (isHeaderBlock(last)) {
        poppedHeaders.unshift(currentPage.pop()!);
      } else {
        break;
      }
    }

    if (currentPage.length > 0) {
      allPages.push(currentPage);
    }

    currentPage = [];
    currentPageHeightMm = 0;

    return poppedHeaders;
  }

  function safeAddBlock(block: PageContent, heightMm: number) {
    const isDirectChild =
      block.type === 'dno_items' ||
      block.type === 'de_items' ||
      block.type === 'building_items' ||
      block.type === 'sn_poles' ||
      block.type === 'nn_poles';
    const gapMm = currentPage.length > 0 && !isDirectChild ? 3.2 : 0;

    if (currentPageHeightMm + gapMm + heightMm > MAX_PAGE_HEIGHT_MM && currentPage.length > 0) {
      const popped = startNewPageAndMoveOrphanHeaders();
      for (const h of popped) {
        addBlockToCurrentPage(h, getBlockHeight(h));
      }
    }

    addBlockToCurrentPage(block, heightMm);
  }

  stacje.forEach((stacja, stacjaIdx) => {
    let equipIndex = 1;
    const snNum = !stacja.pomin_rozdzielnice_SN ? equipIndex++ : 0;
    const nnNum = !stacja.pomin_rozdzielnice_NN ? equipIndex++ : 0;
    const hasTablicaLicznikowa = !stacja.pomin_tablice_licznikowa && (!stacja.pomin_rozdzielnice_SN || !stacja.pomin_rozdzielnice_NN);
    const tablicaNum = hasTablicaLicznikowa ? equipIndex++ : 0;
    const teleNum = (!stacja.pomin_telemechanike && stacja.telemechanika?.wlaczone) ? equipIndex++ : 0;
    const kableNum = !stacja.pomin_polaczenia_kablowe ? equipIndex++ : 0;
    const hasCustomElements = (stacja.dodatkowe_elementy?.selected?.length || 0) > 0 || stacja.dodatkowe_elementy?.custom;
    const customNum = hasCustomElements ? equipIndex++ : 0;

    const isBudynekOmitted = stacja.offer_type?.toLowerCase().includes('komponenty') || !!stacja.pomin_budynek_stacji;

    // 0. Station Title
    const titleText = getStationHeader(stacja, stacjaIdx);
    const stationTitleHeightMm = 10.5 + countTextLines(titleText, 80) * 4.2;
    safeAddBlock({
      type: 'station_title',
      stacja,
      stacjaIdx
    }, stationTitleHeightMm);

    // 1. Building/Enclosure (split item-by-item across page boundaries)
    if (!isBudynekOmitted && stacja.budynek) {
      const b = stacja.budynek;
      const subItems: { sub: BuildingSubItem; heightMm: number }[] = [];

      // a) Basic structure
      let basicHeight = 4.0 * 3;
      if (b.sciany_rei120_ilosc && b.sciany_rei120_ilosc !== '0' && b.sciany_rei120_ilosc !== 'brak' && b.sciany_rei120_ilosc.trim() !== '') {
        basicHeight += countTextLines(`Ściany o klasie odporności ogniowej ${b.sciany_rei_klasa || 'REI 120'}: ${b.sciany_rei120_ilosc}`, 70) * 4.0;
      }
      const dachText = `Dach: ${b.typ_dachu === 'brak' ? 'brak dachu' : `${b.typ_dachu || 'kopertowy'} dach betonowy`}${b.dach_rei120 && b.typ_dachu !== 'brak' ? ` o klasie odporności ogniowej ${b.dach_rei_klasa || 'REI 120'}` : ''}`;
      basicHeight += countTextLines(dachText, 78) * 4.0;

      subItems.push({
        sub: { type: 'basic' },
        heightMm: basicHeight
      });

      // b) Przepusty
      subItems.push({
        sub: { type: 'przepusty' },
        heightMm: 15.0
      });

      // c) Wewnętrzna instalacja, Powłoka antygraffiti, Kolory RAL
      let instalacjaHeight = 4.0;
      if (b.powloka_antygraffiti) instalacjaHeight += 4.0;
      const ralText = `Kolory RAL: obudowa ${b.kolor_obudowa || 'standard'}, stolarka/drzwi/dach ${b.kolor_slusarka || 'standard'}`;
      instalacjaHeight += countTextLines(ralText, 80) * 4.0;
      subItems.push({
        sub: { type: 'instalacja_ral' },
        heightMm: instalacjaHeight
      });

      // d) Drzwi i wentylacja
      if (b.drzwi_typ_ilosc) {
        const doorLines = b.drzwi_typ_ilosc.split('\n').map(l => l.trim()).filter(Boolean);
        if (doorLines.length > 0) {
          const doorHeight = 4.0 + countTextLines(b.drzwi_typ_ilosc, 80) * 4.0;
          subItems.push({
            sub: { type: 'drzwi', lines: doorLines },
            heightMm: doorHeight
          });
        }
      }

      // e) Dodatkowe punkty budynku
      if (b.dodatkowe_punkty && b.dodatkowe_punkty.length > 0) {
        for (const pt of b.dodatkowe_punkty) {
          if (pt && pt.trim()) {
            const ptHeight = countTextLines(pt, 70) * 4.0;
            subItems.push({
              sub: { type: 'dodatkowy_punkt', text: pt },
              heightMm: ptHeight
            });
          }
        }
      }

      const buildingHeaderHeight = 6.5;
      safeAddBlock({ type: 'building_header', isContinuation: false, stacja, stacjaIdx }, buildingHeaderHeight);

      for (let i = 0; i < subItems.length; i++) {
        const { sub, heightMm } = subItems[i];

        if (currentPageHeightMm + heightMm > MAX_PAGE_HEIGHT_MM) {
          const popped = startNewPageAndMoveOrphanHeaders();
          if (popped.length > 0) {
            for (const h of popped) {
              addBlockToCurrentPage(h, getBlockHeight(h));
            }
          } else {
            addBlockToCurrentPage({ type: 'building_header', isContinuation: true, stacja, stacjaIdx }, buildingHeaderHeight);
          }
        }

        let lastBlock = currentPage[currentPage.length - 1];
        if (lastBlock && lastBlock.type === 'building_items') {
          lastBlock.buildingSubItems!.push(sub);
          currentPageHeightMm += heightMm;
        } else {
          addBlockToCurrentPage({ type: 'building_items', buildingSubItems: [sub], stacja, stacjaIdx }, heightMm);
        }
      }
    }

    // 2. Medium-voltage switchgear SN
    if (snNum > 0 && stacja.rozdzielnica_sn) {
      const hasPoles = stacja.rozdzielnica_sn.pola && stacja.rozdzielnica_sn.pola.length > 0;
      const snHeaderHeightMm = stacja.rozdzielnica_sn.izolacja ? 12.5 : 9.5;

      safeAddBlock({ type: 'sn_header', snNum, isContinuation: false, stacja, stacjaIdx }, snHeaderHeightMm);

      if (hasPoles) {
        const poles = stacja.rozdzielnica_sn.pola;
        for (let i = 0; i < poles.length; i++) {
          const pole = poles[i];
          const poleStr = `${pole.nazwa || 'Pole'} (${pole.ilosc || '1 szt.'}) ${pole.wyposazenie || ''}`;
          const poleHeightMm = countTextLines(poleStr, 80) * 3.8 + 0.5;

          if (currentPageHeightMm + poleHeightMm > MAX_PAGE_HEIGHT_MM) {
            const popped = startNewPageAndMoveOrphanHeaders();
            if (popped.length > 0) {
              for (const h of popped) {
                addBlockToCurrentPage(h, getBlockHeight(h));
              }
            } else {
              addBlockToCurrentPage({ type: 'sn_header', snNum, isContinuation: true, stacja, stacjaIdx }, snHeaderHeightMm);
            }
          }

          let lastBlock = currentPage[currentPage.length - 1];
          if (lastBlock && lastBlock.type === 'sn_poles') {
            lastBlock.poles!.push(pole);
            currentPageHeightMm += poleHeightMm;
          } else {
            addBlockToCurrentPage({ type: 'sn_poles', poles: [pole], snNum, stacja, stacjaIdx }, poleHeightMm);
          }
        }
      } else {
        let snFallbackHeight = 4.0;
        if (stacja.rozdzielnica_sn.pol_liniowe) snFallbackHeight += countTextLines(stacja.rozdzielnica_sn.pol_liniowe, 70) * 4.0;
        if (stacja.rozdzielnica_sn.pol_transformatorowe) snFallbackHeight += countTextLines(stacja.rozdzielnica_sn.pol_transformatorowe, 70) * 4.0;
        if (stacja.rozdzielnica_sn.pol_niestandardowe) snFallbackHeight += 3.0 + countTextLines(stacja.rozdzielnica_sn.pol_niestandardowe, 80) * 4.0;

        if (currentPageHeightMm + snFallbackHeight > MAX_PAGE_HEIGHT_MM) {
          const popped = startNewPageAndMoveOrphanHeaders();
          if (popped.length > 0) {
            for (const h of popped) {
              addBlockToCurrentPage(h, getBlockHeight(h));
            }
          } else {
            addBlockToCurrentPage({ type: 'sn_header', snNum, isContinuation: true, stacja, stacjaIdx }, snHeaderHeightMm);
          }
        }
        addBlockToCurrentPage({ type: 'sn_fallback', snNum, stacja, stacjaIdx }, snFallbackHeight);
      }

      // Additional equipment
      if (stacja.rozdzielnica_sn.dodatkowe_wyposazenie && stacja.rozdzielnica_sn.dodatkowe_wyposazenie.filter(item => item && item.trim()).length > 0) {
        const filtered = stacja.rozdzielnica_sn.dodatkowe_wyposazenie.filter(item => item && item.trim());
        const addHeaderHeight = 5.5;

        let currentItems: string[] = [];
        let currentBlockHeight = addHeaderHeight;
        let isCont = false;

        for (let i = 0; i < filtered.length; i++) {
          const item = filtered[i];
          const itemHeight = countTextLines(item, 80) * 3.8 + 0.5;

          if (currentPageHeightMm + (currentItems.length === 0 ? 3.2 : 0) + currentBlockHeight + itemHeight > MAX_PAGE_HEIGHT_MM) {
            if (currentItems.length > 0) {
              addBlockToCurrentPage({ type: 'sn_additional', items: currentItems, isContinuation: isCont, stacja, stacjaIdx }, currentBlockHeight);
              const popped = startNewPageAndMoveOrphanHeaders();
              for (const h of popped) {
                addBlockToCurrentPage(h, getBlockHeight(h));
              }
              currentItems = [item];
              isCont = true;
              currentBlockHeight = addHeaderHeight + itemHeight;
            } else {
              const popped = startNewPageAndMoveOrphanHeaders();
              for (const h of popped) {
                addBlockToCurrentPage(h, getBlockHeight(h));
              }
              currentItems = [item];
              currentBlockHeight = addHeaderHeight + itemHeight;
            }
          } else {
            currentItems.push(item);
            currentBlockHeight += itemHeight;
          }
        }

        if (currentItems.length > 0) {
          addBlockToCurrentPage({ type: 'sn_additional', items: currentItems, isContinuation: isCont, stacja, stacjaIdx }, currentBlockHeight);
        }
      }
    }

    // 3. Low-voltage switchgear NN
    if (nnNum > 0 && stacja.rozdzielnica_nn) {
      const hasPoles = stacja.rozdzielnica_nn.pola && stacja.rozdzielnica_nn.pola.length > 0;
      const nnHeaderHeightMm = 9.5;

      safeAddBlock({ type: 'nn_header', nnNum, isContinuation: false, stacja, stacjaIdx }, nnHeaderHeightMm);

      if (hasPoles) {
        const poles = stacja.rozdzielnica_nn.pola;
        for (let i = 0; i < poles.length; i++) {
          const pole = poles[i];
          const poleStr = `${pole.nazwa || 'Wyposażenie'}: ${pole.parametry || ''}`;
          const poleHeightMm = countTextLines(poleStr, 80) * 3.8 + 0.3;

          if (currentPageHeightMm + poleHeightMm > MAX_PAGE_HEIGHT_MM) {
            const popped = startNewPageAndMoveOrphanHeaders();
            if (popped.length > 0) {
              for (const h of popped) {
                addBlockToCurrentPage(h, getBlockHeight(h));
              }
            } else {
              addBlockToCurrentPage({ type: 'nn_header', nnNum, isContinuation: true, stacja, stacjaIdx }, nnHeaderHeightMm);
            }
          }

          let lastBlock = currentPage[currentPage.length - 1];
          if (lastBlock && lastBlock.type === 'nn_poles') {
            lastBlock.poles!.push(pole);
            currentPageHeightMm += poleHeightMm;
          } else {
            addBlockToCurrentPage({ type: 'nn_poles', poles: [pole], nnNum, stacja, stacjaIdx }, poleHeightMm);
          }
        }
      } else {
        let nnFallbackHeight = 4.0;
        if (stacja.rozdzielnica_nn.rozlacznik_niestandardowy_opis) nnFallbackHeight += countTextLines(stacja.rozdzielnica_nn.rozlacznik_niestandardowy_opis, 70) * 4.0;
        if (stacja.rozdzielnica_nn.przydzial_630a || stacja.rozdzielnica_nn.przydzial_400a) nnFallbackHeight += 4.0;
        if (stacja.rozdzielnica_nn.custom_punkty) {
          for (const pt of stacja.rozdzielnica_nn.custom_punkty) {
            if (pt.etykieta) nnFallbackHeight += countTextLines(`${pt.etykieta}: ${pt.wartosc}`, 70) * 4.0;
          }
        }

        if (currentPageHeightMm + nnFallbackHeight > MAX_PAGE_HEIGHT_MM) {
          const popped = startNewPageAndMoveOrphanHeaders();
          if (popped.length > 0) {
            for (const h of popped) {
              addBlockToCurrentPage(h, getBlockHeight(h));
            }
          } else {
            addBlockToCurrentPage({ type: 'nn_header', nnNum, isContinuation: true, stacja, stacjaIdx }, nnHeaderHeightMm);
          }
        }
        addBlockToCurrentPage({ type: 'nn_fallback', nnNum, stacja, stacjaIdx }, nnFallbackHeight);
      }
    }

    // 4. Tablica licznikowa / pomiarowa
    if (tablicaNum > 0) {
      const textLines = countTextLines(stacja.tablica_licznikowa_tekst || 'Zintegrowana, przygotowana fabrycznie.', 70);
      const tablicaHeightMm = 6.5 + textLines * 4.0;
      safeAddBlock({ type: 'tablica', tablicaNum, stacja, stacjaIdx }, tablicaHeightMm);
    }

    // 5. Telemechanika
    if (teleNum > 0 && stacja.telemechanika?.wlaczone) {
      const teleText = `Zastosowano sterownik ${stacja.telemechanika.sterownik || 'RTU7M'} oraz telemetryczny system ${stacja.telemechanika.sensory || 'przekładników'}.`;
      const teleHeightMm = 10.5 + countTextLines(teleText, 65) * 4.0;
      safeAddBlock({ type: 'telemechanika', teleNum, stacja, stacjaIdx }, teleHeightMm);
    }

    // 6. Mosty kablowe
    if (kableNum > 0 && stacja.polaczenia_kablowe) {
      let kableHeightMm = 6.5;
      if (stacja.polaczenia_kablowe.most_sn) kableHeightMm += countTextLines(`• SN: ${stacja.polaczenia_kablowe.most_sn}`, 70) * 4.0;
      if (stacja.polaczenia_kablowe.most_nn) kableHeightMm += countTextLines(`• nN: ${stacja.polaczenia_kablowe.most_nn}`, 70) * 4.0;
      if (stacja.polaczenia_kablowe.inne) {
        kableHeightMm += countTextLines(stacja.polaczenia_kablowe.inne, 70) * 4.0;
      }
      safeAddBlock({ type: 'polaczenia_kablowe', kableNum, stacja, stacjaIdx }, kableHeightMm);
    }

    // 7. Dodatkowe elementy (split item by item across pages)
    if (customNum > 0 && stacja.dodatkowe_elementy) {
      const de = stacja.dodatkowe_elementy;
      const itemsList: string[] = [];
      if (de.selected) {
        for (const item of de.selected) {
          if (item && item.trim()) itemsList.push(item);
        }
      }
      if (de.custom && de.custom.trim()) {
        itemsList.push(de.custom.trim());
      }

      if (itemsList.length > 0) {
        const deHeaderHeight = 6.5;
        safeAddBlock({ type: 'de_header', customNum, isContinuation: false, stacja, stacjaIdx }, deHeaderHeight);

        for (let i = 0; i < itemsList.length; i++) {
          const itemText = itemsList[i];
          const itemHeight = countTextLines(itemText, 70) * 4.0 + 1.0;

          if (currentPageHeightMm + itemHeight > MAX_PAGE_HEIGHT_MM) {
            const popped = startNewPageAndMoveOrphanHeaders();
            if (popped.length > 0) {
              for (const h of popped) {
                addBlockToCurrentPage(h, getBlockHeight(h));
              }
            } else {
              addBlockToCurrentPage({ type: 'de_header', customNum, isContinuation: true, stacja, stacjaIdx }, deHeaderHeight);
            }
          }

          let lastBlock = currentPage[currentPage.length - 1];
          if (lastBlock && lastBlock.type === 'de_items') {
            lastBlock.items!.push(itemText);
            currentPageHeightMm += itemHeight;
          } else {
            addBlockToCurrentPage({ type: 'de_items', items: [itemText], customNum, stacja, stacjaIdx }, itemHeight);
          }
        }
      }
    }

    // 8. Dostawa nie obejmuje
    if (stacja.dostawa_nie_obejmuje && (stacja.dostawa_nie_obejmuje.selected?.length > 0 || stacja.dostawa_nie_obejmuje.custom)) {
      const dno = stacja.dostawa_nie_obejmuje;
      const itemsList: string[] = [];
      if (dno.selected) {
        for (const item of dno.selected) {
          if (item && item.trim()) itemsList.push(item);
        }
      }
      if (dno.custom && dno.custom.trim()) {
        itemsList.push(dno.custom.trim());
      }

      if (itemsList.length > 0) {
        const dnoHeaderHeight = 11.0;
        safeAddBlock({ type: 'dno_header', isContinuation: false, stacja, stacjaIdx }, dnoHeaderHeight);

        for (let i = 0; i < itemsList.length; i++) {
          const itemText = itemsList[i];
          const itemHeight = countTextLines(itemText, 65) * 4.0 + 1.2;

          if (currentPageHeightMm + itemHeight > MAX_PAGE_HEIGHT_MM) {
            const popped = startNewPageAndMoveOrphanHeaders();
            if (popped.length > 0) {
              for (const h of popped) {
                addBlockToCurrentPage(h, getBlockHeight(h));
              }
            } else {
              addBlockToCurrentPage({ type: 'dno_header', isContinuation: true, stacja, stacjaIdx }, dnoHeaderHeight);
            }
          }

          let lastBlock = currentPage[currentPage.length - 1];
          if (lastBlock && lastBlock.type === 'dno_items') {
            lastBlock.items!.push(itemText);
            currentPageHeightMm += itemHeight;
          } else {
            addBlockToCurrentPage({ type: 'dno_items', items: [itemText], stacja, stacjaIdx }, itemHeight - 0.5);
          }
        }
      }
    }

    // 9. Cena jednostkowa
    const cjHeightMm = 17.5;
    safeAddBlock({ type: 'cena_jednostkowa', stacja, stacjaIdx }, cjHeightMm);
  });

  // 10. Zestawienie urządzeń i cen
  const summaryTableHeightMm = 16.0 + stacje.length * 10.0;
  safeAddBlock({ type: 'summary_table' }, summaryTableHeightMm);

  // 11. Łączna suma
  const totalsHeightMm = 31.0;
  safeAddBlock({ type: 'totals_box' }, totalsHeightMm);

  // 12. Ogólne Warunki Handlowe oraz Podpis autoryzacyjny
  const owhSignatureHeightMm = 68.0;
  safeAddBlock({ type: 'owh_signature_box' }, owhSignatureHeightMm);

  if (currentPage.length > 0) {
    const popped = startNewPageAndMoveOrphanHeaders();
    if (currentPage.length > 0) {
      allPages.push(currentPage);
    }
    if (popped.length > 0) {
      allPages.push(popped);
    }
  }

  return allPages;
}

interface OfferDocumentProps {
  offer: DaneOferty;
}

export default function OfferDocument({ offer }: OfferDocumentProps) {
  // Extract and normalize stations
  const stacje = offer.stacje && offer.stacje.length > 0 ? offer.stacje : [
    {
      id: 'default',
      post_temat: offer.post_temat || 'POST __________',
      offer_type: offer.offer_type || 'stacja_nz',
      budynek: offer.budynek,
      rozdzielnica_sn: offer.rozdzielnica_sn,
      rozdzielnica_nn: offer.rozdzielnica_nn,
      telemechanika: offer.telemechanika,
      polaczenia_kablowe: offer.polaczenia_kablowe,
      dodatkowe_elementy: offer.dodatkowe_elementy,
      cena: offer.cena,
      pomin_budynek_stacji: offer.pomin_budynek_stacji,
      pomin_rozdzielnice_SN: offer.pomin_rozdzielnice_SN,
      pomin_rozdzielnice_NN: offer.pomin_rozdzielnice_NN,
      pomin_telemechanike: offer.pomin_telemechanike,
      pomin_polaczenia_kablowe: offer.pomin_polaczenia_kablowe,
      pomin_tablice_licznikowa: offer.pomin_tablice_licznikowa,
      naglowek_stacji_tekst: offer.naglowek_stacji_tekst,
      tablica_licznikowa_tytul: offer.tablica_licznikowa_tytul,
      tablica_licznikowa_tekst: offer.tablica_licznikowa_tekst
    } as StacjaOferty
  ];

  // 2. Generate Page Definitions Dynamically
  const stationPagesDefinitions: PageDefinition[] = [];
  
  const allStationPagesContent = partitionAllStations(stacje);

  allStationPagesContent.forEach((blocks, pageIdx) => {
    stationPagesDefinitions.push({
      id: `station-page-${pageIdx}`,
      type: 'station',
      pageNum: 0, // Assigned below
      blocks
    });
  });

  const pages: PageDefinition[] = [];

  // Page 1: Cover Page
  pages.push({
    id: 'cover',
    type: 'cover',
    pageNum: 1
  });

  // Station Pages
  stationPagesDefinitions.forEach((p, idx) => {
    pages.push({
      ...p,
      pageNum: idx + 2
    });
  });

  const totalPages = pages.length;

  // Totals calculations
  const totalNetto = stacje.reduce((acc, st) => {
    const val = parsePrice(st.cena?.cena_netto);
    return acc + val;
  }, 0);

  const totalBrutto = stacje.reduce((acc, st) => {
    const bVal = parsePrice(st.cena?.cena_brutto);
    const nVal = parsePrice(st.cena?.cena_netto);
    const finalB = bVal > 0 ? bVal : Math.round(nVal * 1.23);
    return acc + finalB;
  }, 0);

  const totalVat = totalBrutto > totalNetto ? totalBrutto - totalNetto : Math.round(totalNetto * 0.23);

  const formatPLN = (amount: number) => {
    return amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
  };

  const formatPriceField = (rawPrice: string | undefined | null, suffix: string = '') => {
    if (!rawPrice) return '0,00 zł';
    const clean = String(rawPrice).trim();
    const numericVal = parsePrice(clean);
    const isNumeric = /^[0-9\s.,złzŁ]*$/i.test(clean);
    
    if (isNumeric && numericVal > 0) {
      return formatPLN(numericVal) + suffix;
    }
    return clean + suffix;
  };

  // Shared Page Header Component
  const PageHeader = ({ pageNum }: { pageNum: number }) => (
    <header className="absolute top-[10mm] left-[20mm] right-[20mm] h-[26mm] border-b border-zinc-200 flex justify-between items-center box-border select-none pointer-events-none">
      <EncoLogo className="h-16 w-auto" />
      <div className="text-right text-[11px] font-bold text-slate-500 font-mono flex items-center gap-3">
        <span>OFERTA HANDLOWA ENCO</span>
        <span className="text-slate-300">|</span>
        <span>NR: {offer.numer_oferty || '__________'}</span>
      </div>
    </header>
  );

  // Shared Page Footer Component
  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <footer className="absolute bottom-[10mm] left-[20mm] right-[20mm] h-[28mm] border-t border-dashed border-zinc-300 pt-1 flex items-center justify-between box-border select-none pointer-events-none font-sans">
      {/* Left Column - Grupa ENCO badge/logo stripe (Enlarged 2x) */}
      <div className="h-20 w-72 flex-shrink-0 flex items-stretch rounded-r-xl overflow-hidden border border-zinc-200 shadow-md">
        <div className="w-3 bg-[#8C051D]" />
        <div className="flex-1 bg-[#004a99] px-4 flex flex-col justify-center items-center text-center">
          <span className="text-[14px] font-black text-white tracking-wider leading-tight block">www.grupaenco.pl</span>
          <span className="text-[13px] font-black text-white tracking-wider leading-tight mt-1 block">enco@grupaenco.pl</span>
        </div>
      </div>

      {/* Center Column - Company details */}
      <div className="flex-1 text-center text-[9.5px] leading-snug text-zinc-700 flex flex-col justify-center px-3">
        <div className="font-extrabold text-zinc-950 text-[10.5px]">ENCO Sp. z o.o., ul. Postępu 13, 02-676 Warszawa</div>
        <div className="font-bold text-zinc-800 text-[9.5px] mt-0.5">
          tel. +48 22 543 72 00 <span className="text-zinc-400 font-normal">|</span> +48 22 543 72 61 <span className="text-zinc-400 font-normal">|</span> fax. +48 22 543 72 10
        </div>
        <div className="font-bold text-zinc-800 text-[9.5px]">
          NIP: 5260208154 <span className="text-zinc-400 font-normal">|</span> REGON: 001386579
        </div>
      </div>

      {/* Right Column - Page indicators */}
      <div className="text-right font-extrabold text-zinc-600 text-[10.5px] flex-shrink-0 flex flex-col justify-center">
        <div>OFERTA ENCO</div>
        <div className="text-zinc-400 font-mono font-medium text-[9.5px]">Strona {pageNum} z {totalPages}</div>
      </div>
    </footer>
  );

  return (
    <div id="print-container" className="w-full flex flex-col items-center space-y-8 bg-slate-200/40 py-6 print:py-0 print:space-y-0 print:bg-white">
      {pages.map((page) => {
        if (page.type === 'cover') {
          return (
            <div 
              key={page.id}
              id="print-page-1" 
              className="print-page cover-page w-[210mm] h-[297mm] min-h-[297mm] bg-white text-slate-800 pt-[38mm] px-[20mm] pb-[38mm] flex flex-col justify-between shrink-0 font-sans shadow-lg print:shadow-none border-t-8 border-[#004a99] relative overflow-hidden box-border"
            >
              <header className="absolute top-[10mm] left-[20mm] right-[20mm] h-[26mm] border-b border-zinc-200 flex justify-between items-center box-border select-none pointer-events-none">
                <EncoLogo className="h-16 w-auto" />
                <div className="text-right text-[10px] leading-relaxed text-zinc-700 font-sans">
                  <div className="font-extrabold text-zinc-900 uppercase text-[11px]">ENCO Sp. z o.o.</div>
                  <div>ul. Postępu 13, 02-676 Warszawa</div>
                  <div>tel. +48 22 543 72 00 | fax. +48 22 543 72 10</div>
                  <div>enco@grupaenco.pl | www.grupaenco.pl</div>
                </div>
              </header>

              <div className="content flex-1 flex flex-col justify-between py-6 overflow-visible">
                <div>
                  <div className="flex justify-between text-base text-zinc-800 mb-6 font-mono">
                    <div>
                      <span className="font-bold font-sans">L. Dz. </span>
                      <span className="font-semibold">{offer.numer_oferty || '__________'}</span>
                    </div>
                    <div>
                      <span className="font-sans">Warszawa, dnia </span>
                      <span className="font-semibold">{offer.data_oferty || '__________'}</span>
                    </div>
                  </div>

                  <div className="mb-8 max-w-lg text-base space-y-1.5">
                    <h3 className="font-extrabold text-lg text-zinc-950 border-b-2 border-zinc-400 pb-1 uppercase tracking-wide">{offer.klient_nazwa || 'Nazwa Klienta'}</h3>
                    <p className="font-semibold text-zinc-950 text-[15px]">{offer.klient_adres || 'Ulica i nr'}</p>
                    <p className="font-semibold text-zinc-950 text-[15px]">{offer.klient_miejscowosc_kod || 'Kod i Miejscowość'}</p>
                    {offer.klient_osoba_kontaktowa && (
                      <div className="pt-2 text-zinc-950 font-medium">
                        <span className="font-extrabold text-lg text-zinc-950 border-b-2 border-zinc-400 pb-1 uppercase tracking-wide">Sz. P. {offer.klient_osoba_kontaktowa}</span>
                      </div>
                    )}
                    {(offer.klient_telefon || offer.klient_email) && (
                      <div className="text-zinc-700 pt-1.5 text-[13.5px] font-mono">
                        {offer.klient_telefon && <div>tel. {offer.klient_telefon}</div>}
                        {offer.klient_email && <div>e-mail: {offer.klient_email}</div>}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="bg-[#FFFED4] border-l-4 border-amber-400 px-4 py-3 font-bold text-[15px] text-zinc-900 inline-block rounded shadow-sm leading-relaxed">
                      {offer.dot_tekst !== undefined && offer.dot_tekst.trim() !== "" 
                        ? offer.dot_tekst 
                        : `Dot. Dostawy stacji transformatorowej do ${Array.from(new Set(stacje.map(s => s.post_temat).filter(Boolean))).join(', ')}`}
                    </div>
                  </div>
                </div>

                <div className="my-auto py-4">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-black tracking-widest text-zinc-950 uppercase font-heading">
                      {offer.tytul_oferty || 'OFERTA DO ZAKUPU'}
                    </h2>
                    <div className="w-28 h-1 bg-enco-blue mx-auto mt-3"></div>
                  </div>

                  <p className="text-xl text-zinc-800 leading-relaxed text-justify pb-2 font-medium">
                    {offer.wstep_tekst !== undefined && offer.wstep_tekst.trim() !== "" ? (
                      offer.wstep_tekst
                    ) : (
                      <>
                        ENCO Sp. z o.o. {((offer.tytul_oferty || 'OFERTA DO ZAKUPU').toUpperCase().includes('ZAKUP')) 
                          ? 'niniejszym składa ofertę do zakupu' 
                          : 'niniejszym składa ofertę'} na dostawę {stacje.length > 1 ? 'stacji transformatorowych w ilości ' + stacje.length + ' szt.' : 'stacji transformatorowej'}, zgodnie z przedstawionymi założeniami i poniższym opisem technicznym.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <PageFooter pageNum={1} />
            </div>
          );
        } else {
          // page.type === 'station'
          return (
            <div 
              key={page.id}
              id={`print-page-${page.pageNum}`}
              className="print-page w-[210mm] h-[297mm] min-h-[297mm] bg-white text-slate-800 pt-[38mm] px-[20mm] pb-[38mm] flex flex-col justify-between shrink-0 font-sans shadow-lg print:shadow-none border-t-8 border-[#004a99] relative box-border"
            >
              <div className="flex-1 flex flex-col justify-start max-h-[221mm] overflow-hidden">
                <PageHeader pageNum={page.pageNum} />

                <div className="space-y-3 flex-1 flex flex-col justify-start max-h-[221mm] overflow-hidden">
                  {page.blocks!.map((block, bIdx) => {
                    switch (block.type) {
                      case 'station_title':
                        return (
                          <div key={bIdx} className="bg-[#E4ECF4] border-l-4 border-[#004a99] p-2.5 rounded-r mb-3 select-none mt-2 first:mt-0">
                            <h3 className="text-[11px] font-extrabold text-[#004a99] uppercase tracking-wider">
                              {getStationHeader(block.stacja!, block.stacjaIdx || 0)}
                            </h3>
                          </div>
                        );

                      case 'building':
                      case 'building_header':
                        return (
                          <div key={bIdx} className="space-y-1 pl-2 section flex flex-col w-full mt-2">
                            <h4 className="font-bold text-xs text-zinc-900 tracking-wide uppercase border-b border-zinc-100 pb-0.5 section-title">
                              I. OBUDOWA / BUDYNEK STACJI ({block.stacja?.budynek?.typ_budynku || 'ŻELBETOWY'}){block.isContinuation ? ' (CIĄG DALSZY)' : ''}
                            </h4>
                          </div>
                        );

                      case 'building_items':
                        return (
                          <div key={bIdx} className="space-y-1.5 pl-2 section flex flex-col w-full">
                            <ul className="text-[11px] text-zinc-700 space-y-1 pl-2 list-none font-sans leading-relaxed section-content w-full">
                              {block.buildingSubItems?.map((sub, sIdx) => {
                                if (sub.type === 'basic') {
                                  const b = block.stacja?.budynek;
                                  if (!b) return null;
                                  return (
                                    <React.Fragment key={sIdx}>
                                      <li className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words">Konstrukcja budynku: <strong className="text-zinc-900">{b.konstrukcja_budynku || 'żelbetowa z betonu C35/45'}</strong></span>
                                      </li>
                                      {b.sciany_rei120_ilosc && 
                                       b.sciany_rei120_ilosc !== '0' && 
                                       b.sciany_rei120_ilosc !== 'brak' && 
                                       b.sciany_rei120_ilosc.trim() !== '' && (
                                        <li className="flex items-start gap-1 w-full">
                                          <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                          <span className="flex-1 min-w-0 break-words">Ściany o klasie odporności ogniowej {b.sciany_rei_klasa || 'REI 120'}: <strong className="text-zinc-900">{b.sciany_rei120_ilosc}</strong></span>
                                        </li>
                                      )}
                                      <li className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words">Wymiary: <strong className="text-zinc-900">{b.wymiary_dlugosc || '0'} m x {b.wymiary_szerokosc || '0'} m x {b.wymiary_wysokosc || '0'} m ({b.wymiary_wysokosc_typ === 'wewnetrzna' ? 'wys. wewnętrzna' : 'wys. zewnętrzna'})</strong></span>
                                      </li>
                                      <li className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words">Dach: <strong className="text-zinc-900">{b.typ_dachu === 'brak' ? 'brak dachu' : `${b.typ_dachu || 'kopertowy'} dach betonowy`}{b.dach_rei120 && b.typ_dachu !== 'brak' ? ` o klasie odporności ogniowej ${b.dach_rei_klasa || 'REI 120'}` : ''}</strong></span>
                                      </li>
                                      <li className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words">Fundament: monolityczny z wydzieloną misą olejową i systemem przepustów</span>
                                      </li>
                                    </React.Fragment>
                                  );
                                }
                                if (sub.type === 'przepusty') {
                                  const b = block.stacja?.budynek;
                                  if (!b) return null;
                                  return (
                                    <li key={sIdx} className="block w-full">
                                      <div className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words text-zinc-700 font-semibold">Zintegrowane przepusty dedykowane:</span>
                                      </div>
                                      <div className="pl-4 space-y-1 mt-0.5 w-full">
                                        <div className="flex items-start gap-1 text-[10.5px] w-full">
                                          <span className="text-zinc-400 mr-1 select-none shrink-0">•</span>
                                          <span className="flex-1 min-w-0 break-words">Przepusty nN: <strong className="text-zinc-950">{b.przepusty_nn || '0'}x {b.przepusty_nn_typ || 'BWS 100'}</strong></span>
                                        </div>
                                        <div className="flex items-start gap-1 text-[10.5px] w-full">
                                          <span className="text-zinc-400 mr-1 select-none shrink-0">•</span>
                                          <span className="flex-1 min-w-0 break-words">Przepusty SN: <strong className="text-zinc-950">{b.przepusty_sn || '0'}x {b.przepusty_sn_typ || 'BWS 150'}</strong></span>
                                        </div>
                                        <div className="flex items-start gap-1 text-[10.5px] w-full">
                                          <span className="text-zinc-400 mr-1 select-none shrink-0">•</span>
                                          <span className="flex-1 min-w-0 break-words">Przepusty uziemiające: <strong className="text-zinc-950">{b.przepusty_uziemienie || '0'}x {b.przepusty_uziemienie_typ || 'HEA'}</strong></span>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                }
                                if (sub.type === 'instalacja_ral') {
                                  const b = block.stacja?.budynek;
                                  if (!b) return null;
                                  return (
                                    <React.Fragment key={sIdx}>
                                      <li className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words">Wewnętrzna instalacja uziemiająca i oświetleniowa (standard)</span>
                                      </li>
                                      {b.powloka_antygraffiti && (
                                        <li className="flex items-start gap-1 w-full">
                                          <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                          <span className="flex-1 min-w-0 break-words">Tynk zewnętrzny baranek pokryty hydrofobową <b>powłoką antygraffiti</b></span>
                                        </li>
                                      )}
                                      <li className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <span className="flex-1 min-w-0 break-words">Kolory RAL: obudowa <strong className="text-zinc-900">{b.kolor_obudowa || 'standard'}</strong>, stolarka/drzwi/dach <strong className="text-zinc-900">{b.kolor_slusarka || 'standard'}</strong></span>
                                      </li>
                                    </React.Fragment>
                                  );
                                }
                                if (sub.type === 'drzwi') {
                                  if (!sub.lines || sub.lines.length === 0) return null;
                                  return (
                                    <li key={sIdx} className="block w-full">
                                      <div className="flex items-start gap-1 w-full">
                                        <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                        <div className="flex-1 min-w-0">
                                          <span className="block text-zinc-750 font-semibold">Stolarka drzwiowa i wentylacja:</span>
                                          <div className="pl-3 text-zinc-650 font-medium leading-relaxed font-sans text-[10.5px] space-y-0.5 mt-0.5 w-full">
                                            {sub.lines.map((line, idx) => (
                                              <div key={idx} className="flex items-start gap-1 w-full">
                                                <span className="text-zinc-400 select-none mr-1 shrink-0">•</span>
                                                <span className="flex-1 min-w-0 break-words">{line}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                }
                                if (sub.type === 'dodatkowy_punkt') {
                                  if (!sub.text) return null;
                                  return (
                                    <li key={sIdx} className="flex items-start gap-1 w-full">
                                      <span className="text-zinc-400 mr-1.5 select-none shrink-0">—</span>
                                      <span className="flex-1 min-w-0 break-words">{sub.text}</span>
                                    </li>
                                  );
                                }
                                return null;
                              })}
                            </ul>
                          </div>
                        );

                      case 'sn_header':
                        return (
                          <div key={bIdx} className="space-y-1 pl-2 sn-header">
                            {block.isContinuation ? (
                              <div className="font-bold text-zinc-950 uppercase text-[11px] flex justify-between bg-slate-50/80 p-1.5 rounded border border-dashed border-zinc-150">
                                <span>{block.snNum}. ROZDZIELNICA SN - {block.stacja.rozdzielnica_sn!.typ_custom_opis || block.stacja.rozdzielnica_sn!.typ || 'Siemens'} (CIĄG DALSZY):</span>
                                <span className="text-[#004a99] text-[10px] font-mono">{block.stacja.rozdzielnica_sn!.parametry || '24 kV, 630 A, 16 kA/1s'}</span>
                              </div>
                            ) : (
                              <div className="font-bold text-zinc-950 uppercase text-[11px] flex justify-between bg-slate-50/80 p-1.5 rounded-t border border-zinc-150">
                                <span>{block.snNum}. ROZDZIELNICA SN ({block.stacja.rozdzielnica_sn!.ilosc_pol}) - {block.stacja.rozdzielnica_sn!.typ_custom_opis || block.stacja.rozdzielnica_sn!.typ || 'Siemens'}:</span>
                                <span className="text-[#004a99] text-[10px] font-mono">{block.stacja.rozdzielnica_sn!.parametry || '24 kV, 630 A, 16 kA/1s'}</span>
                              </div>
                            )}
                            {!block.isContinuation && block.stacja.rozdzielnica_sn!.izolacja && (
                              <div className="text-[10px] text-zinc-500 font-medium pl-2.5">
                                Izolacja: <span className="text-zinc-700 font-bold">{block.stacja.rozdzielnica_sn!.izolacja}</span>
                              </div>
                            )}
                          </div>
                        );

                      case 'sn_poles':
                        return (
                          <div key={bIdx} className="pl-4 pr-2 space-y-1">
                            {block.poles!.map((pole, pIdx) => (
                              <div key={pole.id || pIdx} className="flex items-start gap-1.5 pl-1 text-[11px]">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <span className="font-bold text-zinc-850 text-[10.5px]">{pole.nazwa || 'Pole'}</span>{' '}
                                  <span className="text-zinc-700">({pole.ilosc ? (pole.ilosc.includes('szt') ? pole.ilosc : `${pole.ilosc} szt.`) : '1 szt.'})</span>
                                  {pole.wyposazenie && (
                                    <span className="text-zinc-500 text-[9.5px] leading-normal pl-1.5">
                                      — {pole.wyposazenie}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );

                      case 'sn_additional':
                        return (
                          <div key={bIdx} className="pl-5 pr-2 mt-1.5 first:mt-0 pt-1 border-t first:border-t-0 border-zinc-200">
                            <span className="font-bold text-zinc-800 text-[10px] uppercase">
                              Pozostałe elementy wyposażenia SN{block.isContinuation ? ' (CIĄG DALSZY)' : ''}:
                            </span>
                            <div className="space-y-0.5 mt-0.5">
                              {block.items!.map((item, idx) => item && item.trim() && (
                                <div key={idx} className="flex items-start gap-1.5 pl-1 text-[11px]">
                                  <span className="text-zinc-400 shrink-0 select-none">—</span>
                                  <span className="text-zinc-600 text-[10.5px]">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );

                      case 'sn_fallback':
                        return (
                          <div key={bIdx} className="pl-4 pr-2 space-y-1 text-[11px] leading-relaxed">
                            {block.stacja.rozdzielnica_sn!.pol_liniowe && (
                              <div className="flex items-start gap-1.5 pl-1">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <b>Pola liniowe:</b> {block.stacja.rozdzielnica_sn!.pol_liniowe}
                                </div>
                              </div>
                            )}
                            {block.stacja.rozdzielnica_sn!.pol_transformatorowe && (
                              <div className="flex items-start gap-1.5 pl-1">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <b>Pole transformatorowe:</b> {block.stacja.rozdzielnica_sn!.pol_transformatorowe}
                                </div>
                              </div>
                            )}
                            {block.stacja.rozdzielnica_sn!.pol_niestandardowe && (
                              <div className="bg-amber-500/5 text-amber-900 p-1.5 rounded font-mono text-[10px] mt-1 border border-amber-250/50 whitespace-pre-line leading-normal">
                                {block.stacja.rozdzielnica_sn!.pol_niestandardowe}
                              </div>
                            )}
                          </div>
                        );

                      case 'nn_header':
                        return (
                          <div key={bIdx} className="space-y-1 pl-2 nn-header">
                            {block.isContinuation ? (
                              <div className="font-bold text-zinc-950 uppercase text-[11px] flex justify-between bg-slate-50/80 p-1.5 rounded border border-dashed border-zinc-150">
                                <span>{block.nnNum}. ROZDZIELNICA nN (CIĄG DALSZY):</span>
                                <span className="text-[#004a99] font-bold text-[10px]">
                                  {block.stacja.rozdzielnica_nn!.ilosc_pol ? (block.stacja.rozdzielnica_nn!.ilosc_pol.toLowerCase().includes('pol') || block.stacja.rozdzielnica_nn!.ilosc_pol.toLowerCase().includes('odpł') ? block.stacja.rozdzielnica_nn!.ilosc_pol : `${block.stacja.rozdzielnica_nn!.ilosc_pol}-polowa`) : '12-polowa'}
                                </span>
                              </div>
                            ) : (
                              <div className="font-bold text-zinc-950 uppercase text-[11px] flex justify-between bg-slate-50/80 p-1.5 rounded-t border border-zinc-150 mt-2">
                                <span>{block.nnNum}. ROZDZIELNICA nN:</span>
                                <span className="text-[#004a99] font-bold text-[10px]">
                                  {block.stacja.rozdzielnica_nn!.ilosc_pol ? (block.stacja.rozdzielnica_nn!.ilosc_pol.toLowerCase().includes('pol') || block.stacja.rozdzielnica_nn!.ilosc_pol.toLowerCase().includes('odpł') ? block.stacja.rozdzielnica_nn!.ilosc_pol : `${block.stacja.rozdzielnica_nn!.ilosc_pol}-polowa`) : '12-polowa'}
                                </span>
                              </div>
                            )}
                          </div>
                        );

                      case 'nn_poles':
                        return (
                          <div key={bIdx} className="pl-4 pr-2 space-y-1 text-[11px]">
                            {block.poles!.map((pole, pIdx) => (
                              <div key={pole.id || pIdx} className="flex items-start gap-1.5 pl-1">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <span className="font-bold text-zinc-800">{pole.nazwa || 'Wyposażenie'}:</span>{' '}
                                  <span className="text-zinc-700">{pole.parametry}</span>
                                  {pole.ilosc && <span className="text-zinc-400 text-[10px] font-mono ml-1.5">(ilość: {pole.ilosc})</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        );

                      case 'nn_fallback':
                        return (
                          <div key={bIdx} className="pl-4 pr-2 space-y-1 text-[11px] leading-relaxed">
                            {block.stacja.rozdzielnica_nn!.rozlacznik_niestandardowy_opis && (
                              <div className="flex items-start gap-1.5 pl-1">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <b>Zasilanie:</b> {block.stacja.rozdzielnica_nn!.rozlacznik_niestandardowy_opis}
                                </div>
                              </div>
                            )}
                            {(block.stacja.rozdzielnica_nn!.przydzial_630a || block.stacja.rozdzielnica_nn!.przydzial_400a) && (
                              <div className="flex items-start gap-1.5 pl-1">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <b>Odpływy bezpiecznikowe: </b> 
                                  {[block.stacja.rozdzielnica_nn!.przydzial_630a, block.stacja.rozdzielnica_nn!.przydzial_400a].filter(Boolean).join(', ')}
                                </div>
                              </div>
                            )}
                            {block.stacja.rozdzielnica_nn!.custom_punkty?.map((pt) => pt.etykieta && (
                              <div key={pt.id} className="flex items-start gap-1.5 pl-1">
                                <span className="text-[#004a99] font-bold shrink-0 select-none">•</span>
                                <div className="flex-1">
                                  <b>{pt.etykieta}:</b> {pt.wartosc}
                                </div>
                              </div>
                            ))}
                          </div>
                        );

                      case 'tablica':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed pl-2 mt-2">
                            <div className="font-bold text-zinc-950 uppercase text-[11px]">{block.tablicaNum}. {block.stacja.tablica_licznikowa_tytul || 'TABLICA LICZNIKOWA'}</div>
                            <p className="text-zinc-650 ml-3 font-medium text-justify">
                              {block.stacja.tablica_licznikowa_tekst || 'Zintegrowana, przygotowana fabrycznie.'}
                            </p>
                          </div>
                        );

                      case 'telemechanika':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed bg-[#004a99]/5 p-2 rounded border border-[#004a99]/10 mt-2 ml-2">
                            <div className="font-semibold text-[#004a99] text-[11px]">
                              {block.teleNum}. MODUŁ TELEMECHANIKI & TELEMETRII (RTU):
                            </div>
                            <div className="text-[#0E385C] font-semibold ml-3 text-[10.5px]">
                              Zastosowano sterownik {block.stacja.telemechanika!.sterownik || 'RTU7M'} oraz telemetryczny system {block.stacja.telemechanika!.sensory || 'przekładników'}.
                            </div>
                          </div>
                        );

                      case 'polaczenia_kablowe':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed pl-2 mt-2">
                            <div className="font-bold text-zinc-950 uppercase text-[11px]">{block.kableNum}. MOSTY KABLOWE WEWNĘTRZNE:</div>
                            <div className="ml-3 space-y-0.5 text-zinc-650 font-medium font-sans">
                              {block.stacja.polaczenia_kablowe!.most_sn && <div>• SN: {block.stacja.polaczenia_kablowe!.most_sn}</div>}
                              {block.stacja.polaczenia_kablowe!.most_nn && <div>• nN: {block.stacja.polaczenia_kablowe!.most_nn}</div>}
                              {block.stacja.polaczenia_kablowe!.inne && block.stacja.polaczenia_kablowe!.inne.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                                <div key={idx} className="text-zinc-500 italic">• {line}</div>
                              ))}
                            </div>
                          </div>
                        );

                      case 'dodatkowe_elementy':
                      case 'de_header':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed pl-2 mt-2">
                            <div className="font-bold text-zinc-950 uppercase text-[11px]">
                              {block.customNum}. DOSTARCZANE ELEMENTY DODATKOWE{block.isContinuation ? ' (CIĄG DALSZY)' : ''}:
                            </div>
                          </div>
                        );

                      case 'de_items':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed pl-2 !mt-0.5">
                            <ul className="ml-3 list-none space-y-0.5 font-medium">
                              {block.items?.map((accItem, keyA) => (
                                <li key={keyA} className="flex items-start">
                                  <span className="text-emerald-600 mr-2">✓</span>
                                  <span className="text-zinc-650 whitespace-pre-wrap">{accItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );

                      case 'dostawa_nie_obejmuje':
                      case 'dno_header':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed bg-rose-50/40 p-2 rounded-t border border-rose-100/50 border-b-0 mt-2 ml-2 w-full max-w-[165mm]">
                            <div className="font-bold text-rose-900 uppercase text-[11px]">
                              Dostawa tej pozycji NIE obejmuje{block.isContinuation ? ' (CIĄG DALSZY)' : ''}:
                            </div>
                          </div>
                        );

                      case 'dno_items':
                        return (
                          <div key={bIdx} className="text-[11px] leading-relaxed bg-rose-50/40 px-2 pt-0.5 pb-[1px] rounded-b border border-rose-100/50 border-t-0 ml-2 w-full max-w-[165mm] !mt-0">
                            <ul className="ml-3 list-none space-y-0.5 font-semibold">
                              {block.items?.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-rose-600 mr-2">✗</span>
                                  <span className="text-zinc-700 whitespace-pre-wrap">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );

                      case 'cena_jednostkowa': {
                        const customEtykieta = block.stacja?.cena?.etykieta_ceny || offer.cena_netto_etykieta;
                        const labelText = customEtykieta && customEtykieta.trim() !== '' 
                          ? customEtykieta 
                          : 'Cena pozycji netto:';

                        const defaultStationHeader = block.stacja ? getStationHeader(block.stacja, block.stacjaIdx || 0) : `Pozycja ${block.stacjaIdx !== undefined ? block.stacjaIdx + 1 : ''}`;
                        const customOpis = block.stacja?.cena?.opis_ceny;
                        const subText = customOpis && customOpis.trim() !== ''
                          ? customOpis
                          : `(${defaultStationHeader})`;

                        return (
                          <div key={bIdx} className="!mt-2 pt-2.5 flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 w-full cena-jednostkowa-box">
                            <div className="flex flex-col shrink-0 min-w-0 pr-4 cena-left-col">
                              <span className="text-[10px] uppercase font-extrabold text-slate-550 tracking-wider whitespace-nowrap">{labelText}</span>
                              <span className="text-[9px] font-bold text-slate-400 truncate">{subText}</span>
                            </div>
                            <div className="text-right shrink-0 whitespace-nowrap cena-right-col">
                              <div className="text-base font-black text-[#004a99] whitespace-nowrap">
                                {formatPriceField(block.stacja?.cena?.cena_netto, ' netto')}
                              </div>
                              {parsePrice(block.stacja?.cena?.cena_netto) > 0 && (
                                <div className="text-[9px] font-bold text-slate-500 whitespace-nowrap">
                                  + VAT = {formatPriceField(parsePrice(block.stacja?.cena?.cena_brutto) > 0 ? block.stacja?.cena?.cena_brutto : String(Math.round(parsePrice(block.stacja?.cena?.cena_netto) * 1.23)), ' brutto')}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      case 'summary_table':
                        return (
                          <div key={bIdx} className="space-y-2 pl-2 mt-4 break-inside-avoid">
                            <h4 className="font-extrabold text-xs text-[#004a99] uppercase tracking-wider border-b border-zinc-200 pb-0.5">
                              ZESTAWIENIE URZĄDZEŃ I CEN ELEMENTÓW:
                            </h4>
                            <div className="border border-zinc-200 rounded-lg overflow-hidden flex flex-col bg-white">
                              <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex justify-between items-center font-extrabold text-[10px] text-zinc-700 uppercase tracking-wider">
                                <span>Nazwa / Typ stacji transformatorowej</span>
                                <span className="whitespace-nowrap">Wartość netto stacji</span>
                              </div>
                              <div className="divide-y divide-zinc-150">
                                {stacje.map((st, idx) => (
                                  <div key={st.id} className="px-4 py-2 flex justify-between items-center text-xs text-zinc-805 bg-white">
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-zinc-900">{getStationHeader(st, idx)}</span>
                                      <span className="text-[10px] text-zinc-550 font-medium">Typ: {st.budynek?.typ_budynku || 'NZ'} | Obudowa: {st.budynek?.wymiary_dlugosc || '0'}x{st.budynek?.wymiary_szerokosc || '0'}m</span>
                                    </div>
                                    <span className="font-extrabold text-slate-900 whitespace-nowrap shrink-0 ml-4">
                                      {formatPriceField(st.cena?.cena_netto)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );

                      case 'totals_box':
                        return (
                          <div key={bIdx} id="preview-section-total-cena" className="pt-4 pl-2 mt-4 mb-4 shrink-0 break-inside-avoid">
                            <div className="flex flex-col space-y-1 justify-end items-end bg-slate-50 p-4 rounded-lg border border-slate-200 total-cena-box">
                              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-550 text-right whitespace-nowrap total-cena-label">
                                {offer.cena_netto_etykieta !== undefined && offer.cena_netto_etykieta.trim() !== "" 
                                  ? offer.cena_netto_etykieta 
                                  : (stacje.length > 1 
                                    ? "ŁĄCZNA WARTOŚĆ NETTO CAŁOŚCI OFEROWANYCH URZĄDZEŃ:" 
                                    : "ŁĄCZNA WARTOŚĆ OFERTY NETTO:")}
                              </div>
                              <div className="text-xl font-extrabold text-[#004a99] underline decoration-2 decoration-enco-blue underline-offset-4 tracking-wide font-heading text-right whitespace-nowrap w-full total-cena-value">
                                {totalNetto > 0 ? formatPLN(totalNetto) : (stacje[0]?.cena?.cena_netto || '0,00 zł')}
                              </div>
                              {totalNetto > 0 && (
                                <div className="text-[10px] text-slate-550 mt-1 uppercase font-bold text-right whitespace-nowrap total-cena-tax">
                                  + podatek VAT 23% ({formatPLN(totalVat)}) = <span className="text-slate-900">{formatPLN(totalBrutto)} BRUTTO</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );

                      case 'owh_signature_box':
                        return (
                          <div key={bIdx} className="space-y-4 pl-2 pt-0.5 mt-3 break-inside-avoid">
                            {/* OGÓLNE WARUNKI HANDLOWE */}
                            <div className="space-y-2.5">
                              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-widest font-heading font-sans">OGÓLNE WARUNKI HANDLOWE</h4>
                              
                              <div className="text-[10px] text-slate-700 space-y-1 leading-normal font-semibold font-sans">
                                <div>
                                  <span className="font-extrabold text-slate-900">Termin dostawy:</span> {offer.termin_dostawy || '12 tygodni od zamówienia i zatwierdzenia rysunków'}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900">Warunki dostawy:</span> {offer.warunki_dostawy || 'na miejsce wskazane przez Zamawiającego'}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900">Warunki gwarancji:</span> {offer.warunki_gwarancji || '36 miesięcy od daty odbioru'}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900">Warunki płatności:</span> {offer.warunki_platnosci || 'przelew 30 dni'}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900">Ważność oferty:</span> {offer.waznosc_oferty || '30 dni od daty wystawienia'}
                                </div>
                              </div>
                              
                              <p className="text-[10px] text-slate-600 pt-0.5 italic font-medium font-sans leading-snug">
                                Mamy głęboką nadzieję, że nasza zaktualizowana oferta spełni Państwa wymagania techniczne i handlowe. Z chęcią odpowiemy na dodatkowe pytania.
                              </p>
                            </div>

                            {/* PODPIS AUTORYZACYJNY */}
                            <div className="pt-2 flex justify-end">
                              <div className="border border-slate-200 rounded-lg p-3 w-64 bg-slate-50 text-[11px] text-slate-700 shadow-sm leading-tight font-sans">
                                <p className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wide">Ofertę autoryzował:</p>
                                <p className="font-extrabold text-[#004a99] text-xs">{offer.osoba_zatwierdzajaca || 'Barbara Baprawska'}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">tel: {offer.osoba_zatwierdzajaca_telefon || '(22) 543 72 31'}</p>
                                <p className="text-[10px] text-slate-500 font-mono">e-mail: {offer.osoba_zatwierdzajaca_email || 'bbaprawska@grupaenco.pl'}</p>
                                
                                <div className="mt-5 border-t border-dashed border-slate-250 pt-3 text-[9px] text-slate-400 font-mono flex justify-between items-end">
                                  <span>Autoryzacja:</span>
                                  <span className="italic tracking-widest text-[8px] text-slate-405 font-bold uppercase font-sans">Podpis cyfrowy ENCO</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );

                      case 'owh_box':
                        return (
                          <div key={bIdx} className="space-y-2.5 pl-2 pt-0.5 mt-3 break-inside-avoid">
                            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-widest font-heading font-sans">OGÓLNE WARUNKI HANDLOWE</h4>
                            
                            <div className="text-[10px] text-slate-700 space-y-1 leading-normal font-semibold font-sans">
                              <div>
                                <span className="font-extrabold text-slate-900">Termin dostawy:</span> {offer.termin_dostawy || '12 tygodni od zamówienia i zatwierdzenia rysunków'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900">Warunki dostawy:</span> {offer.warunki_dostawy || 'na miejsce wskazane przez Zamawiającego'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900">Warunki gwarancji:</span> {offer.warunki_gwarancji || '36 miesięcy od daty odbioru'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900">Warunki płatności:</span> {offer.warunki_platnosci || 'przelew 30 dni'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900">Ważność oferty:</span> {offer.waznosc_oferty || '30 dni od daty wystawienia'}
                              </div>
                            </div>
                            
                            <p className="text-[10px] text-slate-600 pt-0.5 italic font-medium font-sans leading-snug">
                              Mamy nadzieję, że nasza zaktualizowana oferta spełni Państwa wymagania techniczne i handlowe. Z chęcią odpowiemy na dodatkowe pytania.
                            </p>
                          </div>
                        );

                      case 'signature_box':
                        return (
                          <div key={bIdx} className="pt-4 flex justify-end mt-4 break-inside-avoid">
                            <div className="border border-slate-200 rounded-lg p-3 w-64 bg-slate-50 text-[11px] text-slate-700 shadow-sm leading-tight font-sans">
                              <p className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wide">Ofertę autoryzował:</p>
                              <p className="font-extrabold text-[#004a99] text-xs">{offer.osoba_zatwierdzajaca || 'Barbara Baprawska'}</p>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono">tel: {offer.osoba_zatwierdzajaca_telefon || '(22) 543 72 31'}</p>
                              <p className="text-[10px] text-slate-500 font-mono">e-mail: {offer.osoba_zatwierdzajaca_email || 'bbaprawska@grupaenco.pl'}</p>
                              
                              <div className="mt-5 border-t border-dashed border-slate-250 pt-3 text-[9px] text-slate-400 font-mono flex justify-between items-end">
                                <span>Autoryzacja:</span>
                                <span className="italic tracking-widest text-[8px] text-slate-405 font-bold uppercase font-sans"></span>
                              </div>
                            </div>
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </div>

              <PageFooter pageNum={page.pageNum} />
            </div>
          );
        }
      })}
    </div>
  );
}
