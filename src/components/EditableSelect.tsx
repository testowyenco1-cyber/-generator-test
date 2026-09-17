/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit3, List, Check, HelpCircle, Trash2 } from 'lucide-react';
import { getConstantLists, saveConstantLists, ConstantLists } from '../dataConstants';

interface EditableSelectProps {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
  options: string[];
  categoryKey?: keyof ConstantLists;
  placeholder?: string;
  className?: string;
  isTextarea?: boolean;
  rows?: number;
}

export default function EditableSelect({
  label,
  value,
  onChange,
  options = [],
  categoryKey,
  placeholder = "Uzupełnij...",
  className = "",
  isTextarea = false,
  rows = 3
}: EditableSelectProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [localOptions, setLocalOptions] = useState<string[]>(options);

  // Synchronize options if they change from props
  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Check if current value exists in the options. 
  // If not, and we are not in custom input mode, we might want to toggle custom mode to allow typing or include it.
  const isValueInOptions = localOptions.includes(value);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__CUSTOM__") {
      setIsCustom(true);
    } else {
      onChange(val);
    }
  };

  const handleAddNewOption = () => {
    let promptMsg = "Wpisz nową predefiniowaną opcję, która zostanie zapisana na stałe w bazie:";
    if (label) {
      promptMsg = `Dodaj nową opcję do listy [${label}]:`;
    }
    const newVal = window.prompt(promptMsg);
    if (newVal && newVal.trim()) {
      const trimmed = newVal.trim();
      
      // Update local choices first
      if (!localOptions.includes(trimmed)) {
        const updated = [...localOptions, trimmed];
        setLocalOptions(updated);
        
        // Persist back to general memory base or localStorage
        if (categoryKey) {
          const allLists = getConstantLists();
          allLists[categoryKey] = [...(allLists[categoryKey] || []), trimmed];
          saveConstantLists(allLists);
          
          // Trigger custom global event to notify other instances to reload
          window.dispatchEvent(new Event('enco-constants-updated'));
        }
      }
      
      // Select it
      onChange(trimmed);
      setIsCustom(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      
      <div className="flex gap-1.5 items-center w-full min-w-0">
        {isCustom ? (
          // Custom direct mode
          <div className="flex-1 min-w-0 relative flex items-center">
            {isTextarea ? (
              <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-w-0 bg-white border border-enco-blue rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue font-medium resize-y"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-w-0 bg-white border border-enco-blue rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue font-semibold"
                autoFocus
              />
            )}
            <span className="absolute right-3 top-2.5 text-[9px] bg-indigo-50 text-enco-blue border border-indigo-100 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono shrink-0">
              Własna
            </span>
          </div>
        ) : (
          // Preset selection mode
          <select
            value={isValueInOptions ? value : ""}
            onChange={handleSelectChange}
            className="flex-1 min-w-0 bg-slate-50 hover:bg-slate-100/75 border border-slate-250 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-enco-blue/25 focus:border-enco-blue transition-colors cursor-pointer"
          >
            {/* If current value is not in options, show it at the top so it doesn't disappear */}
            {value && !isValueInOptions && (
              <option value={value}>{value} (Obecna wartość)</option>
            )}
            {value ? (
              <option value="">❌ Usuń wybór / Pozostaw puste (Brak)</option>
            ) : (
              <option value="" disabled>{placeholder}</option>
            )}
            {localOptions.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__CUSTOM__" className="text-enco-blue font-bold">+ Wpisz własną wartość (niestandardowa)...</option>
          </select>
        )}

        {/* Action Toggle buttons */}
        <div className="flex shrink-0 gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
              }}
              className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-all hover:scale-105"
              title="Usuń / Zrezygnuj z tej opcji (wyczyść)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Add option to database button */}
          {categoryKey && (
            <button
              type="button"
              onClick={handleAddNewOption}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
              title="Dodaj nową trwałą opcję do bazy"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle between select & free-text input */}
          <button
            type="button"
            onClick={() => setIsCustom(!isCustom)}
            className={`p-2 border rounded-lg cursor-pointer transition-colors ${
              isCustom 
                ? 'bg-indigo-50 border-indigo-200 text-enco-blue hover:bg-indigo-100' 
                : 'bg-slate-100 border-slate-250 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
            title={isCustom ? "Przełącz na listę rozwijaną" : "Przełącz na wolny tekst"}
          >
            {isCustom ? <List className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
