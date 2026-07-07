// High-quality SVG assets and metadata for jewelry items
export const JEWELRY_ITEMS = [
  // --- NECKLACES ---
  {
    id: "royal_gold_collar",
    name: "Royal Gold & Diamond Collar",
    category: "necklaces",
    price: "₹3,80,000",
    material: "18K Gold, 3.5ct VVS1 Diamonds",
    description: "A majestic gold collar adorned with brilliant-cut diamonds, centered with a stunning pear-shaped diamond pendant.",
    weight: 45,
    scaleDefault: 1.15,
    offsetXDefault: 0,
    offsetYDefault: 0.15,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b38728" />
          <stop offset="25%" stop-color="#fbf5b7" />
          <stop offset="50%" stop-color="#bf953f" />
          <stop offset="75%" stop-color="#fcf6ba" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
        <radialGradient id="diamond-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="30%" stop-color="#e3f2fd" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#e3f2fd" stop-opacity="0" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Main Collar Arc -->
      <path d="M 80 130 C 100 240, 300 240, 320 130" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round" />
      <path d="M 85 130 C 102 230, 298 230, 315 130" fill="none" stroke="#6d4c00" stroke-width="1.5" />
      
      <!-- Collar Diamonds -->
      <circle cx="105" cy="155" r="4" fill="#ffffff" filter="url(#glow)" />
      <circle cx="125" cy="180" r="4.5" fill="#ffffff" filter="url(#glow)" />
      <circle cx="150" cy="200" r="5" fill="#ffffff" filter="url(#glow)" />
      <circle cx="175" cy="212" r="5.5" fill="#ffffff" filter="url(#glow)" />
      <circle cx="200" cy="216" r="6" fill="#ffffff" filter="url(#glow)" />
      <circle cx="225" cy="212" r="5.5" fill="#ffffff" filter="url(#glow)" />
      <circle cx="250" cy="200" r="5" fill="#ffffff" filter="url(#glow)" />
      <circle cx="275" cy="180" r="4.5" fill="#ffffff" filter="url(#glow)" />
      <circle cx="295" cy="155" r="4" fill="#ffffff" filter="url(#glow)" />

      <!-- Pendant Connector -->
      <rect x="194" y="218" width="12" height="14" rx="2" fill="url(#gold)" />
      
      <!-- Main Drop Pendant -->
      <path d="M 200 230 C 175 270, 200 320, 200 320 C 200 320, 225 270, 200 230 Z" fill="url(#gold)" filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.3))" />
      <path d="M 200 237 C 182 270, 200 310, 200 310 C 200 310, 218 270, 200 237 Z" fill="#e3f2fd" />
      
      <!-- Diamond Facets (Pendant) -->
      <polygon points="200,237 205,270 200,310 195,270" fill="#ffffff" opacity="0.7" />
      <polygon points="200,237 212,260 205,270" fill="#ffffff" opacity="0.9" />
      <polygon points="200,237 188,260 195,270" fill="#b3e5fc" opacity="0.5" />
      <polygon points="205,270 212,260 216,285 200,310" fill="#e3f2fd" opacity="0.6" />
      <polygon points="195,270 188,260 184,285 200,310" fill="#90caf9" opacity="0.4" />
      
      <!-- Small Gem on Connector -->
      <circle cx="200" cy="225" r="3" fill="#ffffff" />
    </svg>`
  },
  {
    id: "emerald_choker",
    name: "Emerald Solitaire Choker",
    category: "necklaces",
    price: "₹2,40,000",
    material: "Sterling Silver, 1.8ct Colombian Emerald",
    description: "A minimalist sterling silver chain featuring a brilliant cushion-cut Colombian emerald in a golden claw setting.",
    weight: 14,
    scaleDefault: 1.05,
    offsetXDefault: 0,
    offsetYDefault: 0.1,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d0d0d0" />
          <stop offset="30%" stop-color="#ffffff" />
          <stop offset="70%" stop-color="#eeeeee" />
          <stop offset="100%" stop-color="#9e9e9e" />
        </linearGradient>
        <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#bf953f" />
          <stop offset="50%" stop-color="#fcf6ba" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
        <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2ecc71" />
          <stop offset="50%" stop-color="#27ae60" />
          <stop offset="100%" stop-color="#145a32" />
        </linearGradient>
      </defs>
      <!-- Silver Chain Arc -->
      <path d="M 90 140 C 120 230, 280 230, 310 140" fill="none" stroke="url(#silver)" stroke-width="4.5" stroke-linecap="round" />
      
      <!-- Pendant Ring -->
      <circle cx="200" cy="205" r="9" fill="none" stroke="url(#silver)" stroke-width="3" />
      
      <!-- Emerald Bezel Setting -->
      <rect x="184" y="210" width="32" height="32" rx="6" fill="url(#gold-accent)" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" />
      
      <!-- Emerald Gem -->
      <rect x="188" y="214" width="24" height="24" rx="4" fill="url(#emerald)" />
      
      <!-- Emerald Facets -->
      <polygon points="188,214 200,226 212,214" fill="#58d68d" opacity="0.6" />
      <polygon points="212,214 200,226 212,238" fill="#1e8449" opacity="0.5" />
      <polygon points="212,238 200,226 188,238" fill="#196f3d" opacity="0.8" />
      <polygon points="188,238 200,226 188,214" fill="#2ecc71" opacity="0.7" />
      
      <!-- Table Facet (Center) -->
      <rect x="194" y="220" width="12" height="12" rx="2" fill="#27ae60" opacity="0.9" />
      <rect x="196" y="222" width="4" height="4" fill="#abebc6" opacity="0.7" />
      
      <!-- Gold Claws -->
      <circle cx="186" cy="212" r="2.5" fill="#fcf6ba" />
      <circle cx="214" cy="212" r="2.5" fill="#fcf6ba" />
      <circle cx="186" cy="240" r="2.5" fill="#fcf6ba" />
      <circle cx="214" cy="240" r="2.5" fill="#fcf6ba" />
    </svg>`
  },
  {
    id: "pearl_strand",
    name: "Classic Pearl Strand",
    category: "necklaces",
    price: "₹2,65,000",
    material: "10mm Akoya Sea Pearls",
    description: "A continuous strand of perfectly matched, high-luster Akoya sea pearls with a warm ivory undertone.",
    weight: 28,
    scaleDefault: 1.15,
    offsetXDefault: 0,
    offsetYDefault: 0.12,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <radialGradient id="pearl" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#fff8f0" />
          <stop offset="85%" stop-color="#f3e5d8" />
          <stop offset="100%" stop-color="#dfcfbe" />
        </radialGradient>
      </defs>
      <!-- Individual Pearls Along Path -->
      <!-- Left side -->
      <circle cx="80" cy="130" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="90" cy="148" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="102" cy="166" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="116" cy="183" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="132" cy="198" r="10.5" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="150" cy="211" r="10.5" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="170" cy="221" r="11" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="191" cy="226" r="11" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      
      <!-- Center Pearl -->
      <circle cx="212" cy="227" r="11.5" fill="url(#pearl)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
      
      <!-- Right side -->
      <circle cx="233" cy="225" r="11" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="253" cy="219" r="11" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="272" cy="209" r="10.5" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="289" cy="195" r="10.5" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="303" cy="179" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="314" cy="161" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="322" cy="143" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <circle cx="327" cy="125" r="10" fill="url(#pearl)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
    </svg>`
  },

  // --- EARRINGS ---
  {
    id: "diamond_drop_earrings",
    name: "Diamond Drop Earrings",
    category: "earrings",
    price: "₹3,15,000",
    material: "Platinum, 2.0ct Emerald-Cut Diamonds",
    description: "Elegant drop earrings featuring a linear cascade of graduated round-cut diamonds, ending in a matching pair of emerald-cut diamonds.",
    weight: 8,
    scaleDefault: 0.25,
    offsetXDefault: 0,
    offsetYDefault: 0.15,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width="200" height="400">
      <defs>
        <linearGradient id="plat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#eaeaea" />
          <stop offset="50%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#a0a0a0" />
        </linearGradient>
        <filter id="gem-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Ear Hook -->
      <path d="M 100 20 C 100 10, 85 10, 85 22 C 85 28, 92 34, 100 40" fill="none" stroke="url(#plat)" stroke-width="2.5" />
      
      <!-- Hanging Post -->
      <line x1="100" y1="40" x2="100" y2="150" stroke="url(#plat)" stroke-width="2.5" />
      
      <!-- Linear Diamonds -->
      <circle cx="100" cy="55" r="4.5" fill="#ffffff" filter="url(#gem-glow)" stroke="#eaeaea" stroke-width="0.5" />
      <circle cx="100" cy="80" r="5.5" fill="#ffffff" filter="url(#gem-glow)" stroke="#eaeaea" stroke-width="0.5" />
      <circle cx="100" cy="110" r="6.5" fill="#ffffff" filter="url(#gem-glow)" stroke="#eaeaea" stroke-width="0.5" />
      
      <!-- Diamond Connectors -->
      <rect x="98" y="148" width="4" height="20" fill="url(#plat)" />
      
      <!-- Large Emerald-Cut Bezel -->
      <rect x="84" y="165" width="32" height="42" rx="4" fill="url(#plat)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
      
      <!-- Large Diamond -->
      <rect x="88" y="169" width="24" height="34" rx="2" fill="#e3f2fd" />
      
      <!-- Facets -->
      <polygon points="88,169 100,186 112,169" fill="#ffffff" opacity="0.8" />
      <polygon points="112,169 100,186 112,203" fill="#ffffff" opacity="0.6" />
      <polygon points="112,203 100,186 88,203" fill="#b3e5fc" opacity="0.7" />
      <polygon points="88,203 100,186 88,169" fill="#90caf9" opacity="0.5" />
      <rect x="94" y="177" width="12" height="18" fill="#ffffff" opacity="0.8" />
    </svg>`
  },
  {
    id: "gold_hoops",
    name: "Classic Gold Hoops",
    category: "earrings",
    price: "₹95,000",
    material: "14K Yellow Gold",
    description: "Timeless 14K yellow gold hoop earrings featuring a high-polish finish, perfect for daily elegant wear.",
    weight: 6,
    scaleDefault: 0.35,
    offsetXDefault: 0,
    offsetYDefault: 0.18,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
      <defs>
        <linearGradient id="gold-hoop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b38728" />
          <stop offset="20%" stop-color="#fcf6ba" />
          <stop offset="40%" stop-color="#bf953f" />
          <stop offset="60%" stop-color="#fbf5b7" />
          <stop offset="80%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
      </defs>
      <!-- Ear Stud Post -->
      <circle cx="100" cy="40" r="3" fill="#b38728" />
      
      <!-- Hoop Circle with space at top -->
      <path d="M 97 40 A 55 55 0 1 1 82 48" fill="none" stroke="url(#gold-hoop)" stroke-width="10" stroke-linecap="round" filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.25))" />
      
      <!-- Inner detail line for gold shine -->
      <path d="M 98 42 A 53 53 0 1 1 83 49" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.4" />
    </svg>`
  },
  {
    id: "ruby_studs",
    name: "Oval Ruby & Diamond Studs",
    category: "earrings",
    price: "₹1,60,000",
    material: "18K Gold, 1.2ct Burma Rubies",
    description: "Classic studs showcasing rich red Burma rubies surrounded by a delicate halo of micro-pave diamonds.",
    weight: 4,
    scaleDefault: 0.18,
    offsetXDefault: 0,
    offsetYDefault: 0.05,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="gold-stud" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#bf953f" />
          <stop offset="50%" stop-color="#fcf6ba" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
        <radialGradient id="ruby" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ff3d00" />
          <stop offset="40%" stop-color="#d50000" />
          <stop offset="85%" stop-color="#800000" />
          <stop offset="100%" stop-color="#4a0000" />
        </radialGradient>
      </defs>
      
      <!-- Gold Outer Halo Border -->
      <ellipse cx="100" cy="100" rx="42" ry="50" fill="url(#gold-stud)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
      
      <!-- Diamond Halo Dots -->
      <circle cx="100" cy="56" r="3" fill="#ffffff" />
      <circle cx="116" cy="62" r="3" fill="#ffffff" />
      <circle cx="129" cy="76" r="3" fill="#ffffff" />
      <circle cx="137" cy="94" r="3" fill="#ffffff" />
      <circle cx="137" cy="112" r="3" fill="#ffffff" />
      <circle cx="129" cy="128" r="3" fill="#ffffff" />
      <circle cx="116" cy="140" r="3" fill="#ffffff" />
      <circle cx="100" cy="144" r="3" fill="#ffffff" />
      <circle cx="84" cy="140" r="3" fill="#ffffff" />
      <circle cx="71" cy="128" r="3" fill="#ffffff" />
      <circle cx="63" cy="112" r="3" fill="#ffffff" />
      <circle cx="63" cy="94" r="3" fill="#ffffff" />
      <circle cx="71" cy="76" r="3" fill="#ffffff" />
      <circle cx="84" cy="62" r="3" fill="#ffffff" />

      <!-- Gold Inner Bezel -->
      <ellipse cx="100" cy="100" rx="30" ry="38" fill="url(#gold-stud)" />
      
      <!-- Ruby Gemstone -->
      <ellipse cx="100" cy="100" rx="26" ry="34" fill="url(#ruby)" />
      
      <!-- Ruby Facets -->
      <polygon points="100,66 112,85 100,100 88,85" fill="#ff1744" opacity="0.6" />
      <polygon points="112,85 126,100 112,115 100,100" fill="#c62828" opacity="0.5" />
      <polygon points="100,100 112,115 100,134 88,115" fill="#b71c1c" opacity="0.8" />
      <polygon points="88,85 100,100 88,115 74,100" fill="#d50000" opacity="0.7" />
      
      <!-- Table Facet (Center) -->
      <ellipse cx="100" cy="100" rx="14" ry="18" fill="#d50000" opacity="0.9" />
      <ellipse cx="96" cy="96" rx="5" ry="7" fill="#ff8a80" opacity="0.6" />
    </svg>`
  },

  // --- RINGS ---
  {
    id: "princess_diamond_ring",
    name: "Princess-Cut Diamond Solitaire",
    category: "rings",
    price: "₹5,50,000",
    material: "Platinum, 1.5ct F-VS1 Diamond",
    description: "An exquisite princess-cut diamond raised in a clean platinum four-prong setting on a sleek reflective band.",
    weight: 5,
    scaleDefault: 0.65,
    offsetXDefault: 0,
    offsetYDefault: -0.15,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="silver-band" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9e9e9e" />
          <stop offset="30%" stop-color="#ffffff" />
          <stop offset="70%" stop-color="#e0e0e0" />
          <stop offset="100%" stop-color="#9e9e9e" />
        </linearGradient>
        <linearGradient id="ring-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#e3f2fd" />
          <stop offset="70%" stop-color="#90caf9" />
          <stop offset="100%" stop-color="#e3f2fd" />
        </linearGradient>
      </defs>
      
      <!-- Silver Band (Wrapping style, fitted horizontally on finger) -->
      <rect x="40" y="110" width="120" height="20" rx="5" fill="url(#silver-band)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
      <rect x="40" y="110" width="120" height="5" fill="#ffffff" opacity="0.4" />
      
      <!-- Ring Claws/Setting -->
      <path d="M 85 85 L 94 112 L 106 112 L 115 85 Z" fill="url(#silver-band)" />
      
      <!-- Princess-Cut Diamond -->
      <rect x="74" y="55" width="52" height="52" rx="2" transform="rotate(45, 100, 81)" fill="url(#ring-diamond)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />
      
      <!-- Diamond Facet Lines -->
      <polygon points="100,44 100,81 126,81" fill="#ffffff" opacity="0.8" transform="rotate(45, 100, 81)" />
      <polygon points="100,118 100,81 74,81" fill="#90caf9" opacity="0.6" transform="rotate(45, 100, 81)" />
      <polygon points="74,81 100,81 100,44" fill="#bbdefb" opacity="0.7" transform="rotate(45, 100, 81)" />
      <polygon points="126,81 100,81 100,118" fill="#e3f2fd" opacity="0.9" transform="rotate(45, 100, 81)" />
      
      <!-- Sparkling Table Center -->
      <rect x="88" y="69" width="24" height="24" rx="1" transform="rotate(45, 100, 81)" fill="#ffffff" opacity="0.8" />
      <circle cx="100" cy="81" r="3" fill="#ffffff" />
    </svg>`
  },
  {
    id: "gold_emerald_band",
    name: "Golden Emerald Eternity Band",
    category: "rings",
    price: "₹2,00,000",
    material: "18K Gold, 0.8ct Round Emeralds",
    description: "An elegant eternity-style band layered in 18K yellow gold, set with five brilliant circular emeralds across the top face.",
    weight: 7,
    scaleDefault: 0.6,
    offsetXDefault: 0,
    offsetYDefault: -0.1,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="gold-band" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#bf953f" />
          <stop offset="30%" stop-color="#fcf6ba" />
          <stop offset="75%" stop-color="#b38728" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
        <linearGradient id="ring-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#58d68d" />
          <stop offset="100%" stop-color="#145a32" />
        </linearGradient>
      </defs>
      
      <!-- Gold Band -->
      <rect x="40" y="110" width="120" height="24" rx="6" fill="url(#gold-band)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
      <rect x="42" y="112" width="116" height="4" fill="#fcf6ba" opacity="0.6" />
      
      <!-- Five Embedded Gems -->
      <circle cx="56" cy="122" r="7" fill="url(#ring-emerald)" stroke="#bf953f" stroke-width="1.5" />
      <circle cx="78" cy="122" r="8" fill="url(#ring-emerald)" stroke="#bf953f" stroke-width="1.5" />
      <circle cx="100" cy="122" r="9" fill="url(#ring-emerald)" stroke="#bf953f" stroke-width="1.5" />
      <circle cx="122" cy="122" r="8" fill="url(#ring-emerald)" stroke="#bf953f" stroke-width="1.5" />
      <circle cx="144" cy="122" r="7" fill="url(#ring-emerald)" stroke="#bf953f" stroke-width="1.5" />
      
      <!-- Table Facets -->
      <circle cx="56" cy="122" r="3" fill="#58d68d" opacity="0.8" />
      <circle cx="78" cy="122" r="3.5" fill="#58d68d" opacity="0.8" />
      <circle cx="100" cy="122" r="4.2" fill="#58d68d" opacity="0.8" />
      <circle cx="122" cy="122" r="3.5" fill="#58d68d" opacity="0.8" />
      <circle cx="144" cy="122" r="3" fill="#58d68d" opacity="0.8" />

      <!-- Sparkle highlights -->
      <circle cx="98" cy="120" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="76" cy="120" r="1.2" fill="#ffffff" opacity="0.8" />
      <circle cx="120" cy="120" r="1.2" fill="#ffffff" opacity="0.8" />
    </svg>`
  },
  {
    id: "sapphire_marquise_ring",
    name: "Sapphire Marquise Halo Ring",
    category: "rings",
    price: "₹3,00,000",
    material: "18K Gold, 1.1ct Blue Sapphire",
    description: "An eye-shaped marquise-cut deep blue sapphire, set vertically on a thin gold shank and surrounded by micro-diamonds.",
    weight: 6,
    scaleDefault: 0.6,
    offsetXDefault: 0,
    offsetYDefault: -0.1,
    rotationDefault: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="gold-band-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#bf953f" />
          <stop offset="50%" stop-color="#fcf6ba" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
        <radialGradient id="sapphire" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#448aff" />
          <stop offset="50%" stop-color="#2962ff" />
          <stop offset="100%" stop-color="#0d47a1" />
        </radialGradient>
      </defs>
      
      <!-- Gold Band -->
      <rect x="50" y="112" width="100" height="12" rx="3" fill="url(#gold-band-2)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
      
      <!-- Halo Base Marquise (Gold) -->
      <path d="M 75 118 Q 100 60 125 118 Q 100 176 75 118 Z" fill="url(#gold-band-2)" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.3))" />
      
      <!-- Tiny Diamond Halo dots along outline -->
      <circle cx="100" cy="74" r="2.2" fill="#ffffff" />
      <circle cx="108" cy="85" r="2.2" fill="#ffffff" />
      <circle cx="115" cy="100" r="2.2" fill="#ffffff" />
      <circle cx="119" cy="118" r="2.2" fill="#ffffff" />
      <circle cx="115" cy="136" r="2.2" fill="#ffffff" />
      <circle cx="108" cy="151" r="2.2" fill="#ffffff" />
      <circle cx="100" cy="162" r="2.2" fill="#ffffff" />
      <circle cx="92" cy="151" r="2.2" fill="#ffffff" />
      <circle cx="85" cy="136" r="2.2" fill="#ffffff" />
      <circle cx="81" cy="118" r="2.2" fill="#ffffff" />
      <circle cx="85" cy="100" r="2.2" fill="#ffffff" />
      <circle cx="92" cy="85" r="2.2" fill="#ffffff" />
      
      <!-- Sapphire Setting Bezel -->
      <path d="M 81 118 Q 100 72 119 118 Q 100 164 81 118 Z" fill="url(#gold-band-2)" />
      
      <!-- Sapphire Gem (Marquise) -->
      <path d="M 84 118 Q 100 78 116 118 Q 100 158 84 118 Z" fill="url(#sapphire)" />
      
      <!-- Facet overlay -->
      <polygon points="100,82 108,118 100,118" fill="#448aff" opacity="0.6" />
      <polygon points="100,154 108,118 100,118" fill="#0d47a1" opacity="0.6" />
      <polygon points="100,82 92,118 100,118" fill="#2979ff" opacity="0.5" />
      <polygon points="100,154 92,118 100,118" fill="#1565c0" opacity="0.7" />
    </svg>`
  }
];
