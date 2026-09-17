/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw, Check, Edit2
} from 'lucide-react';
import { getConstantLists, saveConstantLists, DEFAULT_CONSTANT_LISTS, ConstantLists } from '../dataConstants';

interface ConstantDataEditorProps {
  onBack: () => void;
  onUpdate?: () => void; // Tell App that constants changed
}

type CategoryKey = keyof ConstantLists;

interface CategoryInfo {
  key: CategoryKey;
  label: string;
  description: string;
}

const CATEGORIES: CategoryInfo[] = [
  { 
    key: 'typy_stacji', 
    label: 'Typy stacji transformatorowych', 
    description: 'Konfiguracja głównych typów stacji lub trybów systemowych (np. stacja_nz, stacja_bek).' 
  },
  { 
    key: 'typy_rozdzielnic_sn', 
    label: 'Typy rozdzielnic SN', 
    description: 'Predefiniowane modele rozdzielnic średniego napięcia wyświetlane w liście rozwijanej.' 
  },
  { 
    key: 'typy_pol_sn', 
    label: 'Typy zainstalowanych pól SN', 
    description: 'Propozycje zestawów / pól średniego napięcia wraz z wyposażeniem instalacyjnym.' 
  },
  { 
    key: 'typy_rozdzielnic_nn', 
    label: 'Standardy rozdzielnic nN', 
    description: 'Typy i konfiguracje odpływów rozdzielnic niskiego napięcia.' 
  },
  { 
    key: 'kolory_ral', 
    label: 'Kolory lakierów RAL / Ślusarki', 
    description: 'Standardowe odcienie lakierowania obudowy stacji, drzwi, krat i dachu.' 
  },
  { 
    key: 'typy_drzwi', 
    label: 'Typy ślusarki i drzwi (podpunkty)', 
    description: 'Baza predefiniowanych elementów ślusarki drzwiowej i krat wentylacyjnych.' 
  },
  { 
    key: 'typy_wentylacji', 
    label: 'Sposoby wentylacji stacji', 
    description: 'Rozwiązania chłodzenia stacji - wentylacja grawitacyjna, mechaniczna wymuszona.' 
  },
  { 
    key: 'typy_telemechaniki', 
    label: 'Zestawy telemechaniki RTU', 
    description: 'Sterowniki telemechaniki i opomiarowania systemów Smart-Grid.' 
  },
  { 
    key: 'typy_polaczen_kablowych', 
    label: 'Typy połączeń / mostów kablowych', 
    description: 'Zestawy mostów kablowych NN/SN między transformatorem a odpływami.' 
  },
  {
    key: 'dodatkowe_elementy',
    label: 'Opcje elementów dodatkowych stacji',
    description: 'Predefiniowane opcje dodatkowe objęte ofertą, wyświetlane z polami wyboru (checkbox).'
  },
  {
    key: 'dostawa_nie_obejmuje',
    label: 'Opcje wyłączeń dostawy (Dostawa NIE obejmuje)',
    description: 'Predefiniowane wyłączenia dostawy (zakres klienta), wyświetlane z polami wyboru (checkbox).'
  },
  {
    key: 'typy_aparatow_nn',
    label: 'Baza aparatów / bezpieczników nN',
    description: 'Predefiniowana baza proponowanych pól (aparatów bezpiecznikowych) do wyboru dla pól rozdzielnicy nN.'
  },
  {
    key: 'konstrukcje_budynku',
    label: 'Konstrukcje budynku',
    description: 'Predefiniowane opisy materiałowo-konstrukcyjne budynku stacji.'
  },
  {
    key: 'sciany_rei120_opcje',
    label: 'Ilość ścian o odporności ogniowej',
    description: 'Baza predefiniowanych wartości liczby ścian o odporności ogniowej.'
  },
  {
    key: 'sciany_rei_klasa_opcje',
    label: 'Klasy odporności ogniowej ścian (REI)',
    description: 'Klasy odporności ogniowej ścian zewnętrznych i wydzielających (np. REI 120, REI 60, REI 180).'
  },
  {
    key: 'dach_rei_klasa_opcje',
    label: 'Klasy odporności ogniowej dachu (REI)',
    description: 'Klasy odporności ogniowej dachu budynku (np. REI 120, REI 60).'
  },
  {
    key: 'typy_przepustow',
    label: 'Typy przepustów kablowych',
    description: 'Baza predefiniowanych typów przepustów kablowych i rurowych (np. BWS 100, BWS 150, HSI 90, HEA).'
  },
  {
    key: 'typy_dachow',
    label: 'Typy dachów budynku stacji',
    description: 'Dostępne rodzaje dachu: np. kopertowy, dwuspadowy, wannowy.'
  },
  {
    key: 'dodatkowe_punkty_budynku',
    label: 'Dodatkowe punkty budynku',
    description: 'Lista dodatkowych punktów technicznych/wyposażenia dla sekcji budynku (np. Wewnętrzna instalacja uziemiająca).'
  },
  {
    key: 'szczegolowe_opisy_sn',
    label: 'Szczegółowe opisy/modele rozdzielnic SN',
    description: 'Baza predefiniowanych i dostosowanych opisów modeli/zestawów rozdzielnic średniego napięcia.'
  },
  {
    key: 'parametry_rozdzielnic_sn',
    label: 'Parametry ogólne rozdzielnic SN',
    description: 'Baza predefiniowanych parametrów technicznych średniego napięcia (napięcia, prądy).'
  },
  {
    key: 'nazwy_pol_sn',
    label: 'Nazwy pojedynczych pól SN',
    description: 'Baza nazw pól rozdzielnicy SN (np. Pole liniowe, Pole transformatorowe).'
  },
  {
    key: 'wyposazenie_pol_sn',
    label: 'Wyposażenie pojedynczych pól SN',
    description: 'Baza opisów wyposażenia instalowanego w polach SN.'
  },
  {
    key: 'etykiety_ceny_pozycji',
    label: 'Etykiety nazwy ceny pozycji netto',
    description: 'Baza predefiniowanych nagłówków/etykiet dla ceny pozycji netto (np. Cena pozycji netto:, Cena stacji transformatorowej netto:).'
  },
  {
    key: 'opisy_ceny_pozycji',
    label: 'Opisy / dopiski do ceny pozycji',
    description: 'Baza predefiniowanych dopisków/opisów pod ceną pozycji (np. (bez transformatora), (loco plac budowy)).'
  }
];

