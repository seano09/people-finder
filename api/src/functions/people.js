<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>emh People Finder</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap">
<style>
/* Always light: the page keeps the same white, emh-red look whatever the device theme.
   emh brand: red #e30613 on white, 45° marker motif, DIN-style condensed caps for display (Barlow Condensed stands in for DIN Pro Condensed),
   a Helvetica-style grotesk for text (Aktiv Grotesk if installed, else Inter, else Arial).
   Layout: brand bar, search + view switch, then a person view or a top-down org chart. */
:root{
  --red:#e30613; --red-text:#c00511; --red-soft:#fde8e9;
  --bg:#ffffff; --panel:#f3f3f3; --surface:#ffffff; --line:#d9d9d9; --conn:#b5b5b5;
  --fg:#1d1d1b; --muted:#5f5f5c; --on-red:#ffffff; --logo-eh:#e30613; --hit:#fff4c2; --warn:#8a5a00; --warn-soft:#fff4dc; --grid:#ececec; --canvas:#fafafa;
  color-scheme:light;
  --display:"DIN Pro Condensed","din-condensed","Barlow Condensed","Arial Narrow",sans-serif;
  --text:"Aktiv Grotesk","aktiv-grotesk","Inter",Arial,Helvetica,sans-serif;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font-family:var(--text);font-size:15px;line-height:1.5;font-weight:400}
button{font-family:inherit}
.wrap{max-width:1000px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:22px}
.wrap.wide{max-width:none}

/* Brand bar */
.brand{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding-bottom:16px;border-bottom:1px solid var(--line)}
.logo{height:52px;width:auto;flex:none}
.lg-m{fill:#ffffff}.lg-mark{fill:var(--red)}.lg-eh{fill:var(--logo-eh)}
h1{font-family:var(--display);font-weight:700;font-size:2rem;line-height:1;text-transform:uppercase;color:var(--red);margin:0;letter-spacing:.01em}
.pill{font-family:var(--display);font-weight:600;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);border:1px solid var(--line);padding:1px 8px}
.who{margin-left:auto;font-size:.85rem;color:var(--muted)}

