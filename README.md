# Ascandir - DnD5e Argon Combat HUD Themer

Eigene Themes/Skins für das **Argon Combat HUD** in Foundry VTT erstellen, speichern und über die Spieleinstellungen auswählen.

- **Theme-Bibliothek:** beliebig viele benannte Themes, duplizieren, löschen, als JSON exportieren und importieren (auch Argons eigene Theme-Dateien)
- **Editor mit Live-Vorschau:** Mini-Vorschau im Fenster, zusätzlich zeigt das echte HUD die Änderungen sofort (nur bei dir, bis du speicherst)
- **Alle Argon-Farben** inkl. Transparenz, dazu Farben, die Argon fest eingebaut hat (RK/SG-Werte, Trefferpunkte, Aktions-Punkte, Zauberplätze, Werte-Kästen)
- **Schrift, Form & Effekte:** Schriftart, Schriftgröße, Eckenrundung, Rahmenstärke, Leuchten beim Darüberfahren, Textschatten, Portrait-Rahmen
- **Deko-Elemente:** frei platzierbare Bilder wie Laternen (mit Flackern), Banner (mit Schwingen) oder Wappen – verankert an Portrait, Menü, Rast-Knöpfen oder Aktionsleisten
- **Symbole vor Attributen & Fertigkeiten** (im Menü und im Tooltip), verziertes Attribute-Menü, eckige Zauberplatz-Punkte, Titelstreifen auf den Knöpfen
- **Layout-Schalter:** durchgehende Aktionsplanke, verbundene Werteleiste (HP/RK/SG), Tooltip-Titel linksbündig, Name ausblenden
- **Texturen & Rahmenbilder:** Holz-/Leder-Textur für Leisten, Pergament für Tooltips, Zierrahmen als 9-Slice-Bild, Deko wie ein Wachssiegel – mit eigenen Bildern aus deinen Foundry-Dateien
- **Auswahl über die Spieleinstellungen:** Theme für alle (Welt) vom SL; optional dürfen Spieler ein eigenes wählen
- **Alle 30 Themes aus „Ascandir - DnD5e Character Sheet“** als passende HUD-Vorlagen (Grund-, Schadenstyp- und Klassen-Themes)
- Mitgelieferte Vorlagen: *Gotik & Pergament*, *Schmiede & Pergament*, *Drachenblut*, *Pergament & Tinte*, *Arkane Nacht*, *Waldläufer*, *Eisen & Glut*

## Installation

In Foundry unter **Add-on Modules → Install Module** diese Manifest-URL eintragen:

```
https://github.com/Ascandir/Ascandir---DnD5e-Argon-Combat-HUD-Themer/releases/latest/download/module.json
```

Benötigt: **Argon - Combat HUD (CORE)** (ab 5.0). Getestet mit Foundry v14.368, dnd5e 6.0.6, Argon Core 5.0.1 und Argon dnd5e 5.2.2.

## Benutzung

1. **Spieleinstellungen → Moduleinstellungen → Ascandir - DnD5e Argon Combat HUD Themer → Theme-Editor öffnen** (nur SL)
2. Links ein Theme wählen oder ein neues anlegen, rechts anpassen. Einen Token auswählen, um die Änderungen auch am echten HUD zu sehen.
3. **Speichern** – Vorlagen werden dabei automatisch als eigene Kopie gespeichert.
4. **Für alle aktivieren** oder in den Moduleinstellungen unter „Theme für alle (Welt)“ auswählen.

„Argon-eigenes Aussehen“ schaltet den Themer aus; dann gelten wieder die Farben aus Argons eigenem Theme-Menü.

## Eigene Rahmenbilder

Rahmen werden als **9-Slice** gestreckt: Die vier Ecken des Bildes bleiben unverzerrt, die Kanten werden gestreckt, die Mitte bleibt leer. „Ecken-Größe im Bild“ ist die Kantenlänge einer Ecke in Pixeln im Originalbild, „Rahmenbreite“ die angezeigte Breite im HUD.

## Schrift

Mitgeliefert sind die Schriften **Crimson Text**, **Cinzel** und **EB Garamond** (SIL Open Font License, siehe `assets/fonts`).

## Charakterbogen-Themes aktualisieren

Wenn im Charakterbogen-Modul Themes dazukommen oder sich ändern:

```
python3 tools/import-sheet-themes.py <pfad/zum/Ascandir---DnD5e-Character-Sheet>
```

## Für Makros

```js
const api = game.modules.get("ascandir-argon-combat-hud-themer").api;
api.openEditor();
api.setWorldTheme("ascandir-schmiede");
```
