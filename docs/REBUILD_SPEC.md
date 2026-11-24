# Generator Ofert ENCO — specyfikacja techniczna v1

## 1. Cel
Wewnętrzna aplikacja webowa dla działu handlowego ENCO do szybkiego tworzenia, edytowania, wersjonowania i eksportowania ofert handlowych do PDF.

Priorytety:
1. Standardową ofertę da się przygotować w kilka minut.
2. Nietypową ofertę można dowolnie rozbudować.
3. Dokument końcowy zachowuje papier firmowy ENCO i profesjonalny układ A4.
4. Wielu pracowników może bezpiecznie pracować na wspólnych danych.
5. Oferty są przechowywane jako pliki w folderach na wspólnym dysku sieciowym.

## 2. Ustalone decyzje
- Użytkownicy: wielu pracowników, równoczesny dostęp.
- Uruchamianie: aplikacja webowa na serwerze firmowym, dostęp przez przeglądarkę.
- Przechowywanie ofert: pliki w folderach na udziale sieciowym.
- Edytor: hybrydowy — formularz, bloki, bezpośrednia edycja dokumentu.
- Tryby: uproszczony, standardowy, pełna edycja.
- Migracja: świeży start; stary projekt pozostaje archiwum i źródłem wiedzy.
- Dokument końcowy: PDF A4.
- Źródło edytowalne: JSON + załączniki.
- Papier firmowy: zachować identyfikację wizualną ENCO, stały nagłówek i stopkę.

## 3. Architektura logiczna
### Frontend
- React + TypeScript.
- Interfejs responsywny, priorytet desktop.
- Edytor tekstu oparty o TipTap lub równoważne rozwiązanie.
- Edycja blokowa z dnd-kit lub równoważnym mechanizmem.
- Podgląd stron A4 aktualizowany na bieżąco.

### Backend
- Node.js + TypeScript.
- API do ofert, bibliotek, słowników, użytkowników, szablonów i eksportu.
- Uwierzytelnianie i autoryzacja po stronie serwera.
- Walidacja danych wejściowych.
- Log audytowy operacji i zmian.
- Generowanie PDF po stronie serwera.

### Dane
- PostgreSQL: konta, role, sesje, indeks ofert, blokady edycji, metadane, audyt.
- Udział sieciowy: pliki JSON ofert, PDF, załączniki, biblioteka plików i kopie wersji.
- Nie przechowywać całej treści ofert wyłącznie w PostgreSQL.

## 4. Proponowana struktura udziału sieciowego
```
ENCO_GENERATOR/
  OFERTY/
    2026/
      ENCO-2026-001/
        oferta.json
        oferta.pdf
        historia/
        zalaczniki/
  BIBLIOTEKA/
    produkty/
    opisy/
    warunki/
    zdjecia/
  SZABLONY/
  SLOWNIKI/
  PAPIER_FIRMOWY/
  ARCHIWUM/
  BACKUP/
```

Ścieżka udziału musi być konfigurowana poza kodem, np. przez zmienną środowiskową `ENCO_STORAGE_ROOT`. Serwer musi mieć jawnie nadane uprawnienia do odczytu i zapisu. Nie zakładać, że ścieżka sieciowa jest dostępna z poziomu przeglądarki.

## 5. Model oferty
Każda oferta ma stabilny identyfikator UUID oraz numer biznesowy. Dokument JSON zawiera:
- wersję schematu;
- identyfikator i numer oferty;
- status i daty utworzenia/zmiany;
- autora i ostatniego edytora;
- dane klienta i inwestycji;
- wybrany tryb pracy;
- strukturę dokumentu jako uporządkowane bloki;
- pozycje cenowe i ustawienia VAT;
- odwołania do załączników;
- ustawienia papieru firmowego;
- metadane wersji.

Oferta ma być samowystarczalna: elementy pobrane z biblioteki są kopiowane do dokumentu jako migawka danych. Późniejsza zmiana biblioteki nie może zmieniać historycznej oferty.

## 6. Trzy tryby pracy
### Uproszczony
Szybki kreator z podstawowymi danymi, gotowymi pozycjami i automatycznie składanym dokumentem.

### Standardowy
Konfiguracja sekcji, wyposażenia, opisów, tabel i cen. Możliwość dodawania oraz usuwania wybranych bloków.

### Pełna edycja
Pełna kontrola nad strukturą dokumentu: dodawanie, usuwanie i przestawianie bloków, edycja treści, tabel, obrazów, rysunków i podziałów stron.