export default function ConstantDataEditor({ onBack, onUpdate }: ConstantDataEditorProps) {
  const [lists, setLists] = useState<ConstantLists>(DEFAULT_CONSTANT_LISTS);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('typy_stacji');
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Load from database on mount
  useEffect(() => {
    setLists(getConstantLists());
  }, []);

  useEffect(() => {
    if (confirmReset) {
      const timer = setTimeout(() => {
        setConfirmReset(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [confirmReset]);

  const activeItems = lists[activeCategory] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    // Prevent duplicate values in the same array
    if (activeItems.includes(newItemText.trim())) {
      alert("Ta wartość już istnieje na liście.");
      return;
    }

    const updatedList = [...activeItems, newItemText.trim()];
    const updatedLists = {
      ...lists,
      [activeCategory]: updatedList
    };
    
    setLists(updatedLists);
    setNewItemText('');
  };

  const handleDeleteItem = (index: number) => {
    const updatedList = activeItems.filter((_, idx) => idx !== index);
    const updatedLists = {
      ...lists,
      [activeCategory]: updatedList
    };
    setLists(updatedLists);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedList = [...activeItems];
    const temp = updatedList[index];
    updatedList[index] = updatedList[index - 1];
    updatedList[index - 1] = temp;
    
    setLists({
      ...lists,
      [activeCategory]: updatedList
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === activeItems.length - 1) return;
    const updatedList = [...activeItems];
    const temp = updatedList[index];
    updatedList[index] = updatedList[index + 1];
    updatedList[index + 1] = temp;
    
    setLists({
      ...lists,
      [activeCategory]: updatedList
    });
  };

  const handleStartEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const updatedList = [...activeItems];
    updatedList[index] = editingText.trim();
    
    setLists({
      ...lists,
      [activeCategory]: updatedList
    });
    setEditingIndex(null);
  };

  const handleSaveAll = () => {
    saveConstantLists(lists);
    setSavedSuccess(true);
    if (onUpdate) {
      onUpdate();
    }
    // Dispatch custom event to notify all listeners
    window.dispatchEvent(new CustomEvent('enco-constants-updated'));
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleResetToDefault = () => {
    if (confirmReset) {
      setLists(DEFAULT_CONSTANT_LISTS);
      saveConstantLists(DEFAULT_CONSTANT_LISTS);
      if (onUpdate) onUpdate();
      // Dispatch custom event to notify all listeners
      window.dispatchEvent(new CustomEvent('enco-constants-updated'));
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div id="constant-data-editor-screen" className="flex-1 flex flex-col bg-slate-100 h-full overflow-hidden font-sans text-slate-800 no-print">
      
      {/* Top action header */}
      <div className="bg-[#1e293b] border-b border-slate-800 p-4 shrink-0 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wróć do Kreatora</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
          
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-enco-blue" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Baza danych stałych ENCO</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className={`flex items-center gap-1.5 text-xs transition-all cursor-pointer border px-3 py-1.5 rounded-lg font-bold shadow-xs ${
              confirmReset
                ? "bg-red-700 hover:bg-red-800 text-white border-red-500 animate-pulse scale-105"
                : "bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700"
            }`}
            title="Przywróć domyślne zestawy fabryczne"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${confirmReset ? "animate-spin" : ""}`} />
            <span>{confirmReset ? "Na pewno? Kliknij ponownie! ⚠️" : "Resetuj do fabrycznych"}</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 text-xs bg-enco-blue hover:bg-enco-blue-hover text-white py-1.5 px-4 rounded-lg font-semibold shadow-md transition-all cursor-pointer shrink-0"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-green-300" />
                <span>Zapisano w bazie!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Zapisz dane stałe</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left categories list */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0 p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Kategorie danych</h3>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setEditingIndex(null);
                }}
                className={`w-full text-left p-3 rounded-lg border text-xs font-semibold leading-normal transition-all cursor-pointer flex flex-col gap-1 ${
                  isActive 
                    ? 'bg-slate-50 border-enco-blue text-enco-navy shadow-xs' 
                    : 'bg-white border-slate-150 text-slate-650 hover:bg-slate-50/50 hover:text-slate-850'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] font-medium text-slate-400 line-clamp-2">
                  {cat.description}
                </span>
                <span className="text-[9px] text-slate-450 self-end mt-1 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                  {lists[cat.key]?.length || 0} opcji
                </span>
              </button>
            );
          })}
        </div>

        {/* Right content editor details */}
        <div className="flex-1 bg-slate-50/50 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div className="max-w-4xl space-y-6">
            
            {/* Category header info */}
            <div>
              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-slate-300 font-mono">
                Wybrana kategoria
              </span>
              <h1 className="text-xl font-heading font-extrabold text-slate-900 mt-2">
                {CATEGORIES.find(c => c.key === activeCategory)?.label}
              </h1>
              <p className="text-sm text-slate-550 mt-1 max-w-2xl leading-relaxed">
                {CATEGORIES.find(c => c.key === activeCategory)?.description}
              </p>
            </div>

            {/* Form to add new list entry */}
            <form onSubmit={handleAddItem} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Dodaj nową pozycję do listy predefiniowanej
                </label>
                <input 
                  type="text" 
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Wpisz tekst opcji technicznej..."
                  className="w-full bg-white border border-slate-250 rounded px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-enco-blue"
                />
              </div>
              <button
                type="submit"
                className="bg-enco-blue hover:bg-enco-blue-hover text-white flex items-center justify-center gap-1.5 px-4 h-9.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj opcję</span>
              </button>
            </form>

            {/* List of active entries */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-550 uppercase tracking-widest mb-2 pl-1">
                Aktualnie wyświetlane opcje rozwijane ({activeItems.length})
              </h3>
              
              {activeItems.map((item, index) => {
                const isEditing = editingIndex === index;
                return (
                  <div 
                    key={index}
                    className="flex bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs items-center p-3 gap-3 group transition-colors"
                  >
                    {/* Index label */}
                    <span className="w-7 text-center font-mono text-xs font-bold text-slate-400">
                      #{index + 1}
                    </span>

                    {/* Entry content (Editable) */}
                    <div className="flex-1 font-sans text-xs">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(index);
                              } else if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            className="flex-1 bg-white border border-enco-blue rounded-md px-3 py-1 font-medium text-xs text-slate-800 focus:outline-none focus:ring-0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(index)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors"
                            title="Zatwierdź zmianę"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-850 font-medium whitespace-pre-wrap">{item}</span>
                      )}
                    </div>

                    {/* Action buttons (Move Up, Move Down, Edit, Delete) */}
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(index, item)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-enco-blue transition-colors cursor-pointer"
                          title="Edytuj treść"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded transition-colors ${
                          index === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer'
                        }`}
                        title="Przesuń wyżej"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === activeItems.length - 1}
                        className={`p-1 rounded transition-colors ${
                          index === activeItems.length - 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer'
                        }`}
                        title="Przesuń niżej"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-slate-200"></div>

                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Usuń z listy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Footer warning info */}
          <div className="border-t border-slate-200 pt-4 mt-8 flex justify-between items-center text-xs text-slate-400 max-w-4xl">
            <p>
              Wszelkie wprowadzone zmiany będą natychmiast widoczne w liście rozwijanej każdego nowo-obsługiwanego pola formularza ENCO.
            </p>
            <span className="font-mono text-[10px] uppercase font-bold text-slate-350">
              LocalStorage DB Active
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
