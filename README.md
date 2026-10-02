# Θεματοεπιστολαί: An electronic edition

Elektronische Edition (TEI P5) der *Θεματοεπιστολαί* des Theodosios Zygomalas,
diplomatische Transkription nach dem Codex Tybingensis Mb 30
(Universitätsbibliothek Tübingen). Die Briefe liegen jeweils in einer
"low"- und einer "high"-Fassung vor; Zusätze und Tilgungen von Martin Crusius
und Zygomalas sind ausgezeichnet.

Herausgeber: Notis Toufexis

## Inhalt

- `edition/thematoepistulae.xml`: die Edition (62 Briefe, 124 Fassungen)
- `index.html`, `web/`: Webansicht (XSLT im Browser)
- `wortindex.html`, `web/wortindex.js`, `web/wortlogik.js`: Wortindex
- `css/tei.css`: Stylesheet für die direkte Ansicht der XML-Datei

## Webansicht

`index.html` lädt die TEI-Datei im Browser, wandelt sie per XSLT (`web/edition.xsl`)
in HTML um und bietet Navigation, Ansicht low/high/beides, Zeilen der Handschrift,
Zeilennummern, Ein- und Ausblenden der Auflösungen, Farbe der Hände und eine
akzentunabhängige Suche. Es wird kein Server-Code und kein Build-Schritt benötigt.

Lokal ansehen (die Datei muss über HTTP ausgeliefert werden, `file://` genügt nicht):

    python3 -m http.server 8000

Dann `http://localhost:8000/` öffnen. Auf GitHub Pages (Branch `main`, Ordner `/`)
läuft die Seite unverändert.

Die XML-Datei lässt sich auch direkt im Browser öffnen; dann wird `css/tei.css`
verwendet.

Legende: Zahl am Zeilenende = Zeilennummer der Handschrift, `(..)` aufgelöste
Abkürzung, orange Zusatz von Crusius, blau Zusatz von Zygomalas, durchgestrichen
getilgt, gepunktet unterstrichen unsichere Lesung.

## Wortindex

`wortindex.html` listet alle Wörter beider Fassungen in normalisierter Form
(ohne Akzente, Spiritus und Iota subscriptum, Kleinbuchstaben, Schluss-Sigma als
Sigma) mit den belegten Schreibungen und Links auf die Textstellen. Der Index wird
beim Öffnen direkt aus dem TEI-XML berechnet und ist daher immer aktuell; es gibt
keine erzeugte Datei, die gepflegt werden müsste.

Regeln: Abkürzungen sind aufgelöst (`expan`), Tilgungen (`del`), Randnotizen
(`note`), unaufgelöste Abkürzungsformen (`abbr`) und das Zeichen † bleiben
unberücksichtigt, am Zeilenende mit Bindestrich getrennte Wörter werden
zusammengefügt. Lateinische Wörter (Zusätze von Crusius) fehlen im Index.
Eindeutige Elisionen werden über `web/elisionen.json` der Vollform zugeordnet
(δι’ unter δια); nicht eindeutige (οθ’, τ’, θ’, τιν’, λογισ’, τοκατ’, οτ’)
stehen als eigene Einträge mit Apostroph. Die Tabelle kann ergänzt oder
geändert werden. Sonst wird nicht lemmatisiert. Ein Beleg wie `6·H3` bedeutet
Brief 6, Fassung high, Zeile 3; der Link springt im Text an diese Zeile und
hebt sie hervor. Die Zeilenzählung (Anker `thema6_high-z3`) ist in
`web/wortlogik.js` beschrieben.

## Lizenz

Creative Commons Attribution 4.0 International (CC BY 4.0), siehe `LICENSE`.

## Zitieren

Τουφεξής, Νότης: *Θεματοεπιστολαί: An electronic edition*. Zenodo.
https://doi.org/10.5281/zenodo.23110826

Maschinenlesbar in `CITATION.cff`; GitHub zeigt über „Cite this repository“ fertige Zitate an.
