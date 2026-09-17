/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { DaneOferty } from '../types';
import OfferDocument from './OfferDocument';

export default function PrintPage() {
  const [offer, setOffer] = useState<DaneOferty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get ID from parameters
    const searchParams = new URLSearchParams(window.location.search);
    const offerId = searchParams.get('id');

    if (!offerId) {
      setError("Brak identyfikatora oferty (ID) w adresie URL.");
      setLoading(false);
      return;
    }

    // 2. Try loading from localStorage first for super-fast synchronous data access
    const rawLocal = localStorage.getItem(`print_offer_${offerId}`);
    if (rawLocal) {
      try {
        setOffer(JSON.parse(rawLocal));
        setLoading(false);
        return;
      } catch (e) {
        console.warn("Could not parse offer from localStorage, falling back to API:", e);
      }
    }

    // 3. Fallback to API call
    const fetchOffer = async () => {
      try {
        const response = await fetch(`/api/offers/${offerId}`);
        if (!response.ok) {
          throw new Error("Nie znaleziono wybranej oferty w bazie danych.");
        }
        const data = await response.json();
        setOffer(data);
      } catch (err: any) {
        setError(err.message || "Błąd podczas wczytywania oferty.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, []);

  // 4. Auto print and title setup when loaded
  useEffect(() => {
    if (offer) {
      const pageTitle = `Oferta_ENCO_${offer.numer_oferty ? offer.numer_oferty.replace(/[^a-zA-Z0-9_-]/g, '_') : 'nowa'}`;
      document.title = pageTitle;

      // Automatically trigger standard print once component is fully mounted and styling has settled
      const timer = setTimeout(() => {
        window.focus();
        window.print();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [offer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <RefreshCw className="w-8 h-8 text-[#004a99] animate-spin mb-3" />
        <h3 className="text-base font-bold tracking-wide">Przygotowywanie dokumentu do druku...</h3>
        <p className="text-xs text-slate-500 mt-1">Trwa pobieranie parametrów stacji i generowanie arkuszy A4.</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto font-sans">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Nie można wydać dokumentu</h3>
        <p className="text-sm text-slate-500 mt-1.5 mb-6">{error || "Wskazana oferta nie istnieje."}</p>
        <button
          onClick={() => window.close()}
          className="bg-slate-800 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Zamknij kartę druku
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center py-6 print:py-0 w-full overflow-x-hidden font-sans">
      <link rel="stylesheet" id="print-styles" href="/print.css" />
      <OfferDocument offer={offer} />
    </div>
  );
}