/* Toolbar */
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:stretch}
.search{position:relative;flex:1 1 300px;min-width:0}
.search input{width:100%;font:inherit;font-size:1rem;padding:11px 44px 11px 14px;border:1px solid var(--line);border-radius:0;background:var(--surface);color:var(--fg)}
.search input:focus{outline:2px solid var(--red);outline-offset:0;border-color:var(--red)}
.kbd{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.75rem;color:var(--muted);border:1px solid var(--line);padding:0 6px}
.results{position:absolute;left:0;right:0;top:calc(100% + 4px);background:var(--surface);border:1px solid var(--line);box-shadow:0 14px 30px rgba(0,0,0,.16);max-height:min(420px,60vh);overflow:auto;z-index:20;padding:4px;margin:0;list-style:none}
.results li{display:flex;gap:12px;align-items:center;padding:8px 10px;cursor:pointer}
.results li[aria-selected="true"],.results li:hover{background:var(--panel)}
.results li[aria-selected="true"]{box-shadow:inset 3px 0 0 var(--red)}
.results .meta{min-width:0}
.results .n{font-weight:600}
.results .r{color:var(--muted);font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.results .empty{color:var(--muted);padding:12px;cursor:default}
mark{background:var(--hit);color:inherit}
.btn{font-weight:500;font-size:.92rem;padding:10px 14px;border:1px solid var(--line);background:var(--surface);color:var(--fg);cursor:pointer;white-space:nowrap}
.btn:hover{border-color:var(--red);color:var(--red-text)}
.btn:disabled{opacity:.45;cursor:not-allowed;color:var(--fg);border-color:var(--line)}
.btn.sm{padding:6px 10px;font-size:.85rem}
.seg{display:inline-flex;border:1px solid var(--line);background:var(--surface)}
.seg button{font-weight:500;font-size:.92rem;padding:10px 14px;border:0;background:none;color:var(--muted);cursor:pointer;white-space:nowrap}
.seg button[aria-pressed="true"]{background:var(--red);color:var(--on-red)}

/* Person view */
.pv{display:flex;flex-direction:column;gap:24px}
.trail{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:.88rem;color:var(--muted)}
.trail button{font:inherit;color:var(--red-text);background:none;border:0;padding:2px 3px;cursor:pointer}
.trail button:hover{text-decoration:underline}
.trail .sep{color:var(--red)}
.focus{background:var(--panel);padding:28px;display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:start;
  clip-path:polygon(28px 0,100% 0,100% 100%,0 100%,0 28px)}
.av{width:40px;height:40px;display:grid;place-items:center;font-weight:600;font-size:.85rem;flex:none;color:var(--red-text);
  background:linear-gradient(135deg,var(--red) 0 8px,var(--red-soft) 8px)}
.focus .av{width:64px;height:92px;font-family:var(--display);font-size:1.6rem;font-weight:700;color:var(--on-red);background:var(--red);
  clip-path:polygon(0 0,100% 28px,100% 100%,0 calc(100% - 28px))}
.focus h2{margin:0;font-family:var(--display);font-weight:700;font-size:2.1rem;line-height:1.05;text-transform:uppercase;text-wrap:balance}
.focus .role{font-size:1.1rem;font-weight:300;margin-top:4px}
.you{font-family:var(--display);font-size:.85rem;font-weight:600;letter-spacing:.05em;background:var(--red);color:var(--on-red);padding:1px 8px;vertical-align:middle;margin-left:10px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px 24px;margin:20px 0 0;padding:0}
.facts div{min-width:0}
.facts dt{font-family:var(--display);font-weight:600;font-size:.82rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.facts dd{margin:2px 0 0;overflow-wrap:anywhere}
.facts dd button{font:inherit;font-weight:500;color:var(--red-text);background:none;border:0;padding:0;cursor:pointer;text-align:left}
.facts dd a{color:var(--red-text);font-weight:500;text-decoration:none;overflow-wrap:anywhere}
.facts dd a:hover{text-decoration:underline}
.copy{font-size:.72rem;margin-left:8px;border:1px solid var(--line);background:var(--surface);color:var(--muted);padding:0 6px;cursor:pointer}
.focus .info{min-width:0}
section h3{font-family:var(--display);font-weight:600;font-size:1.15rem;text-transform:uppercase;letter-spacing:.03em;margin:0 0 10px;display:flex;gap:8px;align-items:baseline}
section h3 span{color:var(--red-text)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.card{display:flex;gap:12px;align-items:center;text-align:left;font:inherit;color:inherit;background:var(--surface);border:1px solid var(--line);padding:12px;cursor:pointer;width:100%}
.card:hover{border-color:var(--red)}
.card .meta{min-width:0;flex:1}
.card .n{font-weight:600}
.card .r{color:var(--muted);font-size:.85rem}
.cnt{font-size:.75rem;font-weight:500;color:var(--red-text);background:var(--red-soft);padding:1px 8px;white-space:nowrap}
.none{color:var(--muted);font-size:.9rem}

/* Org chart (top-down) */
.ocbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.zoom{display:inline-flex;align-items:center;border:1px solid var(--line);background:var(--surface)}
.zoom button{border:0;background:none;color:var(--fg);font-size:1rem;width:34px;height:32px;cursor:pointer}
.zoom button:hover{color:var(--red-text)}
.zoom span{font-size:.8rem;min-width:44px;text-align:center;color:var(--muted);font-variant-numeric:tabular-nums}
.ocbar .note{color:var(--muted);font-size:.85rem;margin-left:auto}
.ocbar .sep{width:1px;align-self:stretch;background:var(--line);margin:0 4px}
.btn[aria-pressed="true"]{background:var(--panel);border-color:var(--fg)}
.chip{display:inline-flex;align-items:center;gap:6px;font-size:.85rem;background:var(--red-soft);color:var(--red-text);padding:4px 6px 4px 10px}
.chip button{font:inherit;border:0;background:none;color:inherit;cursor:pointer;padding:0 4px;font-size:1rem;line-height:1}
.menu{position:relative}
.dd{position:absolute;right:0;top:calc(100% + 4px);z-index:30;background:var(--surface);border:1px solid var(--line);box-shadow:0 14px 30px rgba(0,0,0,.16);min-width:230px;padding:4px}
.dd button{display:block;width:100%;text-align:left;font:inherit;font-size:.9rem;background:none;border:0;padding:9px 12px;cursor:pointer;color:var(--fg)}
.dd button:hover{background:var(--panel);color:var(--red-text)}
.dd small{display:block;color:var(--muted);font-size:.78rem}
.oclayout{display:grid;grid-template-columns:1fr;gap:12px;align-items:start}
.oclayout.with-opts{grid-template-columns:250px 1fr}
.opts{border:1px solid var(--line);background:var(--surface);padding:14px 16px;display:flex;flex-direction:column;gap:14px;font-size:.9rem}
.opts h4{font-family:var(--display);font-weight:600;font-size:.95rem;text-transform:uppercase;letter-spacing:.05em;margin:0;color:var(--muted)}
.opts label{display:flex;align-items:center;gap:8px;cursor:pointer}
.opts input[type=checkbox]{accent-color:var(--red);width:16px;height:16px;margin:0}
.opts select{font:inherit;font-size:.9rem;padding:6px 8px;border:1px solid var(--line);background:var(--surface);color:var(--fg);width:100%}
.opts .from{display:flex;flex-direction:column;gap:6px}
.opts .from b{font-weight:600}
.opts .hint{color:var(--muted);font-size:.8rem;line-height:1.4}
.ocwrap{background:var(--canvas);border:1px solid var(--line);overflow:auto;height:calc(100dvh - 250px);min-height:440px;cursor:grab;position:relative;touch-action:none;overscroll-behavior:contain;
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:24px 24px;background-position:-1px -1px}
@supports not (height:100dvh){.ocwrap{height:calc(100vh - 250px)}}
.ocwrap.dragging{cursor:grabbing;user-select:none}
.oc{width:max-content;min-width:100%;padding:28px 24px 40px}
.oc ul{display:flex;justify-content:center;padding:22px 0 0;margin:0;list-style:none;position:relative}
.oc>ul{padding-top:0}
.oc li{position:relative;padding:22px 8px 0;display:flex;flex-direction:column;align-items:center}
.oc li::before,.oc li::after{content:"";position:absolute;top:0;right:50%;width:50%;height:22px;border-top:2px solid var(--conn)}
.oc li::after{right:auto;left:50%;border-left:2px solid var(--conn)}
.oc li:only-child::before,.oc li:only-child::after{display:none}
.oc li:only-child{padding-top:0}
.oc li:first-child::before,.oc li:last-child::after{border:0}
.oc li:last-child::before{border-right:2px solid var(--conn)}
.oc ul ul::before{content:"";position:absolute;top:0;left:50%;height:22px;border-left:2px solid var(--conn)}
.oc>ul>li{padding-top:0}
.oc>ul>li::before,.oc>ul>li::after{display:none}
.ob{width:210px;text-align:left;border:1px solid var(--line);padding:10px 12px 10px 14px;display:flex;flex-direction:column;gap:2px;position:relative;
  background:linear-gradient(135deg,var(--red) 0 10px,transparent 10px),var(--surface)}
.ob.top{background:var(--red);border-color:var(--red);color:var(--on-red)}
.ob.top .obn,.ob.top .obt{color:var(--on-red)}
.ob.me{box-shadow:0 0 0 2px var(--red)}
.ob.hit,.oli.hit{background:linear-gradient(135deg,var(--red) 0 10px,transparent 10px),var(--hit);box-shadow:0 0 0 3px var(--red)}
.obn{font:inherit;font-weight:600;color:var(--fg);background:none;border:0;padding:0;cursor:pointer;text-align:left;line-height:1.3}
.obn:hover{text-decoration:underline}
.obt{font-size:.8rem;color:var(--muted);line-height:1.3}
.obx{margin-top:8px;align-self:flex-start;font-size:.75rem;font-weight:500;border:1px solid var(--line);background:var(--surface);color:var(--red-text);padding:2px 8px;cursor:pointer;font-variant-numeric:tabular-nums}
.ob.top .obx{background:transparent;border-color:rgba(255,255,255,.6);color:var(--on-red)}
.obx:hover{border-color:var(--red)}
.obf{position:absolute;top:6px;right:6px;font-size:.7rem;border:1px solid transparent;background:none;color:var(--muted);padding:1px 5px;cursor:pointer;opacity:0}
.ob:hover .obf,.obf:focus-visible{opacity:1}
.obf:hover{border-color:var(--red);color:var(--red-text)}
.ob.top .obf{color:var(--on-red)}
.obc{font-size:.75rem;color:var(--muted);margin-top:2px}
.ob.top .obc{color:var(--on-red);opacity:.85}
.oc.compact .ob{width:170px;padding:7px 9px 7px 11px;font-size:.88rem}
.oc.compact .obt,.oc.compact .oli span{font-size:.74rem}
.oc.compact .olist{width:190px}.oc.compact .oli{padding:6px 10px}
.tag{font-family:var(--display);font-size:.72rem;font-weight:600;letter-spacing:.05em;background:var(--red);color:var(--on-red);padding:0 5px;margin-left:6px;vertical-align:1px}
.olist{width:230px;border:1px solid var(--line);background:var(--surface);display:flex;flex-direction:column}
.oli{display:flex;flex-direction:column;align-items:flex-start;gap:1px;text-align:left;font:inherit;color:inherit;background:none;border:0;border-top:1px solid var(--line);padding:8px 12px;cursor:pointer}
.oli:first-child{border-top:0}
.oli:hover{background:var(--panel)}
.oli b{font-weight:600}
.oli span{font-size:.8rem;color:var(--muted);line-height:1.3}
.oli.me{box-shadow:inset 3px 0 0 var(--red)}
.orph{display:flex;flex-direction:column;gap:10px}
.orph .head{margin:0;font-size:.9rem;color:var(--warn);background:var(--warn-soft);padding:8px 12px;border-left:3px solid var(--warn)}

button:focus-visible,.card:focus-visible{outline:2px solid var(--red);outline-offset:2px}
footer{font-size:.8rem;color:var(--muted)}
.focus .actions{margin-top:18px;display:flex;gap:8px;flex-wrap:wrap}

/* Print: only the chart drawing, fitted to a landscape page */
#printArea{display:none}
@media print{
  @page{size:landscape;margin:10mm}
  body>*{display:none!important}
  #printArea{display:block!important}
  #printArea svg{width:100%;height:auto;max-height:95vh}
}
@media (max-width:760px){.oclayout.with-opts{grid-template-columns:1fr}}
@media (max-width:560px){.wrap{gap:16px;padding-top:14px}.brand{padding-bottom:12px}.focus{grid-template-columns:1fr;padding:22px}.focus h2{font-size:1.7rem}.logo{height:42px}h1{font-size:1.6rem}.who{display:none}
  .bar{gap:8px}.search{flex-basis:100%}#meBtn{flex:1}.seg{flex:2}.seg button{flex:1;padding:10px 8px}.ocbar .note{margin-left:0}.ocwrap{height:calc(100dvh - 210px);min-height:360px}}
</style>

<style>body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
<div class="wrap" id="wrap">
  <header style="display:flex;flex-direction:column;gap:16px">
    <div class="brand">
      <svg class="logo" viewBox="0 0 728 907" role="img" aria-label="emh"><path class="lg-m" fill-rule="evenodd" d="M231,334 232,333 271,333 272,334 272,359 279,350 290,340 306,331 323,327 342,328 353,331 365,338 373,346 381,361 386,354 404,338 413,333 429,328 436,327 456,328 465,330 479,337 490,348 496,359 501,383 501,521 500,522 460,522 458,520 458,387 454,374 447,367 436,363 426,363 414,366 404,372 395,381 388,394 387,400 387,521 386,522 346,522 345,521 345,396 344,386 341,376 333,367 322,363 312,363 302,366 293,371 282,382 277,390 274,399 274,520 272,522 232,522 231,521Z"/><path class="lg-mark" fill-rule="evenodd" d="M201,0 201,576 531,906 531,330ZM231,334 232,333 271,333 272,334 272,359 279,350 290,340 306,331 323,327 342,328 353,331 365,338 373,346 381,361 386,354 404,338 413,333 429,328 436,327 456,328 465,330 479,337 490,348 496,359 501,383 501,521 500,522 460,522 458,520 458,387 454,374 447,367 436,363 426,363 414,366 404,372 395,381 388,394 387,400 387,521 386,522 346,522 345,521 345,396 344,386 341,376 333,367 322,363 312,363 302,366 293,371 282,382 277,390 274,399 274,520 272,522 232,522 231,521Z"/><path class="lg-eh" fill-rule="evenodd" d="M76,329 62,332 43,340 33,347 21,359 13,371 5,390 1,409 0,440 3,461 8,477 18,495 31,509 43,517 58,523 73,526 100,527 117,525 133,520 147,512 159,500 169,481 172,467 170,466 136,466 133,468 132,473 127,482 118,490 109,494 98,496 78,495 65,490 58,485 51,477 43,460 40,438 41,437 175,437 175,407 172,388 167,373 157,356 146,345 139,340 127,334 113,330 93,328ZM41,404 46,386 51,377 58,369 65,364 75,360 101,359 109,361 117,365 126,373 134,389 136,409 135,410 42,410ZM563,264 563,521 603,521 603,400 605,393 611,383 622,372 637,364 646,362 660,362 668,364 679,372 684,381 687,400 687,521 727,521 727,390 724,370 717,353 708,342 696,334 679,329 663,328 662,329 652,329 631,336 620,343 606,357 603,356 603,264Z"/></svg>
      <h1>People Finder</h1>
      <span class="pill" id="samplePill" hidden>Sample data</span>
      <span class="who" id="who"></span>
    </div>
    <div class="bar">
      <div class="search" role="combobox" aria-expanded="false" aria-haspopup="listbox" id="combo">
        <input id="q" type="search" autocomplete="off" placeholder="Search by name, role or team" aria-label="Search people" aria-controls="results">
        <span class="kbd" aria-hidden="true">/</span>
        <ul class="results" id="results" role="listbox" hidden></ul>
      </div>
      <button class="btn" id="meBtn" disabled>My position</button>
      <div class="seg" role="group" aria-label="View">
        <button id="vPerson" aria-pressed="true">Person</button>
        <button id="vTree" aria-pressed="false">Organisation chart</button>
      </div>
    </div>
  </header>

  <main id="personView" class="pv">
    <nav class="trail" id="trail" aria-label="Reporting line"></nav>
    <article class="focus" id="focus" aria-live="polite"><p class="none">Loading people…</p></article>
    <section id="reportsSec"><h3>Direct reports <span id="rc"></span></h3><div class="grid" id="reports"></div></section>
    <section id="peersSec" hidden><h3>Same team <span id="pc"></span></h3><div class="grid" id="peers"></div></section>
  </main>

  <main id="treeView" class="pv" hidden>
    <div class="ocbar">
      <span class="chip" id="fromChip" hidden><span id="fromName"></span><button id="fromReset" aria-label="Back to the whole organisation" title="Back to the whole organisation">×</button></span>
      <button class="btn sm" id="expAll">Expand all</button>
      <button class="btn sm" id="colAll">Collapse all</button>
      <div class="zoom" aria-label="Zoom">
        <button id="zOut" aria-label="Zoom out">−</button><span id="zVal">100%</span><button id="zIn" aria-label="Zoom in">+</button>
      </div>
      <button class="btn sm" id="zFit">Fit to screen</button>
      <span class="sep" aria-hidden="true"></span>
      <div class="menu">
        <button class="btn sm" id="exportBtn" aria-haspopup="menu" aria-expanded="false">Export ▾</button>
        <div class="dd" id="exportMenu" role="menu" hidden>
          <button role="menuitem" data-export="png">Image (PNG)<small>For email, Teams or a slide</small></button>
          <button role="menuitem" data-export="svg">Vector (SVG)<small>Scales cleanly; opens in Visio or a browser</small></button>
          <button role="menuitem" data-export="csv">List (CSV)<small>The people shown, for Excel</small></button>
        </div>
      </div>
      <button class="btn sm" id="printBtn">Print</button>
      <button class="btn sm" id="optBtn" aria-expanded="false" aria-controls="opts">Display options</button>
      <span class="note" id="treeNote"></span>
    </div>
    <div class="oclayout" id="oclayout">
      <aside class="opts" id="opts" hidden aria-label="Display options">
        <div class="from">
          <h4>Chart starts from</h4>
          <b id="optRoot"></b>
          <button class="btn sm" id="optRootTop">Whole organisation</button>
          <p class="hint">To start from someone else, open their details and choose “Team chart”, or use “From here” on a box.</p>
        </div>
        <div>
          <h4>Levels to show</h4>
          <select id="optLevels" aria-label="Levels to show">
            <option value="1">1 – just the top</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option><option value="all">All levels</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <h4>Show on each person</h4>
          <label><input type="checkbox" data-opt="title" checked> Job title</label>
          <label><input type="checkbox" data-opt="dept"> Team</label>
          <label><input type="checkbox" data-opt="office"> Office</label>
          <label><input type="checkbox" data-opt="mail"> Email</label>
          <label><input type="checkbox" data-opt="counts"> Team size</label>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <h4>Layout</h4>
          <label><input type="checkbox" data-opt="lists" checked> Group people without reports into a list</label>
          <label><input type="checkbox" data-opt="compact"> Compact boxes</label>
        </div>
        <p class="hint">Export and Print use what’s on screen: this starting point, these levels and these details.</p>
      </aside>
      <div class="ocwrap" id="ocwrap"><div class="oc" id="oc"></div></div>
    </div>
    <div class="orph" id="orphans"></div>
  </main>

  <footer id="foot">Prototype with made-up people. Live, this list comes from Entra ID and you sign in with your emh account.</footer>
</div>
<div id="printArea" aria-hidden="true"></div>

<script>
/* Data source: on Azure Static Web Apps, /.auth/me gives the signed-in user and /api/people the staff list from Graph.
   Anywhere else (this preview) it falls back to the sample people below. */
const SAMPLE = [
 ["ceo","Helen Marsh","Chief Executive","Executive Office","Leicester",null],
 ["dh","David Okafor","Executive Director of Housing","Housing","Leicester","ceo"],
 ["da","Rachel Lindqvist","Executive Director of Assets & Repairs","Assets & Repairs","Melton","ceo"],
 ["df","Imran Shah","Executive Director of Finance & Resources","Finance & Resources","Leicester","ceo"],
 ["dp","Claire Bennett","Director of People & Culture","People & Culture","Leicester","ceo"],
 ["ea","Joanne Pickering","Executive Assistant to the CEO","Executive Office","Leicester","ceo"],
 ["hn","Tom Wheeler","Head of Neighbourhoods","Housing","Leicester","dh"],
 ["hi","Priya Mistry","Head of Income & Tenancy Sustainment","Housing","Leicester","dh"],
 ["hs","Gareth Lewis","Head of Supported Housing","Housing","Nottingham","dh"],
 ["n1","Amy Fletcher","Neighbourhood Manager (North)","Housing","Loughborough","hn"],
 ["n2","Kwame Asante","Neighbourhood Manager (South)","Housing","Leicester","hn"],
 ["n3","Sophie Turner","Neighbourhood Officer","Housing","Loughborough","n1"],
 ["n4","Liam Doyle","Neighbourhood Officer","Housing","Loughborough","n1"],
 ["n5","Fatima Begum","Neighbourhood Officer","Housing","Leicester","n2"],
 ["i1","Mark Ellis","Income Team Leader","Housing","Leicester","hi"],
 ["i2","Hannah Price","Income Officer","Housing","Leicester","i1"],
 ["i3","Daniel Kowalski","Money Advice Officer","Housing","Leicester","i1"],
 ["s1","Natalie Brooks","Scheme Manager","Housing","Nottingham","hs"],
 ["ar","Simon Hart","Head of Repairs","Assets & Repairs","Melton","da"],
 ["ac","Lucy Chambers","Head of Building Safety & Compliance","Assets & Repairs","Melton","da"],
 ["ai","Oliver Grant","Head of Asset Investment","Assets & Repairs","Melton","da"],
 ["r1","Paul Henderson","Repairs Manager","Assets & Repairs","Melton","ar"],
 ["r2","Ben Cartwright","Repairs Planner","Assets & Repairs","Melton","r1"],
 ["r3","Aisha Rahman","Damp & Mould Surveyor","Assets & Repairs","Melton","r1"],
 ["r4","Chris Moran","Multi-trade Operative Supervisor","Assets & Repairs","Melton","r1"],
 ["c1","Emma Walsh","Gas & Electrical Compliance Manager","Assets & Repairs","Melton","ac"],
 ["c2","Jordan Reid","Fire Safety Officer","Assets & Repairs","Melton","ac"],
 ["c3","Megan Hall","Compliance Administrator","Assets & Repairs","Melton","c1"],
 ["a1","Ravi Patel","Stock Condition Surveyor","Assets & Repairs","Melton","ai"],
 ["hf","Karen Doherty","Head of Finance","Finance & Resources","Leicester","df"],
 ["ht","Alex Morgan","Head of ICT","Finance & Resources","Leicester","df"],
 ["hg","Ruth Adeyemi","Head of Governance","Finance & Resources","Leicester","df"],
 ["f1","Steven Clarke","Financial Accountant","Finance & Resources","Leicester","hf"],
 ["f2","Zoe Mitchell","Management Accountant","Finance & Resources","Leicester","hf"],
 ["t1","Jamie Fox","Operations Manager (Service Desk)","ICT","Leicester","ht"],
 ["t2","Nadia Hussain","Solutions Manager","ICT","Leicester","ht"],
 ["t3","Peter Lawson","Data & Insights Manager","ICT","Leicester","ht"],
 ["t4","Grace Kim","Quality Manager","ICT","Leicester","ht"],
 ["t5","Ryan Shaw","Service Desk Analyst","ICT","Leicester","t1"],
 ["t6","Ella Dunn","Infrastructure Engineer","ICT","Leicester","t1"],
 ["t7","Marcus Webb","Business Analyst","ICT","Leicester","t2"],
 ["t8","Holly Grant","Power Platform Developer","ICT","Leicester","t2"],
 ["t9","Sam Iqbal","BI Developer","ICT","Leicester","t3"],
 ["t10","Laura Finch","Data Protection Advisor","ICT","Leicester","t4"],
 ["g1","Victoria Stone","Company Secretary","Finance & Resources","Leicester","hg"],
 ["p1","Andrew Bell","HR Business Partner","People & Culture","Leicester","dp"],
 ["p2","Charlotte Ng","Learning & Development Lead","People & Culture","Leicester","dp"],
 ["p3","Lewis Burton","HR Advisor","People & Culture","Leicester","p1"],
 ["p4","Isabel Cruz","Recruitment Coordinator","People & Culture","Leicester","p1"],
 ["x1","Kieran Walsh","Customer Insight Analyst","Customer Experience","Leicester",null],
 ["x2","Bethany Cole","Complaints Officer","Customer Experience","Leicester",null]
].map(([id,name,title,dept,office,mgr],i)=>{const m=name.toLowerCase().replace(/[^a-z ]/g,"").split(" ").join(".")+"@example.org";
  // Made-up numbers: everyone gets a work extension, roughly two in three a mobile
  const phone=`0116 000 ${String(1000+i*7).slice(-4)}`,mobile=i%3===2?"":`07700 900${String(100+i).slice(-3)}`;
  return {id,name,title,dept,office,mgr,mail:m,upn:m,phone,mobile}});
const SAMPLE_ME="ht";

let P=[],byId={},kidsOf={},totals={},meId=null,current=null,view="person",isSample=false,TOP=null;
const $=id=>document.getElementById(id);
const initials=n=>n.split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const kids=id=>kidsOf[id]||[];
const smooth=()=>matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";
const plural=(n,w)=>`${n} ${w}${n===1?"":"s"}`;
// Keeps digits, + and the extension marker so "0116 123 4567 ext 12" still dials
const telHref=s=>String(s).replace(/\s*(ext|x)\.?\s*(\d+)$/i,";ext=$2").replace(/[^\d+;=a-z]/g,"");

async function getJSON(url){const r=await fetch(url,{credentials:"same-origin"});if(!r.ok)throw new Error(r.status);return r.json()}

async function load(){
  let principal=null,onSWA=false;
  try{const me=await getJSON("/.auth/me");if(me&&"clientPrincipal" in me){onSWA=true;principal=me.clientPrincipal}}catch(e){}
  if(onSWA){
    try{P=await getJSON("/api/people")}
    catch(e){$("focus").innerHTML=`<p class="none">The staff list didn't load. Refresh the page. If it still doesn't load, contact the ICT Service Desk.</p>`;return}
    const who=(principal?.userDetails||"").toLowerCase();
    meId=P.find(p=>(p.upn||"").toLowerCase()===who||(p.mail||"").toLowerCase()===who)?.id||null;
    $("foot").textContent=`${P.length.toLocaleString("en-GB")} people, from Entra ID. If your details or manager are wrong, ask HR to update them.`;
  }else{
    isSample=true;P=SAMPLE;meId=SAMPLE_ME;$("samplePill").hidden=false;
  }
  index();
  const me=byId[meId];
  $("who").textContent=me?`Signed in as ${me.name}${isSample?" (sample)":""}`:"";
  $("meBtn").disabled=!me;
  const h=decodeURIComponent((location.hash||"").slice(1));
  show(byId[h]?h:(meId||TOP),false);
}

function index(){
  byId=Object.fromEntries(P.map(p=>[p.id,p]));
  kidsOf={};totals={};
  P.forEach(p=>{if(p.mgr&&(!byId[p.mgr]||p.mgr===p.id))p.mgr=null;if(p.mgr)(kidsOf[p.mgr]??=[]).push(p)});
  Object.values(kidsOf).forEach(a=>a.sort((x,y)=>x.name.localeCompare(y.name)));
  const count=(id,seen=new Set())=>{if(id in totals)return totals[id];if(seen.has(id))return 0;seen.add(id);
    return totals[id]=kids(id).reduce((n,k)=>n+1+count(k.id,seen),0)};
  P.forEach(p=>count(p.id));
  TOP=roots().sort((a,b)=>totals[b.id]-totals[a.id])[0]?.id;
  if(!rootId||!byId[rootId])rootId=TOP;
}
const roots=()=>P.filter(p=>!p.mgr);
const chainOf=id=>{const c=[];let m=byId[byId[id]?.mgr];while(m&&c.length<40){c.unshift(m);m=byId[m.mgr]}return c};

/* ---------- Person view ---------- */
function card(p){
  const n=kids(p.id).length;
  return `<button class="card" data-id="${esc(p.id)}"><span class="av">${initials(p.name)}</span>
    <span class="meta"><div class="n">${esc(p.name)}</div><div class="r">${esc(p.title)}</div></span>
    ${n?`<span class="cnt">${plural(n,"report")}</span>`:""}</button>`;
}
function show(id,push=true){
  const p=byId[id];if(!p)return;current=id;
  const chain=chainOf(id);
  $("trail").innerHTML=chain.length
    ? chain.map(c=>`<button data-id="${esc(c.id)}">${esc(c.name)}</button><span class="sep" aria-hidden="true">›</span>`).join("")+`<span>${esc(p.name)}</span>`
    : `<span>${p.id===TOP?"Top of the organisation":"No manager recorded"}</span>`;
  const mgr=byId[p.mgr];
  $("focus").innerHTML=`<span class="av" aria-hidden="true">${initials(p.name)}</span><div class="info">
    <h2>${esc(p.name)}${p.id===meId?`<span class="you">You</span>`:""}</h2><div class="role">${esc(p.title)||"No job title recorded"}</div>
    <dl class="facts">
      <div><dt>Team</dt><dd>${esc(p.dept)||"—"}</dd></div>
      <div><dt>Office</dt><dd>${esc(p.office)||"—"}</dd></div>
      <div><dt>Reports to</dt><dd>${mgr?`<button data-id="${esc(mgr.id)}">${esc(mgr.name)}</button>`:"—"}</dd></div>
      <div><dt>Email</dt><dd>${p.mail?`<a id="mail" href="mailto:${esc(p.mail)}">${esc(p.mail)}</a><button class="copy" id="copy" data-copy="mail">Copy</button>`:"—"}</dd></div>
      <div><dt>Phone</dt><dd>${p.phone?`<a id="phone" href="tel:${esc(telHref(p.phone))}">${esc(p.phone)}</a><button class="copy" data-copy="phone">Copy</button>`:"—"}</dd></div>
      <div><dt>Mobile</dt><dd>${p.mobile?`<a id="mobile" href="tel:${esc(telHref(p.mobile))}">${esc(p.mobile)}</a><button class="copy" data-copy="mobile">Copy</button>`:"—"}</dd></div>
    </dl>
    <div class="actions">${kids(p.id).length?`<button class="btn sm" data-chart="${esc(p.id)}">Team chart</button>`:""}<button class="btn sm" data-locate="${esc(p.id)}">Show in organisation chart</button></div></div>`;
  const r=kids(p.id);
  $("rc").textContent=r.length||"";
  $("reports").innerHTML=r.length?r.map(card).join(""):`<p class="none">No direct reports.</p>`;
  const peers=p.mgr?kids(p.mgr).filter(x=>x.id!==p.id):[];
  $("peersSec").hidden=!peers.length;$("pc").textContent=peers.length||"";$("peers").innerHTML=peers.map(card).join("");
  setView("person");
  if(push){try{history.replaceState(null,"","#"+encodeURIComponent(p.id))}catch(e){}}
  window.scrollTo({top:0,behavior:smooth()});
}

/* ---------- Org chart: top-down ---------- */
let expanded=new Set(),hitId=null,zoom=1,rootId=null;
// Display options; remembered on this device
const OPT_KEY="pf-display";
let opts={title:true,dept:false,office:false,mail:false,counts:false,lists:true,compact:false};
try{Object.assign(opts,JSON.parse(localStorage.getItem(OPT_KEY)||"{}"))}catch(e){}
function saveOpts(){try{localStorage.setItem(OPT_KEY,JSON.stringify(opts))}catch(e){}}
// The lines shown under a name, according to the display options
const details=p=>[opts.title&&p.title,opts.dept&&p.dept,opts.office&&p.office,opts.mail&&p.mail].filter(Boolean);
const root=()=>byId[rootId]||byId[TOP];
const underRoot=id=>{let m=id,n=0;while(m&&n++<60){if(m===rootId)return true;m=byId[m]?.mgr}return false};

function box(p){
  const k=kids(p.id),open=expanded.has(p.id);
  const cls=["ob",p.id===rootId?"top":"",p.id===meId?"me":"",p.id===hitId?"hit":""].join(" ");
  return `<div class="${cls}" data-row="${esc(p.id)}">
    <button class="obn" data-id="${esc(p.id)}">${esc(p.name)}${p.id===meId?`<span class="tag">You</span>`:""}</button>
    ${details(p).map(d=>`<div class="obt">${esc(d)}</div>`).join("")}
    ${opts.counts&&k.length?`<div class="obc">Team of ${totals[p.id]}</div>`:""}
    ${k.length?`<button class="obx" data-toggle="${esc(p.id)}" aria-expanded="${open}" title="${totals[p.id]} people in this part of the organisation">${open?"Hide":"Show"} ${plural(k.length,"report")}</button>`:""}
    ${k.length&&p.id!==rootId?`<button class="obf" data-chart="${esc(p.id)}" title="Start the chart from ${esc(p.name)}">From here</button>`:""}
  </div>`;
}
function leafRow(p){
  return `<button class="oli${p.id===meId?" me":""}${p.id===hitId?" hit":""}" data-id="${esc(p.id)}" data-row="${esc(p.id)}"><b>${esc(p.name)}${p.id===meId?`<span class="tag">You</span>`:""}</b>${details(p).map(d=>`<span>${esc(d)}</span>`).join("")}</button>`;
}
function branch(p,depth=0){
  const k=kids(p.id);
  if(!k.length||!expanded.has(p.id)||depth>40) return `<li>${box(p)}</li>`;
  const mgrs=opts.lists?k.filter(c=>kids(c.id).length):k,leaves=opts.lists?k.filter(c=>!kids(c.id).length):[];
  const items=mgrs.map(c=>branch(c,depth+1));
  // People with no reports are grouped into one list under their manager, which keeps the chart narrow
  if(leaves.length) items.push(`<li><div class="olist">${leaves.map(leafRow).join("")}</div></li>`);
  return `<li>${box(p)}<ul>${items.join("")}</ul></li>`;
}
// Everyone in the part of the chart that's on screen (the root, its expanded branches, and the people in lists)
function inView(){
  const out=[];const walk=(p,depth)=>{out.push(p);if(expanded.has(p.id)&&depth<=40)kids(p.id).forEach(c=>walk(c,depth+1))};
  if(root())walk(root(),0);return out;
}
function renderChart(anchorId){
  if(!rootId||!byId[rootId])rootId=TOP;
  const wrap=$("ocwrap");
  const before=anchorId?wrap.querySelector(`[data-row="${CSS.escape(anchorId)}"]`)?.getBoundingClientRect():null;
  const r=root();
  $("oc").classList.toggle("compact",opts.compact);
  $("oc").innerHTML=r?`<ul>${branch(r)}</ul>`:"";
  if(before){const after=wrap.querySelector(`[data-row="${CSS.escape(anchorId)}"]`)?.getBoundingClientRect();
    if(after){wrap.scrollLeft+=after.left-before.left;wrap.scrollTop+=after.top-before.top}}
  const orph=rootId===TOP?roots().filter(p=>p.id!==TOP).sort((a,b)=>a.name.localeCompare(b.name)):[];
  $("orphans").innerHTML=orph.length?`<p class="head">${orph.length===1?"1 person has":orph.length+" people have"} no manager in Entra ID, so they're not in the chart.</p><div class="grid">${orph.map(card).join("")}</div>`:"";
  const n=inView().length,touch=matchMedia("(pointer:coarse)").matches;
  $("treeNote").textContent=`${n.toLocaleString("en-GB")} of ${P.length.toLocaleString("en-GB")} people shown · ${touch?"drag to move, pinch to zoom":"drag to move around"} · click a name for details`;
  $("fromChip").hidden=rootId===TOP;$("fromName").textContent=r?`From ${r.name}`:"";
  $("optRoot").textContent=rootId===TOP?"Whole organisation":r.name;$("optRootTop").hidden=rootId===TOP;
}
function centreOn(id){
  const wrap=$("ocwrap"),el=wrap.querySelector(`[data-row="${CSS.escape(id)}"]`);if(!el)return;
  const w=wrap.getBoundingClientRect(),r=el.getBoundingClientRect();
  wrap.scrollTo({left:wrap.scrollLeft+(r.left-w.left)-(w.width-r.width)/2,top:wrap.scrollTop+(r.top-w.top)-Math.min(120,(w.height-r.height)/2),behavior:smooth()});
}
function reveal(id){
  if(!byId[id])return;
  if(!underRoot(id))rootId=TOP;
  expanded.add(rootId);chainOf(id).forEach(m=>expanded.add(m.id));
  hitId=id;renderChart();
  requestAnimationFrame(()=>centreOn(id));
}
// Start the chart from one person, opened to the chosen number of levels
function chartFrom(id){
  rootId=byId[id]?id:TOP;hitId=null;applyLevels();setView("tree");
  requestAnimationFrame(()=>{fit();$("ocwrap").scrollTop=0});
}
function applyLevels(){
  const v=$("optLevels").value;expanded=new Set();
  const walk=(p,depth)=>{if(!kids(p.id).length)return;if(v==="all"||depth<Number(v))expanded.add(p.id);kids(p.id).forEach(c=>walk(c,depth+1))};
  if(root())walk(root(),1);renderChart();
}
function setZoom(z){
  zoom=Math.min(2,Math.max(.25,Math.round(z*100)/100));
  $("oc").style.zoom=zoom;$("zVal").textContent=Math.round(zoom*100)+"%";
}
// Zoom so the point under (cx,cy) on screen stays put
function zoomAt(z,cx,cy){
  const w=$("ocwrap"),r=w.getBoundingClientRect();
  const px=(w.scrollLeft+cx-r.left)/zoom,py=(w.scrollTop+cy-r.top)/zoom;
  setZoom(z);w.scrollLeft=px*zoom-(cx-r.left);w.scrollTop=py*zoom-(cy-r.top);
}
function fit(){
  $("oc").style.zoom=1;const w=$("oc").scrollWidth,avail=$("ocwrap").clientWidth;
  setZoom(Math.min(1,avail/w));$("ocwrap").scrollLeft=0;
}
function setView(v){
  view=v;
  $("personView").hidden=v!=="person";$("treeView").hidden=v!=="tree";
  $("vPerson").setAttribute("aria-pressed",v==="person");$("vTree").setAttribute("aria-pressed",v==="tree");
  $("wrap").classList.toggle("wide",v==="tree");
}
$("vPerson").onclick=()=>current?show(current):setView("person");
$("vTree").onclick=()=>{setView("tree");if(!expanded.size)applyLevels();reveal(current||rootId||TOP)};
$("expAll").onclick=()=>{inViewAll().forEach(p=>{if(kids(p.id).length)expanded.add(p.id)});renderChart();requestAnimationFrame(fit)};
function inViewAll(){const out=[];const walk=p=>{out.push(p);kids(p.id).forEach(walk)};if(root())walk(root());return out}
$("colAll").onclick=()=>{expanded=new Set([rootId]);hitId=null;renderChart();setZoom(1);requestAnimationFrame(()=>centreOn(rootId))};
$("zIn").onclick=()=>{const r=$("ocwrap").getBoundingClientRect();zoomAt(zoom*1.2,r.left+r.width/2,r.top+r.height/2)};
$("zOut").onclick=()=>{const r=$("ocwrap").getBoundingClientRect();zoomAt(zoom/1.2,r.left+r.width/2,r.top+r.height/2)};
$("zFit").onclick=fit;
$("meBtn").onclick=()=>{if(!meId)return;current=meId;view==="tree"?reveal(meId):show(meId)};
$("fromReset").onclick=$("optRootTop").onclick=()=>chartFrom(TOP);

/* Display options panel */
$("optBtn").onclick=()=>{const open=$("opts").hidden;$("opts").hidden=!open;$("optBtn").setAttribute("aria-expanded",open);$("optBtn").setAttribute("aria-pressed",open);$("oclayout").classList.toggle("with-opts",open)};
document.querySelectorAll("[data-opt]").forEach(cb=>{cb.checked=!!opts[cb.dataset.opt];
  cb.onchange=()=>{opts[cb.dataset.opt]=cb.checked;saveOpts();renderChart()}});
$("optLevels").onchange=()=>{applyLevels();requestAnimationFrame(fit)};

/* Drag to pan, pinch to zoom (touch), Ctrl+wheel / trackpad pinch to zoom (desktop) */
(()=>{const w=$("ocwrap");let d=null,pinch=null;const pts=new Map();
  const mid=()=>{const [a,b]=[...pts.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)}};
  w.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){d=null;pinch={...mid(),z:zoom};w.classList.add("dragging");pts.forEach((_,id)=>{try{w.setPointerCapture(id)}catch(x){}});return}
    if(e.target.closest("button"))return;
    d={x:e.clientX,y:e.clientY,l:w.scrollLeft,t:w.scrollTop};w.setPointerCapture(e.pointerId);w.classList.add("dragging")});
  w.addEventListener("pointermove",e=>{
    if(pts.has(e.pointerId))pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size===2){const m=mid();zoomAt(pinch.z*(m.d/pinch.d),m.x,m.y);return}
    if(!d)return;w.scrollLeft=d.l-(e.clientX-d.x);w.scrollTop=d.t-(e.clientY-d.y)});
  const end=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){d=null;w.classList.remove("dragging")}};
  w.addEventListener("pointerup",end);w.addEventListener("pointercancel",end);
  w.addEventListener("wheel",e=>{if(!e.ctrlKey)return;e.preventDefault();zoomAt(zoom*(e.deltaY<0?1.1:1/1.1),e.clientX,e.clientY)},{passive:false});
  // iOS Safari fires these for pinch; stopping them keeps the whole page from zooming instead of the chart
  ["gesturestart","gesturechange","gestureend"].forEach(t=>w.addEventListener(t,e=>e.preventDefault()));
})();

