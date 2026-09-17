/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Search, FileDown, FileUp, Zap, Server, Sliders, Copy
} from 'lucide-react';
import { DaneOferty, OfferType } from '../types';

interface OffersSidebarProps {
  offers: DaneOferty[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddNew: (type: OfferType) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJSON: () => void;
}

export default function OffersSidebar({
  offers,
  selectedId,
  onSelect,
  onAddNew,
  onClone,
  onDelete,
  onImportJSON,
  onExportJSON,
}: OffersSidebarProps) {
  const [search, setSearch] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (deleteConfirmId !== null) {
      const timer = setTimeout(() => {
        setDeleteConfirmId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirmId]);

  const filteredOffers = offers.filter(o => 
    o.klient_nazwa.toLowerCase().includes(search.toLowerCase()) ||
    o.numer_oferty.toLowerCase().includes(search.toLowerCase()) ||
    o.post_temat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside id="offers-sidebar" className="w-80 bg-[#1e293b] text-slate-100 border-r border-slate-850 flex flex-col h-full shrink-0 no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mock ENCO Logo */}
          <div className="font-heading font-semibold text-lg tracking-wider text-white flex items-center gap-1.5">
            <span className="text-enco-blue italic font-extrabold text-2.5xl">ENCO</span>
            <span className="text-zinc-400 text-[10px] font-light tracking-widest border-l border-slate-700 pl-2">KREATOR</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={onExportJSON} 
            title="Eksportuj bazę (JSON)"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <label 
            title="Importuj bazę/ofertę (JSON)"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            <input 
              type="file" 
              accept=".json" 
              onChange={onImportJSON} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Szukaj oferty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161e2b] text-sm pl-9 pr-3 py-2 rounded border border-slate-800 focus:outline-none focus:border-enco-blue text-white placeholder-slate-500"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className="w-full bg-enco-blue hover:bg-enco-blue-hover text-white py-2 px-3 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nowa Oferta
          </button>

          {showTypeSelector && (
            <div className="absolute top-11 left-0 right-0 bg-[#253248] border border-slate-800 rounded shadow-xl z-20 overflow-hidden">
              <button
                onClick={() => {
                  onAddNew('stacja_nz');
                  setShowTypeSelector(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#1e293b] transition-colors flex items-center gap-2 border-b border-slate-830"
              >
                <Server className="w-4 h-4 text-emerald-400" />
                Stacja NZ (Zewnętrzna)
              </button>
              <button
                onClick={() => {
                  onAddNew('stacja_bek');
                  setShowTypeSelector(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#1e293b] transition-colors flex items-center gap-2 border-b border-slate-830"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Stacja BEK (Kontenerowa / Płaska)
              </button>
              <button
                onClick={() => {
                  onAddNew('komponenty');
                  setShowTypeSelector(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#1e293b] transition-colors flex items-center gap-2"
              >
                <Sliders className="w-4 h-4 text-blue-400" />
                Sama Oferta na Komponenty
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Offers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Brak pasujących ofert.
          </div>
        ) : (
          filteredOffers.map((o) => {
            const isActive = o.id === selectedId;
            return (
              <div 
                key={o.id}
                onClick={() => onSelect(o.id)}
                className={`group p-3 rounded cursor-pointer transition-all flex items-start gap-2.5 justify-between ${
                  isActive ? 'bg-[#004a99]/30 border-l-4 border-enco-blue text-white' : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      o.offer_type?.toLowerCase().includes('nz') ? 'bg-emerald-500/20 text-emerald-300' :
                      o.offer_type?.toLowerCase().includes('bek') ? 'bg-amber-500/20 text-amber-300' :
                      o.offer_type?.toLowerCase().includes('zksn') ? 'bg-purple-500/20 text-purple-300' :
                      o.offer_type?.toLowerCase().includes('obudowa') ? 'bg-orange-500/20 text-orange-300' :
                      'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {o.offer_type?.toUpperCase() || 'NZ'}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{o.numer_oferty || 'brak nr'}</span>
                  </div>
                  <h4 className="font-semibold text-sm truncate">{o.klient_nazwa || 'Nieznany Klient'}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="truncate max-w-[120px]">{o.post_temat || 'POST -'}</span>
                    <span>{o.data_oferty}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClone(o.id);
                    }}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
                    title="Klonuj / duplikuj tę ofertę"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deleteConfirmId === o.id) {
                        onDelete(o.id);
                        setDeleteConfirmId(null);
                      } else {
                        setDeleteConfirmId(o.id);
                      }
                    }}
                    className={`p-1.5 rounded transition-all ${
                      deleteConfirmId === o.id 
                        ? "bg-red-600 text-white opacity-100 scale-105 animate-pulse" 
                        : "opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                    }`}
                    title={deleteConfirmId === o.id ? "Kliknij ponownie aby bezpowrotnie usunąć tę ofertę" : "Usuń ofertę"}
                  >
                    {deleteConfirmId === o.id ? (
                      <span className="text-[10px] font-extrabold px-1 text-white">Usuń? 🗑</span>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 bg-slate-950 border-t border-slate-900 text-center">
        <span className="text-[10px] text-slate-600 font-mono">ENCO SP. Z O.O. &copy; 2026</span>
      </div>
    </aside>
  );
}
