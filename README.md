# SVT Text-TV MCP Server

MCP-server för SVT Text-TV - Exponerar svenskt text-tv-innehåll (nyheter, sport, väder, TV-tablåer) via Model Context Protocol.

## Installation

### NPM (Lokal)

```bash
npm install -g svt-texttv-mcp
```

### Claude Desktop

Lägg till i din `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "svt-texttv": {
      "command": "npx",
      "args": ["-y", "svt-texttv-mcp"]
    }
  }
}
```

### Remote (Render)

```json
{
  "mcpServers": {
    "svt-texttv": {
      "type": "http",
      "url": "https://svt-texttv-mcp.onrender.com/mcp"
    }
  }
}
```

## Verktyg

| Verktyg | Beskrivning |
|---------|-------------|
| `texttv_get_page` | Hämta en specifik Text-TV-sida (100-899) |
| `texttv_get_subpages` | Hämta alla versioner av en sida |
| `texttv_get_news` | Hämta nyheter (inrikes/utrikes/huvud) |
| `texttv_get_sports` | Hämta sport (fotboll/hockey/resultat) |
| `texttv_get_weather` | Hämta väderprognos (nationellt/Stockholm/Göteborg/Malmö) |
| `texttv_get_tv_schedule` | Hämta TV-tablå (SVT1/SVT2) |
| `texttv_search` | Sök i Text-TV-innehåll |
| `texttv_browse_category` | Bläddra i en kategori |

## Resurser

| URI | Beskrivning |
|-----|-------------|
| `texttv://categories` | Lista alla kategorier med sidintervall |
| `texttv://news/latest` | Senaste huvudnyheter |
| `texttv://sports/latest` | Senaste sport |
| `texttv://weather/national` | Nationell väderprognos |
| `texttv://tv/today` | Dagens TV-tablå |

## Prompts

| Namn | Beskrivning |
|------|-------------|
| `swedish_news_summary` | Sammanfattning av svenska nyheter |
| `sports_update` | Sportuppdatering |
| `weather_forecast` | Väderprognos |
| `tv_tonight` | Kvällens TV-program |
| `texttv_page` | Analysera en specifik sida |

## Exempel

### Hämta nyheter

```
Använd texttv_get_news med category: "domestic" för att få inrikesnyheter
```

### Sök efter innehåll

```
Använd texttv_search med query: "klimat" för att hitta sidor om klimat
```

### Väderprognos

```
Använd texttv_get_weather med region: "stockholm" för Stockholms väder
```

## Sidkategorier

| Intervall | Kategori |
|-----------|----------|
| 100-199 | Nyheter |
| 300-399 | Sport |
| 400-499 | Väder |
| 500-699 | TV-tablå |
| 700-899 | Övrigt |

## Kända sidor

| Sida | Beskrivning |
|------|-------------|
| 100 | Huvudnyheter |
| 101-103 | Inrikesnyheter |
| 104-109 | Utrikesnyheter |
| 300 | Sporthuvudsida |
| 330-339 | Fotboll |
| 340-349 | Hockey |
| 400 | Nationell väderprognos |
| 402-404 | Lokala prognoser |
| 600 | SVT1 tablå |
| 650 | SVT2 tablå |

## Utveckling

```bash
# Installera dependencies
npm install

# Bygg
npm run build

# Kör tester
npm test

# Starta dev-server (stdio)
npm run dev

# Starta HTTP-server
npm run dev:http
```

## API

Servern använder det inofficiella API:et från [texttv.nu](https://texttv.nu).

## Licens

MIT

## Författare

Skapad med Claude Code.

---

**Version:** 1.0.0
