# Indy A3 Sector Map

An interactive map for memorizing the Indy Area 3 sectors: names, sector numbers, altitudes and frequencies.

**Live site:** https://azooc.github.io/IndyA3SectorMap/

## How to use

- The map opens with every answer filled in, so you can study it.
- **Clear** empties every blank. The sector IDs stay, and the blanks keep their shape (`__ FL___-FL___`, `___.__`), so you can see what goes where.
- Fill in what you remember, then hit **Check answers** (or `Ctrl`+`Enter`).
  - Green = correct.
  - Red = missed. The correct answer is filled into the red box. Hover it (or tab to it) to see what you typed.
- **Retry missed** blanks out only the ones you got wrong, so you can try them again.
- **Fill answers** puts every answer back.

`Tab` / `Enter` moves to the next blank, `Shift`+`Enter` goes back, and number blanks jump ahead on their own once they're full. Frequencies like `128.6` also accept `128.60`.

## Editing the data

All sector info lives in [`sectors.js`](sectors.js): the label text, where each label sits, and the boundary lines. Coordinates are pixels on the original 833 × 843 map image. No build step; it's plain HTML, CSS and JavaScript.

To run it locally, serve the folder with any static server, for example:

```bash
python -m http.server 8000
```