/* ---------- Export and print: the chart drawn as SVG ---------- */
// Draws the chart as currently shown (starting point, open branches, details). Plain SVG text, so it exports and prints exactly as built.
function chartSVG(){
  const C=document.createElement("canvas").getContext("2d");
  const FONT="Arial, Helvetica, sans-serif",BW=opts.compact?180:210,PX=12,PY=10,GX=18,GY=46,LH=16,LS=14,RED="#e30613",INK="#1d1d1b",MUTED="#5f5f5c",LINE="#d9d9d9",CONN="#b5b5b5";
  const FN=`600 13px ${FONT}`,FS=`11px ${FONT}`;
  function wrap(text,font,max,maxLines){C.font=font;const words=String(text).split(/\s+/).filter(Boolean),lines=[];let cur="";
    for(const w of words){const t=cur?cur+" "+w:w;if(C.measureText(t).width<=max||!cur)cur=t;else{lines.push(cur);cur=w}}
    if(cur)lines.push(cur);
    if(lines.length>maxLines){lines.length=maxLines;let l=lines[maxLines-1];while(C.measureText(l+"…").width>max&&l.length>1)l=l.slice(0,-1);lines[maxLines-1]=l+"…"}
    return lines}
  const textW=BW-PX*2;
  const mkRow=(p,pad)=>{const name=wrap(p.name,FN,textW-pad,2),sub=details(p).flatMap(f=>wrap(f,FS,textW-pad,2));return{p,name,sub,h:PY*2+name.length*LH+sub.length*LS}};
  function mk(p,depth){
    const n=mkRow(p,8);n.kids=[];
    if(opts.counts&&kids(p.id).length)n.h+=LS;
    if(kids(p.id).length&&expanded.has(p.id)&&depth<40){
      const k=kids(p.id),mg=opts.lists?k.filter(c=>kids(c.id).length):k,lv=opts.lists?k.filter(c=>!kids(c.id).length):[];
      n.kids=mg.map(c=>mk(c,depth+1));
      if(lv.length){const rows=lv.map(c=>mkRow(c,0));n.kids.push({list:true,rows,h:rows.reduce((a,r)=>a+r.h,0),kids:[],sw:BW})}
    }
    n.sw=Math.max(BW,n.kids.reduce((a,c)=>a+c.sw,0)+GX*Math.max(0,n.kids.length-1));
    return n;
  }
  const r=root();if(!r)return null;
  const tree=mk(r,0);
  const M=28,HEAD=64;let maxY=0,count=0;
  function place(n,x0,y){n.x=x0+(n.sw-BW)/2;n.y=y;maxY=Math.max(maxY,y+n.h);
    let cx=x0+(n.sw-(n.kids.reduce((a,c)=>a+c.sw,0)+GX*Math.max(0,n.kids.length-1)))/2;
    n.kids.forEach(c=>{place(c,cx,y+n.h+GY);cx+=c.sw+GX})}
  place(tree,M,HEAD+M);
  const W=Math.max(tree.sw+M*2,520),H=maxY+M;
  const out=[];
  const text=(x,y,lines,font,size,fill,lh,weight)=>lines.map((l,i)=>`<text x="${x}" y="${y+i*lh}" font-family="${FONT}" font-size="${size}" font-weight="${weight||400}" fill="${fill}">${esc(l)}</text>`).join("");
  function draw(n,isRoot){
    if(n.list){
      out.push(`<rect x="${n.x}" y="${n.y}" width="${BW}" height="${n.h}" fill="#fff" stroke="${LINE}"/>`);
      let y=n.y;n.rows.forEach((row,i)=>{count++;if(i)out.push(`<line x1="${n.x}" x2="${n.x+BW}" y1="${y}" y2="${y}" stroke="${LINE}"/>`);
        out.push(text(n.x+PX,y+PY+12,row.name,FN,13,INK,LH,600));out.push(text(n.x+PX,y+PY+12+row.name.length*LH-2,row.sub,FS,11,MUTED,LS));y+=row.h});
      return;
    }
    count++;
    const fill=isRoot?RED:"#fff",ink=isRoot?"#fff":INK,sub=isRoot?"#fde8e9":MUTED;
    out.push(`<rect x="${n.x}" y="${n.y}" width="${BW}" height="${n.h}" fill="${fill}" stroke="${isRoot?RED:LINE}"/>`);
    if(!isRoot)out.push(`<polygon points="${n.x},${n.y} ${n.x+10},${n.y} ${n.x},${n.y+10}" fill="${RED}"/>`);
    out.push(text(n.x+PX+2,n.y+PY+12,n.name,FN,13,ink,LH,600));
    let y=n.y+PY+12+n.name.length*LH-2;
    out.push(text(n.x+PX+2,y,n.sub,FS,11,sub,LS));y+=n.sub.length*LS;
    if(opts.counts&&kids(n.p.id).length)out.push(text(n.x+PX+2,y,[`Team of ${totals[n.p.id]}`],FS,11,sub,LS));
    if(n.kids.length){
      const by=n.y+n.h,my=by+GY/2,cx=n.x+BW/2;
      out.push(`<line x1="${cx}" y1="${by}" x2="${cx}" y2="${my}" stroke="${CONN}" stroke-width="1.5"/>`);
      const xs=n.kids.map(c=>c.x+BW/2);
      out.push(`<line x1="${Math.min(...xs)}" y1="${my}" x2="${Math.max(...xs)}" y2="${my}" stroke="${CONN}" stroke-width="1.5"/>`);
      n.kids.forEach(c=>{out.push(`<line x1="${c.x+BW/2}" y1="${my}" x2="${c.x+BW/2}" y2="${c.y}" stroke="${CONN}" stroke-width="1.5"/>`);draw(c,false)});
    }
  }
  draw(tree,true);
  const when=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const logo=document.querySelector(".logo").innerHTML.replace(/class="lg-m"/g,'fill="#fff"').replace(/class="lg-mark"/g,`fill="${RED}"`).replace(/class="lg-eh"/g,`fill="${RED}"`);
  const head=`<g transform="translate(${M},${M}) scale(${36/907})">${logo}</g>
    <text x="${M+40}" y="${M+16}" font-family="${FONT}" font-size="18" font-weight="700" fill="${RED}">PEOPLE FINDER</text>
    <text x="${M+40}" y="${M+34}" font-family="${FONT}" font-size="12" fill="${MUTED}">${esc(rootId===TOP?"Whole organisation":r.name+"’s team")} · ${count} ${count===1?"person":"people"} · ${esc(when)}${isSample?" · sample data":""}</text>`;
  return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${head}${out.join("")}</svg>`,w:W,h:H,count};
}
function download(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
const fileStem=()=>`emh-org-chart-${(rootId===TOP?"all":root().name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}-${new Date().toISOString().slice(0,10)}`;
async function exportChart(kind){
  if(kind==="csv"){
    const cell=v=>`"${String(v??"").replace(/"/g,'""')}"`;
    const rows=[["Name","Job title","Team","Office","Email","Phone","Mobile","Reports to"],
      ...inView().map(p=>[p.name,p.title,p.dept,p.office,p.mail,p.phone,p.mobile,byId[p.mgr]?.name||""])];
    return download(fileStem()+".csv",new Blob(["﻿"+rows.map(r=>r.map(cell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
  }
  const c=chartSVG();if(!c)return;
  if(kind==="svg")return download(fileStem()+".svg",new Blob([c.svg],{type:"image/svg+xml;charset=utf-8"}));
  // PNG: draw the SVG onto a canvas at 2x for a crisp image
  const img=new Image();
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(c.svg)});
  const scale=Math.min(2,8000/Math.max(c.w,c.h)),cv=document.createElement("canvas");cv.width=Math.round(c.w*scale);cv.height=Math.round(c.h*scale);
  const g=cv.getContext("2d");g.scale(scale,scale);g.drawImage(img,0,0);
  cv.toBlob(b=>download(fileStem()+".png",b),"image/png");
}
function printChart(){
  const c=chartSVG();if(!c)return;
  const area=$("printArea");area.innerHTML=c.svg;
  const done=()=>{area.innerHTML="";window.removeEventListener("afterprint",done)};
  window.addEventListener("afterprint",done);
  window.print();
}
$("exportBtn").onclick=()=>{const open=$("exportMenu").hidden;$("exportMenu").hidden=!open;$("exportBtn").setAttribute("aria-expanded",open)};
document.addEventListener("click",e=>{if(!e.target.closest(".menu")){$("exportMenu").hidden=true;$("exportBtn").setAttribute("aria-expanded","false")}});
$("exportMenu").onclick=e=>{const b=e.target.closest("[data-export]");if(!b)return;$("exportMenu").hidden=true;$("exportBtn").setAttribute("aria-expanded","false");
  exportChart(b.dataset.export).catch(()=>alert("The export didn't work. Try again, or use Print instead."))};
$("printBtn").onclick=printChart;

/* Clicks */
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-copy]");
  if(c){const el=$(c.dataset.copy),t=el.textContent;
    Promise.resolve(navigator.clipboard?.writeText(t)).then(()=>{c.textContent="Copied"},()=>getSelection().selectAllChildren(el));return}
  const tg=e.target.closest("[data-toggle]");
  if(tg){const id=tg.dataset.toggle;expanded.has(id)?expanded.delete(id):expanded.add(id);renderChart(id);return}
  const ch=e.target.closest("[data-chart]");
  if(ch){chartFrom(ch.dataset.chart);return}
  const lo=e.target.closest("[data-locate]");
  if(lo){current=lo.dataset.locate;setView("tree");reveal(current);return}
  const b=e.target.closest("[data-id]");
  if(b&&!b.closest("#results"))show(b.dataset.id);
});

