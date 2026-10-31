// Indy Area 3 sector data.
//
// Coordinates are pixels on the 833 x 843 source map.
//   x / y  top-left corner of the sector's label block
//   fl     "240-340" = FL240-FL340, "350+" = FL350 and above, "230-" = FL230 and below
//   name   null when the source map shows no name line (HNN SH)

window.SECTORS = [
  { id: "MOR HI",     name: "MOORFIELD",   num: "W03", fl: "250-340", freq: "133.27", x: 694, y: 154 },
  { id: "PKB LO",     name: "PARKERSBURG", num: "24",  fl: "230-",    freq: "125.55", x: 502, y: 188 },
  { id: "UNV HI",     name: "UNIVERSITY",  num: "77",  fl: "240-340", freq: "125.07", x: 378, y: 190 },
  { id: "YGR SH",     name: "YAEGER",      num: "74",  fl: "350+",    freq: "135.42", x: 260, y: 206 },
  { id: "BRY SH",     name: "BRYCE",       num: "W42", fl: "350+",    freq: "118.02", x: 758, y: 210 },
  { id: "PIK LO",     name: "PIKE",        num: "69",  fl: "230-",    freq: "135.57", x: 208, y: 220 },
  { id: "EKN LO",     name: "ELKINS",      num: "W01", fl: "240-",    freq: "128.6",  x: 692, y: 232 },
  { id: "HNN SH",     name: null,          num: "95",  fl: "360+",    freq: "120.27", x: 536, y: 288 },
  { id: "BOB IM",     name: "BOBCAT",      num: "79",  fl: "320-350", freq: "135.12", x: 280, y: 332 },
  { id: "FLM HI",     name: "FALMOUTH",    num: "83",  fl: "240-320", freq: "128.22", x: 178, y: 360 },
  { id: "MAR HI",     name: "MARLINGTON",  num: "W37", fl: "240+",    freq: "133.02", x: 696, y: 366 },
  { id: "RIV LO",     name: "RIVER",       num: "26",  fl: "230-",    freq: "124.22", x: 352, y: 390 },
  { id: "OOM SH",     name: "HOOSIER",     num: "70",  fl: "370+",    freq: "120.87", x: 94,  y: 406 },
  { id: "CRW HI",     name: "CHARLESTON",  num: "85",  fl: "240-310", freq: "119.52", x: 296, y: 434 },
  { id: "DAC IM",     name: "DACOS",       num: "93",  fl: "330-360", freq: "123.77", x: 202, y: 464 },
  { id: "HSP LO",     name: "HOTSPRINGS",  num: "W29", fl: "230-",    freq: "134.4",  x: 754, y: 468 },
  { id: "TECH HI",    name: "TECH",        num: "W52", fl: "240-330", freq: "133.57", x: 672, y: 480 },
  { id: "BLF SH",     name: "BLUEFIELD",   num: "96",  fl: "340+",    freq: "134.22", x: 490, y: 488 },
  { id: "AZQ LO",     name: "HAZARD",      num: "25",  fl: "230-",    freq: "126.57", x: 408, y: 498 },
  { id: "SHD SH",     name: "SHENANDOAH",  num: "W72", fl: "340+",    freq: "127.92", x: 722, y: 526 },
  { id: "BKW HI",     name: "BECKLEY",     num: "86",  fl: "240-330", freq: "124.57", x: 366, y: 584 },
  { id: "RBL HI",     name: "REBEL",       num: "84",  fl: "240-340", freq: "134.67", x: 148, y: 600 },
  { id: "PSK HI",     name: "PULASKI",     num: "T43", fl: "240-340", freq: "132.97", x: 566, y: 626 },
  { id: "BRISTOL LO", name: "BRISTOL",     num: "T45", fl: "230-",    freq: "127.85", x: 476, y: 656 },
  { id: "LOZ LO",     name: "LONDON",      num: "21",  fl: "230-",    freq: "126.57", x: 188, y: 664 },
  { id: "SME SH",     name: "SOMERSET",    num: "94",  fl: "350+",    freq: "126.92", x: 110, y: 678 },
  { id: "SALEM HI",   name: "SALEM",       num: "T42", fl: "240-340", freq: "120.72", x: 378, y: 704 },
  { id: "BADEN SH",   name: "BADEN",       num: "T15", fl: "350+",    freq: "126.77", x: 522, y: 744 },
  { id: "BRN HI",     name: "BURNE",       num: "T39", fl: "240-330", freq: "125.92", x: 208, y: 754 },
  { id: "HCH LO",     name: "HINCH",       num: "T41", fl: "230-",    freq: "133.6",  x: 172, y: 786 },
  { id: "BUU SH",     name: "BLUERIDGE",   num: "T40", fl: "350+",    freq: "134.07", x: 116, y: 792 },
];

// Sector boundary polylines, same coordinate space.
window.BOUNDARIES = {
  // Blue: HI / IM / SH
  high: [
    [[121, 134], [463, 7], [469, 42], [672, 149], [689, 148], [781, 127], [833, 77]],
    [[121, 134], [130, 249]],
    [[130, 249], [247, 288], [310, 286], [680, 210]],
    [[130, 249], [0, 365]],
    [[689, 148], [680, 210], [669, 253], [665, 328], [662, 403], [660, 475], [656, 527], [673, 559]],
    [[665, 328], [833, 305]],
    [[660, 475], [833, 436]],
    [[247, 288], [255, 325], [263, 379], [267, 395], [277, 446], [287, 512]],
    [[287, 512], [601, 396], [662, 403]],
    [[287, 512], [225, 595]],
    [[0, 574], [58, 619], [187, 550], [244, 617], [238, 741]],
    [[0, 838], [238, 741], [285, 722], [443, 658], [673, 559], [696, 548]],
    [[696, 548], [833, 752]],
    [[285, 722], [282, 843]],
    [[443, 658], [467, 726], [551, 843]],
  ],
  // Red: LO
  low: [
    [[299, 68], [351, 267], [360, 301]],
    [[69, 303], [133, 347], [360, 301]],
    [[360, 301], [448, 334], [447, 363], [449, 379], [459, 391]],
    [[459, 391], [259, 658]],
    [[459, 391], [513, 376], [601, 396]],
    [[31, 337], [26, 359], [62, 442], [90, 507], [145, 547], [313, 711]],
    [[0, 566], [13, 574], [62, 532], [145, 547]],
  ],
};
