/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useRef } from 'react';
import { Printer, Copy, AlertCircle, FileText, CheckCircle, Download, RefreshCw } from 'lucide-react';
import { DaneOferty } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import OfferDocument from './OfferDocument';

interface PreviewPanelProps {
  offer: DaneOferty;
}

export default function PreviewPanel({ offer }: PreviewPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Direct and robust print utilizing a specialized clean print page
  const handlePrint = () => {
    try {
      localStorage.setItem(`print_offer_${offer.id}`, JSON.stringify(offer));
    } catch (e) {
      console.error("Local storage sync error:", e);
    }
    window.open(`/print?id=${offer.id}`, '_blank');
  };

  // Copy plain text to clipboard
  const copyToClipboard = () => {
    if (!printAreaRef.current) return;
    const text = printAreaRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Direct client-side PDF export utilizing jsPDF and html2canvas page-by-page capture
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      
      // Allow the DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      if (!printAreaRef.current) {
        throw new Error("Could not find print area element.");
      }
      
      const pages = printAreaRef.current.querySelectorAll('.print-page');
      if (!pages || pages.length === 0) {
        throw new Error("No pages found for PDF capture.");
      }
      
      // Initialize Multi-page A4 PDF (Portrait, Millimeters, standard A4 layout)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        
        // Render current A4 container onto a high-DPI raster canvas to preserve crisp vector curves and text
        const canvas = await html2canvas(pageEl, {
          scale: 2.2, // sharp resolution
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          windowWidth: 794, // Standard 210mm at 96 DPI
          windowHeight: 1123, // Standard 297mm at 96 DPI
        });
        
        const imgWidth = 210; // A4 standard width (mm)
        const imgHeight = 297; // A4 standard height (mm)
        
        // Export high-quality JPEG with slight compression for responsive file size
        const imgData = canvas.toDataURL('image/jpeg', 0.94);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      }
      
      // Establish an elegant filename matching the document ID/number
      const rawNumber = offer.numer_oferty ? offer.numer_oferty.replace(/[^a-zA-Z0-9_-]/g, '_') : 'nowa';
      const filename = `Oferta_ENCO_${rawNumber}.pdf`;
      
      pdf.save(filename);
    } catch (err) {
      console.error("PDF download generation error:", err);
      alert("Wystąpił błąd podczas generowania pliku PDF. Spróbuj pobrać ofertę, otwierając okno druku i wybierając opcję 'Zapisz jako PDF'.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 h-full overflow-hidden text-zinc-800">
      {/* Action Toolbar */}
      <div className="bg-[#1e293b] border-b border-slate-800 p-3.5 flex justify-between items-center no-print">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#004a99]" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Podgląd oferty (Live WYSIWYG)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white py-1.5 px-3 rounded border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Skopiowano!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiuj tekst</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs bg-[#931A1D] hover:bg-[#7a1417] text-white py-1.5 px-4 rounded font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Pobierz PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs bg-[#004a99] hover:bg-[#003773] text-white py-1.5 px-4 rounded font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Drukuj ofertę
          </button>
        </div>
      </div>

      {/* Instructions on top */}
      <div className="bg-slate-50 p-2.5 text-center text-xs text-slate-600 flex items-center justify-center gap-2 border-b border-slate-200 no-print font-medium">
        <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Podgląd na żywo odpowiada dokładnie wyglądowi dokumentu A4. Kliknij <b>Pobierz PDF</b> lub <b>Drukuj ofertę</b>, aby wydać ostateczną wersję.</span>
      </div>

      {/* Scrollable Document Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-200/50 print-scrollbar-expand" 
        ref={printAreaRef}
      >
        <OfferDocument offer={offer} />
      </div>

      {/* Elegant non-blocking loader overlay during PDF generation */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-center items-center gap-3 z-[9999] no-print">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center max-w-xs text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <RefreshCw className="w-8 h-8 text-[#004a99] animate-spin mb-3" />
            <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Generowanie PDF</span>
            <span className="text-xs text-slate-500 mt-1 leading-normal font-medium">
              Trwa renderowanie arkuszy A4 i konwersja obrazów. Proszę czekać...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
