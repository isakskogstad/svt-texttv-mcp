# SVT Text-TV MCP Server

MCP server for SVT Text-TV - Exposes Swedish teletext content (news, sports, weather, TV schedules) through the Model Context Protocol.

## Installation

### NPM (Local)

```bash
npm install -g svt-texttv-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

## Tools

| Tool | Description |
|------|-------------|
| `texttv_get_page` | Get a specific Text-TV page (100-899) |
| `texttv_get_subpages` | Get all versions of a page |
| `texttv_get_news` | Get news (domestic/foreign/main) |
| `texttv_get_sports` | Get sports (football/hockey/results) |
| `texttv_get_weather` | Get weather forecast (national/Stockholm/Gothenburg/Malmo) |
| `texttv_get_tv_schedule` | Get TV schedule (SVT1/SVT2) |
| `texttv_search` | Search Text-TV content |
| `texttv_browse_category` | Browse a category |

## Resources

| URI | Description |
|-----|-------------|
| `texttv://categories` | List all categories with page ranges |
| `texttv://news/latest` | Latest main news |
| `texttv://sports/latest` | Latest sports |
| `texttv://weather/national` | National weather forecast |
| `texttv://tv/today` | Today's TV schedule |

## Prompts

| Name | Description |
|------|-------------|
| `swedish_news_summary` | Summary of Swedish news |
| `sports_update` | Sports update |
| `weather_forecast` | Weather forecast |
| `tv_tonight` | Tonight's TV programs |
| `texttv_page` | Analyze a specific page |

## Examples

### Get news

```
Use texttv_get_news with category: "domestic" for domestic news
```

### Search content

```
Use texttv_search with query: "klimat" to find pages about climate
```

### Weather forecast

```
Use texttv_get_weather with region: "stockholm" for Stockholm weather
```

## Page Categories

| Range | Category |
|-------|----------|
| 100-199 | News |
| 300-399 | Sports |
| 400-499 | Weather |
| 500-699 | TV Schedule |
| 700-899 | Other |

## Known Pages

| Page | Description |
|------|-------------|
| 100 | Main news |
| 101-103 | Domestic news |
| 104-109 | Foreign news |
| 300 | Sports main page |
| 330-339 | Football |
| 340-349 | Hockey |
| 400 | National weather forecast |
| 402-404 | Local forecasts |
| 600 | SVT1 schedule |
| 650 | SVT2 schedule |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start dev server (stdio)
npm run dev

# Start HTTP server
npm run dev:http
```

## API

The server uses the unofficial API from [texttv.nu](https://texttv.nu).

## License

MIT

## Author

Created with Claude Code.

---

**Version:** 1.0.0
