# Wdrożenie serwerowe — Generator Ofert ENCO

## Docelowy układ
- Serwer aplikacji uruchamia frontend i API.
- Udział sieciowy jest montowany lokalnie na serwerze aplikacji.
- Przeglądarki pracowników łączą się wyłącznie z aplikacją HTTP(S); nie otrzymują bezpośredniego dostępu do udziału.
- Konto systemowe usługi aplikacji otrzymuje minimalne uprawnienia odczytu/zapisu do katalogu danych.

## Konfiguracja
Wymagane zmienne środowiskowe (przykładowe wartości, nie dane produkcyjne):

```env
NODE_ENV=production
PORT=3000
ENCO_STORAGE_ROOT=/mnt/enco-generator
DATABASE_URL=postgresql://enco_app:CHANGE_ME@127.0.0.1:5432/enco_generator
SESSION_SECRET=CHANGE_ME_WITH_LONG_RANDOM_SECRET
```

W Windows ścieżka udziału może być np. `\\\\fileserver\\DzialHandlowy\\GeneratorOfert`, ale usługa musi działać na koncie, które ma dostęp do tego udziału. Preferowane jest mapowanie udziału przez system operacyjny i użycie stabilnej ścieżki lokalnej.

## Zasady bezpieczeństwa
- Nie umieszczać plików `.env`, haseł ani sekretów w repozytorium.
- Nie udostępniać katalogu ofert jako statycznych plików WWW.
- Każdy odczyt i zapis pliku przechodzi przez API i kontrolę uprawnień.
- Zapisywać pliki tymczasowo i atomowo podmieniać docelowy plik.
- Wykonywać kopie udziału sieciowego i bazy metadanych.
- Monitorować dostępność, wolne miejsce i uprawnienia udziału.
- W produkcji wymagać HTTPS.

## Ważne ograniczenie
Nie można jeszcze wskazać finalnej komendy wdrożeniowej ani konfiguracji udziału. Przed wdrożeniem należy potwierdzić system operacyjny serwera, typ udziału (SMB/NFS/NAS), jego ścieżkę oraz konto serwisowe.