Przejście między trybami nie może usuwać ani nadpisywać danych. Wszystkie tryby korzystają z jednego modelu dokumentu.

## 7. Edytor i dokument
Typy bloków w pierwszej wersji:
- nagłówek/tytuł;
- tekst sformatowany;
- dane klienta;
- lista zakresu dostawy;
- tabela parametrów;
- pozycja cenowa / tabela cen;
- obraz;
- rysunek techniczny;
- warunki handlowe;
- podpis;
- ręczny podział strony.

Papier firmowy ENCO jest osobną, zablokowaną warstwą. Treść nie może nachodzić na obszar nagłówka i stopki. Obsłużyć A4, marginesy, paginację, powtarzanie nagłówków tabel i kontrolę łamania bloków.

## 8. PDF
- Generowanie po stronie serwera przy użyciu Chromium/Playwright.
- Format A4, poprawne marginesy i osadzone fonty.
- Tekst i tabele powinny pozostać wektorowe, jeśli to możliwe.
- Kontrola podziałów stron i brak obciętych elementów.
- PDF zapisywany w folderze oferty.
- Eksport nie może zmieniać źródłowego JSON.

## 9. Wielu użytkowników i bezpieczeństwo
Role początkowe:
- Administrator;
- Handlowiec;
- Edytor;
- Podgląd.

Wymagania:
- konta indywidualne;
- bezpieczne hasła i sesje;
- uprawnienia sprawdzane po stronie API;
- blokada edycji lub rezerwacja oferty z czasem wygaśnięcia;
- wykrywanie konfliktu wersji przed zapisem;
- zapis atomowy: plik tymczasowy, walidacja, podmiana;
- kopia poprzedniej wersji przed nadpisaniem;
- dziennik operacji;
- regularny backup udziału i PostgreSQL;
- brak sekretów i haseł w repozytorium.

## 10. Biblioteka i słowniki
Wspólne dla uprawnionych użytkowników:
- produkty i komponenty;
- opisy techniczne;
- warunki handlowe;
- gotowe sekcje i tabele;
- zdjęcia i rysunki;
- listy wyboru i parametry;
- szablony ofert.

Zmiany w bibliotece nie modyfikują już utworzonych ofert.

## 11. Panel główny
- nowa oferta;
- wszystkie oferty;
- moje oferty;
- ostatnio edytowane;
- wyszukiwanie po numerze, kliencie, inwestycji i autorze;
- filtry statusu i dat;
- biblioteka, słowniki, szablony i administracja.

## 12. Świeży start
Nie importować automatycznie aktywnych ofert ze starej aplikacji. Stare repozytorium pozostaje archiwum. Z niego można ręcznie odtworzyć sprawdzone słowniki, funkcje i wzorce po ich weryfikacji.

## 13. Etapy realizacji
1. Audyt istniejącego rozwiązania i zamrożenie listy funkcji.
2. Fundament projektu, konfiguracja, backend i obsługa udziału sieciowego.
3. Użytkownicy, role, indeks ofert i bezpieczny zapis plików.
4. Panel ofert, tworzenie, kopiowanie i wersjonowanie.
5. Biblioteka, słowniki i szablony.
6. Wspólny model dokumentu oraz trzy tryby kreatora.
7. Edytor hybrydowy i podgląd A4.
8. Silnik PDF, testy jakości i wdrożenie.

## 14. Kryteria odbioru
- Dwóch użytkowników nie może po cichu nadpisać sobie zmian.
- Oferta po ponownym otwarciu odtwarza identyczną strukturę.
- Kopia oferty otrzymuje nowy identyfikator i numer oraz nie zmienia oryginału.
- Zmiana biblioteki nie zmienia zapisanych ofert.
- Każdy tryb korzysta z tego samego źródła danych.
- PDF ma poprawny format A4, papier firmowy, paginację i brak obcięć.
- Awaria eksportu PDF nie może uszkodzić pliku źródłowego.
- Brak dostępu do udziału sieciowego ma być jasno komunikowany, a nie powodować utraty danych.

## 15. Kwestie do potwierdzenia przed wdrożeniem produkcyjnym
- System operacyjny serwera i rodzaj udziału sieciowego (SMB/NFS/NAS).
- Docelowa ścieżka udziału i konto serwisowe.
- Sposób logowania (lokalne konta czy firmowy katalog/SSO).
- Logo, papier firmowy w jakości źródłowej i aktualne dane stopki.
- Zasady numeracji ofert i statusów.