/* Search: name, job title or team; every word must match */
const q=$("q"),res=$("results"),combo=$("combo");let hits=[],sel=0;
function hl(text,terms){let out=esc(text);terms.forEach(t=>{out=out.replace(new RegExp("("+esc(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>")});return out}
function search(){
  const terms=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length){res.hidden=true;combo.setAttribute("aria-expanded","false");return}
  hits=P.filter(p=>{const h=(p.name+" "+(p.title||"")+" "+(p.dept||"")).toLowerCase();return terms.every(t=>h.includes(t))})
    .sort((a,b)=>(+!a.name.toLowerCase().includes(terms[0]))-(+!b.name.toLowerCase().includes(terms[0]))||a.name.localeCompare(b.name))
    .slice(0,15);
  sel=0;
  res.innerHTML=hits.length?hits.map((p,i)=>`<li role="option" data-id="${esc(p.id)}" aria-selected="${i===0}">
     <span class="av">${initials(p.name)}</span><span class="meta"><div class="n">${hl(p.name,terms)}</div>
     <div class="r">${hl(p.title||"",terms)}${p.dept?" · "+hl(p.dept,terms):""}</div></span></li>`).join("")
    :`<li class="empty">No one matches “${esc(q.value.trim())}”. Try a surname, a job title like “surveyor”, or a team.</li>`;
  res.hidden=false;combo.setAttribute("aria-expanded","true");
}
function pick(id){
  q.value="";res.hidden=true;combo.setAttribute("aria-expanded","false");q.blur();
  current=id;view==="tree"?reveal(id):show(id);
}
function markSel(){[...res.querySelectorAll("li[data-id]")].forEach((li,i)=>{li.setAttribute("aria-selected",i===sel);if(i===sel)li.scrollIntoView({block:"nearest"})})}
q.addEventListener("input",search);
q.addEventListener("keydown",e=>{
  if(res.hidden||!hits.length){if(e.key==="Escape"){q.value="";search()}return}
  if(e.key==="ArrowDown"){sel=(sel+1)%hits.length;markSel();e.preventDefault()}
  else if(e.key==="ArrowUp"){sel=(sel-1+hits.length)%hits.length;markSel();e.preventDefault()}
  else if(e.key==="Enter"){pick(hits[sel].id);e.preventDefault()}
  else if(e.key==="Escape"){q.value="";search()}
});
res.addEventListener("mousedown",e=>{const li=e.target.closest("li[data-id]");if(li){e.preventDefault();pick(li.dataset.id)}});
q.addEventListener("blur",()=>setTimeout(()=>{res.hidden=true;combo.setAttribute("aria-expanded","false")},100));
q.addEventListener("focus",search);
document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement!==q&&!/input|textarea/i.test(document.activeElement?.tagName)){e.preventDefault();q.focus()}});

load();
</script>

</body>
</html>
