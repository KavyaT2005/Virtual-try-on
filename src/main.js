import './style.css';
import { JEWELRY_ITEMS } from './assets/jewelry.js';

// --- Global Application State ---
let activeCategory = 'necklaces';
let activeItemId = null;
let activeItem = null;
let activeTryOn = {
  necklaces: null,
  earrings: null,
  rings: null
};

// Try-On Target Mode ('webcam' | 'photo')
let tryOnMode = 'webcam';
let friendPhotoImg = null; // HTMLImageElement loaded with friend's photo
let isFeedMirrored = true;  // Mirrors coordinates for webcam, keeps unmirrored for uploaded photos

// Search, Filtering & Sorting State
let searchQuery = '';
let filterPrice = 'all';
let filterWeight = 'all';
let filterOrigin = 'all';
let sortBy = 'featured';

// Camera and Canvas
let videoElement = null;
let canvasElement = null;
let ctx = null;
let cameraStream = null;

// MediaPipe Vision Tasks
let faceLandmarker = null;
let handLandmarker = null;
let filesetResolver = null;
const modelLoadingState = {
  face: 'idle', // 'idle' | 'loading' | 'loaded' | 'error'
  hand: 'idle'
};

// Canvas animation and tracking
let animationFrameId = null;
let isModelTracking = false;
let lastVideoTime = -1;

// Fine-Tuning Calibration Values (stored per item)
const itemCalibrations = {}; 

// Preloaded Image Cache (both default SVGs and custom raster files)
const imageCache = {};

// Custom Uploaded Items (stored in localStorage)
let customJewelryList = JSON.parse(localStorage.getItem('aura_custom_jewelry') || '[]');

// Saved Showroom Snapshots (stored in localStorage)
let showroomSnapshots = JSON.parse(localStorage.getItem('aura_snapshots') || '[]');

// Upload state management
let originalUploadImage = null; // Store original uploaded Image object before background removal
let uploadedFileBase64 = null;  // Store processed transparent Image base64 string

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initElements();
  preloadJewelryImages();
  
  // Set default initial active set item
  activeTryOn.necklaces = JEWELRY_ITEMS[0];
  activeItem = JEWELRY_ITEMS[0];
  activeItemId = JEWELRY_ITEMS[0].id;
  updateActiveTryOnSetDOM();
  
  // Skip welcome splash if already unlocked in this browser session
  if (sessionStorage.getItem('kavya_showroom_unlocked') === 'true') {
    const welcome = document.getElementById('welcome-splash');
    if (welcome) welcome.classList.add('fade-out');
  }
  
  renderCatalog();
  setupEventListeners();
  setupSearchAndFilters();
  setupUploadForm();
  setupUrlTryOnForm();
  setupTryOnModeControllers();
  loadSavedSnapshots();
  
  // Update details & sliders
  updateProductDetails();
  updateSlidersUI();
  
  // Start the engine
  startEngine();
});


// Initialize DOM element references
function initElements() {
  videoElement = document.getElementById('webcam');
  canvasElement = document.getElementById('canvas');
  ctx = canvasElement.getContext('2d');
  
  // Resize canvas display buffer to match bounding client rect
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (canvasElement) {
    const rect = canvasElement.getBoundingClientRect();
    canvasElement.width = rect.width;
    canvasElement.height = rect.height;
  }
}

// Preload assets (default SVGs and custom uploaded images)
function preloadJewelryImages() {
  // Preload default pieces
  JEWELRY_ITEMS.forEach(item => {
    if (!imageCache[item.id]) {
      const img = new Image();
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(item.svg);
      imageCache[item.id] = img;
      
      itemCalibrations[item.id] = {
        scale: item.scaleDefault || 1.0,
        offsetX: item.offsetXDefault || 0,
        offsetY: item.offsetYDefault || 0,
        rotation: item.rotationDefault || 0,
        splitEarrings: item.category === 'earrings'
      };
    }
  });
  
  // Preload custom pieces
  customJewelryList.forEach(item => {
    if (!imageCache[item.id]) {
      const img = new Image();
      img.src = item.dataUrl;
      imageCache[item.id] = img;
      
      itemCalibrations[item.id] = {
        scale: item.scaleDefault || 1.0,
        offsetX: item.offsetXDefault || 0,
        offsetY: item.offsetYDefault || 0,
        rotation: item.rotationDefault || 0,
        splitEarrings: item.category === 'earrings'
      };
    }
  });
}

// Combine default and custom collections
function getAllItems() {
  return [...JEWELRY_ITEMS, ...customJewelryList];
}

// --- Dynamic Query Engine (Search, Filter, and Sort) ---
function getFilteredAndSortedItems() {
  let items = getAllItems().filter(item => item.category === activeCategory);
  
  // Helper to parse price string to numerical float (e.g. "₹3,80,000" -> 380000)
  const parsePrice = (priceStr) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };
  
  // 1. Search Query filter (matches name, material, price, weight, description)
  const query = searchQuery.toLowerCase().trim();
  if (query) {
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.material.toLowerCase().includes(query) ||
      item.price.toLowerCase().includes(query) ||
      (item.weight && `${item.weight}g`.toLowerCase().includes(query)) ||
      item.description.toLowerCase().includes(query)
    );
  }
  
  // 2. Filter by Price
  if (filterPrice !== 'all') {
    items = items.filter(item => {
      const p = parsePrice(item.price);
      if (filterPrice === 'under-150000') return p < 150000;
      if (filterPrice === '150000-350000') return p >= 150000 && p <= 350000;
      if (filterPrice === 'above-350000') return p > 350000;
      return true;
    });
  }
  
  // 3. Filter by Weight (Grams)
  if (filterWeight !== 'all') {
    items = items.filter(item => {
      const w = parseFloat(item.weight) || 0;
      if (w === 0) return false; // Filter out if weight is not cataloged
      if (filterWeight === 'light') return w < 10;
      if (filterWeight === 'medium') return w >= 10 && w <= 30;
      if (filterWeight === 'heavy') return w > 30;
      return true;
    });
  }
  
  // 4. Filter by Origin (Preloaded originals vs Custom uploader)
  if (filterOrigin !== 'all') {
    items = items.filter(item => {
      const isCustom = item.isCustom === true;
      if (filterOrigin === 'preloaded') return !isCustom;
      if (filterOrigin === 'custom') return isCustom;
      return true;
    });
  }
  
  // 5. Sorting Comparator
  items.sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parsePrice(a.price) - parsePrice(b.price);
    }
    if (sortBy === 'price-desc') {
      return parsePrice(b.price) - parsePrice(a.price);
    }
    if (sortBy === 'weight-asc') {
      return (parseFloat(a.weight) || 0) - (parseFloat(b.weight) || 0);
    }
    if (sortBy === 'weight-desc') {
      return (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0);
    }
    // Default or 'featured' -> retain original array cataloging sequence
    return 0;
  });
  
  return items;
}

// --- Dynamic Catalog Rendering ---
function renderCatalog() {
  const catalogGrid = document.getElementById('catalog-grid');
  catalogGrid.innerHTML = '';
  
  // Fetch filtered and sorted data
  const filteredItems = getFilteredAndSortedItems();
  
  if (filteredItems.length === 0) {
    catalogGrid.innerHTML = `
      <div class="gallery-empty-state" style="grid-column: 1 / span 2; padding: 40px 0; text-align: center;">
        No items match your search.
      </div>
    `;
    updateProductDetails();
    return;
  }
  
  filteredItems.forEach(item => {
    const isCurrentlyActive = (activeTryOn[item.category] && activeTryOn[item.category].id === item.id);
    const isCustom = item.isCustom === true;
    const card = document.createElement('div');
    card.className = `catalog-item-card ${isCurrentlyActive ? 'active' : ''}`;
    card.setAttribute('data-id', item.id);
    
    card.innerHTML = `
      ${isCustom ? `<span class="card-badge">Custom</span>` : ''}
      ${isCustom ? `<button class="card-delete-btn" title="Delete custom item" data-id="${item.id}">✕</button>` : ''}
      <div class="card-preview-area">
        ${isCustom ? `<img src="${item.dataUrl}" alt="${item.name}">` : item.svg}
      </div>
      <div class="card-name">${item.name}</div>
      <div class="card-meta-row">
        <span class="card-material-tag" title="${item.material}">${item.material}</span>
        ${item.weight ? `<span class="card-weight-tag">${item.weight}g</span>` : ''}
      </div>
      <div class="card-footer">
        <span class="card-price">${item.price}</span>
        <span class="card-tryon-status">${isCurrentlyActive ? 'Trying On' : 'Try On'}</span>
      </div>
    `;
    
    // Select item on card click
    card.addEventListener('click', (e) => {
      // If clicking delete button, ignore selection
      if (e.target.classList.contains('card-delete-btn')) return;
      selectItem(item.id);
    });
    
    // Bind delete listener if custom
    if (isCustom) {
      card.querySelector('.card-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCustomItem(item.id);
      });
    }
    
    catalogGrid.appendChild(card);
  });
  
  updateProductDetails();
}

// Select jewelry item for try-on
function selectItem(itemId) {
  const allItems = getAllItems();
  activeItem = allItems.find(item => item.id === itemId);
  
  if (!activeItem) {
    activeItemId = null;
    updateProductDetails();
    disableSliders();
    return;
  }
  
  activeItemId = itemId;
  
  // Set this item as the active one in its category for mix-and-match try-on
  activeTryOn[activeItem.category] = activeItem;
  
  // Apply active classes to cards
  document.querySelectorAll('.catalog-item-card').forEach(card => {
    const cardId = card.getAttribute('data-id');
    const cardItem = allItems.find(i => i.id === cardId);
    if (cardItem) {
      const isActive = (activeTryOn[cardItem.category] && activeTryOn[cardItem.category].id === cardId);
      if (isActive) {
        card.classList.add('active');
        card.querySelector('.card-tryon-status').textContent = 'Trying On';
      } else {
        card.classList.remove('active');
        const otherStatus = card.querySelector('.card-tryon-status');
        if (otherStatus) otherStatus.textContent = 'Try On';
      }
    }
  });
  
  updateProductDetails();
  updateSlidersUI();
  updateActiveTryOnSetDOM();
  
  // Ensure both active models (face and hand) are loaded if needed
  ensureActiveModelsLoaded();
}

function removeCategoryFromTryOn(category) {
  activeTryOn[category] = null;
  
  // If the currently calibrated item is in this category, clear activeItem
  if (activeItem && activeItem.category === category) {
    activeItem = null;
    activeItemId = null;
    updateProductDetails();
    disableSliders();
  }
  
  updateActiveTryOnSetDOM();
  renderCatalog();
}

function clearAllTryOnSet() {
  activeTryOn.necklaces = null;
  activeTryOn.earrings = null;
  activeTryOn.rings = null;
  
  activeItem = null;
  activeItemId = null;
  
  updateProductDetails();
  disableSliders();
  updateActiveTryOnSetDOM();
  renderCatalog();
}

function updateActiveTryOnSetDOM() {
  const categories = ['necklaces', 'earrings', 'rings'];
  let hasAnyActive = false;
  
  categories.forEach(cat => {
    const item = activeTryOn[cat];
    const slot = document.getElementById(`slot-${cat}`);
    if (!slot) return;
    
    const valEl = slot.querySelector('.slot-value');
    const removeBtn = slot.querySelector('.btn-remove-slot');
    
    if (item) {
      valEl.textContent = item.name;
      valEl.classList.remove('empty');
      removeBtn.classList.remove('hidden');
      hasAnyActive = true;
    } else {
      valEl.textContent = 'None Selected';
      valEl.classList.add('empty');
      removeBtn.classList.add('hidden');
    }
  });
  
  const btnClear = document.getElementById('btn-clear-set');
  if (btnClear) {
    btnClear.disabled = !hasAnyActive;
  }
}

async function ensureActiveModelsLoaded() {
  const hasFaceItem = activeTryOn.necklaces || activeTryOn.earrings;
  const hasHandItem = activeTryOn.rings;
  
  const promises = [];
  if (hasFaceItem) {
    promises.push(ensureModelLoaded('necklaces'));
  }
  if (hasHandItem) {
    promises.push(ensureModelLoaded('rings'));
  }
  
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}

// Update the product specifications drawer
function updateProductDetails() {
  const detailCard = document.getElementById('product-details-card');
  if (!activeItem) {
    detailCard.classList.add('hidden');
    return;
  }
  
  detailCard.classList.remove('hidden');
  document.getElementById('detail-name').textContent = activeItem.name;
  
  // Include grams inside detail card specifications if available
  const specText = activeItem.weight ? `${activeItem.material} (${activeItem.weight}g)` : activeItem.material;
  document.getElementById('detail-material').textContent = specText;
  document.getElementById('detail-price').textContent = activeItem.price;
  document.getElementById('detail-description').textContent = activeItem.description;
}

// --- Slider Adjustments Control ---
function updateSlidersUI() {
  if (!activeItemId) {
    disableSliders();
    return;
  }
  
  enableSliders();
  const calibration = itemCalibrations[activeItemId];
  
  const sliderScale = document.getElementById('slider-scale');
  const sliderOffsetX = document.getElementById('slider-offset-x');
  const sliderOffsetY = document.getElementById('slider-offset-y');
  const sliderRotation = document.getElementById('slider-rotation');
  
  sliderScale.value = calibration.scale;
  sliderOffsetX.value = calibration.offsetX;
  sliderOffsetY.value = calibration.offsetY;
  sliderRotation.value = calibration.rotation;
  
  document.getElementById('val-scale').textContent = `${calibration.scale.toFixed(2)}x`;
  document.getElementById('val-offset-x').textContent = `${calibration.offsetX}px`;
  document.getElementById('val-offset-y').textContent = `${calibration.offsetY}px`;
  document.getElementById('val-rotation').textContent = `${calibration.rotation}°`;
  
  // Show/hide earring-split controls
  const splitGroup = document.getElementById('earring-split-group');
  const chkSplit = document.getElementById('chk-earring-split');
  if (activeItem && activeItem.category === 'earrings') {
    splitGroup.classList.remove('hidden');
    chkSplit.checked = (calibration.splitEarrings !== undefined) ? calibration.splitEarrings : true;
  } else {
    splitGroup.classList.add('hidden');
  }
}

function enableSliders() {
  document.getElementById('slider-scale').disabled = false;
  document.getElementById('slider-offset-x').disabled = false;
  document.getElementById('slider-offset-y').disabled = false;
  document.getElementById('slider-rotation').disabled = false;
  document.getElementById('btn-reset').disabled = false;
}

function disableSliders() {
  document.getElementById('slider-scale').disabled = true;
  document.getElementById('slider-offset-x').disabled = true;
  document.getElementById('slider-offset-y').disabled = true;
  document.getElementById('slider-rotation').disabled = true;
  document.getElementById('btn-reset').disabled = true;
  document.getElementById('earring-split-group').classList.add('hidden');
}

// Reset custom adjustments to item defaults
function resetCalibration() {
  if (!activeItem) return;
  
  itemCalibrations[activeItem.id] = {
    scale: activeItem.scaleDefault || 1.0,
    offsetX: activeItem.offsetXDefault || 0,
    offsetY: activeItem.offsetYDefault || 0,
    rotation: activeItem.rotationDefault || 0,
    splitEarrings: activeItem.category === 'earrings'
  };
  
  updateSlidersUI();
}

// Delete custom uploaded item
function deleteCustomItem(itemId) {
  if (confirm("Are you sure you want to delete this custom piece from your catalog?")) {
    customJewelryList = customJewelryList.filter(item => item.id !== itemId);
    localStorage.setItem('aura_custom_jewelry', JSON.stringify(customJewelryList));
    
    // Clean up caches
    delete imageCache[itemId];
    delete itemCalibrations[itemId];
    
    // If the active item is the deleted one, select another matching catalog item
    if (activeItemId === itemId) {
      const remainingItems = getFilteredAndSortedItems();
      if (remainingItems.length > 0) {
        selectItem(remainingItems[0].id);
      } else {
        activeItem = null;
        activeItemId = null;
        updateProductDetails();
        disableSliders();
      }
    }
    
    renderCatalog();
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Splash Passcode Lock Screen Controllers
  const btnEnter = document.getElementById('btn-enter-showroom');
  const splashMain = document.getElementById('splash-main-content');
  const splashPasscode = document.getElementById('splash-passcode-content');
  const welcomeSplash = document.getElementById('welcome-splash');
  
  const CORRECT_PIN = '2005';
  let enteredPin = '';
  
  const dots = document.querySelectorAll('.passcode-dot');
  const errorMsg = document.getElementById('passcode-error-msg');
  const dotsRow = document.getElementById('passcode-dots-row');
  
  function updateDots() {
    dots.forEach((dot, index) => {
      if (index < enteredPin.length) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  
  function resetPasscodeUI() {
    enteredPin = '';
    updateDots();
    errorMsg.classList.add('hidden');
    dotsRow.classList.remove('shake');
  }
  
  if (btnEnter && splashMain && splashPasscode) {
    btnEnter.addEventListener('click', () => {
      splashMain.classList.add('hidden');
      splashPasscode.classList.remove('hidden');
      resetPasscodeUI();
    });
  }
  
  // Numeric keypad button events
  document.querySelectorAll('.keypad-btn[data-value]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (enteredPin.length < 4) {
        errorMsg.classList.add('hidden');
        enteredPin += btn.getAttribute('data-value');
        updateDots();
        
        if (enteredPin.length === 4) {
          if (enteredPin === CORRECT_PIN) {
            // Correct PIN -> unlock showroom and save session
            sessionStorage.setItem('kavya_showroom_unlocked', 'true');
            welcomeSplash.classList.add('fade-out');
          } else {
            // Incorrect PIN -> Shake indicators and alert
            dotsRow.classList.add('shake');
            errorMsg.classList.remove('hidden');
            
            setTimeout(() => {
              enteredPin = '';
              updateDots();
              dotsRow.classList.remove('shake');
            }, 600);
          }
        }
      }
    });
  });
  
  // Keypad Backspace (⌫) event
  const btnBackspace = document.getElementById('btn-keypad-backspace');
  if (btnBackspace) {
    btnBackspace.addEventListener('click', () => {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        updateDots();
        errorMsg.classList.add('hidden');
      }
    });
  }
  
  // Keypad Cancel (✕) event
  const btnCancelPin = document.getElementById('btn-keypad-cancel');
  if (btnCancelPin) {
    btnCancelPin.addEventListener('click', () => {
      splashPasscode.classList.add('hidden');
      splashMain.classList.remove('hidden');
      resetPasscodeUI();
    });
  }

  // Category tabs click
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeCategory = btn.getAttribute('data-category');
      
      // Auto-select the first item in the new category after query matches
      const firstItem = getFilteredAndSortedItems().find(item => item.category === activeCategory);
      if (firstItem) {
        selectItem(firstItem.id);
      } else {
        // Try fallback selector on all catalog items
        const rawFirstItem = getAllItems().find(item => item.category === activeCategory);
        if (rawFirstItem) {
          selectItem(rawFirstItem.id);
        } else {
          activeItem = null;
          activeItemId = null;
          updateProductDetails();
          disableSliders();
        }
      }
      
      renderCatalog();
    });
  });
  
  // Slider input events
  document.getElementById('slider-scale').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (activeItemId) {
      itemCalibrations[activeItemId].scale = val;
      document.getElementById('val-scale').textContent = `${val.toFixed(2)}x`;
    }
  });
  
  document.getElementById('slider-offset-x').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (activeItemId) {
      itemCalibrations[activeItemId].offsetX = val;
      document.getElementById('val-offset-x').textContent = `${val}px`;
    }
  });
  
  document.getElementById('slider-offset-y').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (activeItemId) {
      itemCalibrations[activeItemId].offsetY = val;
      document.getElementById('val-offset-y').textContent = `${val}px`;
    }
  });
  
  document.getElementById('slider-rotation').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (activeItemId) {
      itemCalibrations[activeItemId].rotation = val;
      document.getElementById('val-rotation').textContent = `${val}°`;
    }
  });
  
  // Earring split checkbox change
  document.getElementById('chk-earring-split').addEventListener('change', (e) => {
    if (activeItemId && itemCalibrations[activeItemId]) {
      itemCalibrations[activeItemId].splitEarrings = e.target.checked;
    }
  });

  // Reset adjustments button
  document.getElementById('btn-reset').addEventListener('click', resetCalibration);
  
  // Snapshot capture button
  document.getElementById('btn-snapshot').addEventListener('click', captureTryOn);
  
  // Add to cart purchase CTA
  document.getElementById('btn-add-to-cart').addEventListener('click', () => {
    if (activeItem) {
      alert(`Thank you for trying on the ${activeItem.name}! In a full store, this would add the item to your checkout cart.`);
    }
  });
  
  // Remove individual slot from try-on set
  document.querySelectorAll('.btn-remove-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const category = btn.getAttribute('data-category');
      removeCategoryFromTryOn(category);
    });
  });
  
  // Clear complete try-on set
  document.getElementById('btn-clear-set').addEventListener('click', () => {
    clearAllTryOnSet();
  });
}

// --- Catalog Search and Filters Lifecycle ---
function setupSearchAndFilters() {
  const searchInput = document.getElementById('catalog-search');
  const btnToggleFilters = document.getElementById('btn-toggle-filters');
  const filterDrawer = document.getElementById('filter-drawer');
  
  const selPrice = document.getElementById('filter-price');
  const selWeight = document.getElementById('filter-weight');
  const selOrigin = document.getElementById('filter-origin');
  const selSort = document.getElementById('sort-by');
  
  // Toggle Filters Drawer click
  btnToggleFilters.addEventListener('click', () => {
    filterDrawer.classList.toggle('hidden');
    btnToggleFilters.classList.toggle('active');
  });
  
  // Search text input change
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCatalog();
  });
  
  // Filter Dropdown changes
  selPrice.addEventListener('change', (e) => {
    filterPrice = e.target.value;
    renderCatalog();
  });
  
  selWeight.addEventListener('change', (e) => {
    filterWeight = e.target.value;
    renderCatalog();
  });
  
  selOrigin.addEventListener('change', (e) => {
    filterOrigin = e.target.value;
    renderCatalog();
  });
  
  selSort.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderCatalog();
  });
}

// --- Dynamic Client-Side Background Removal (Pixel Masking) ---
function processImageBackgroundRemoval(img, removeBg, keyType, tolerance) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.naturalWidth || img.width;
  tempCanvas.height = img.naturalHeight || img.height;
  
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(img, 0, 0);
  
  // If BG removal is unchecked, return original image unchanged
  if (!removeBg) {
    return tempCanvas.toDataURL('image/png');
  }
  
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  
  // 1. Detect Key Color (the color we want to turn transparent)
  let targetR = 255;
  let targetG = 255;
  let targetB = 255;
  
  if (keyType === 'auto') {
    // Read pixel color from top-left corner (0, 0)
    targetR = data[0];
    targetG = data[1];
    targetB = data[2];
    const targetA = data[3];
    
    // If corner is already transparent, assume background is clean
    if (targetA < 15) {
      return tempCanvas.toDataURL('image/png');
    }
  } else if (keyType === 'white') {
    targetR = 255;
    targetG = 255;
    targetB = 255;
  } else if (keyType === 'black') {
    targetR = 0;
    targetG = 0;
    targetB = 0;
  }
  
  // 2. Scan pixels and filter using Euclidean Distance Math
  const feather = 15; // Smooth interpolation window
  const tolSq = tolerance * tolerance;
  const lowerBoundTol = Math.max(0, tolerance - feather);
  const lowerBoundTolSq = lowerBoundTol * lowerBoundTol;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 15) continue; // Skip already transparent pixels
    
    // Euclidean distance squared in RGB space
    const distSq = (r - targetR) * (r - targetR) +
                   (g - targetG) * (g - targetG) +
                   (b - targetB) * (b - targetB);
    
    if (distSq < lowerBoundTolSq) {
      // Fully matching background -> make transparent
      data[i + 3] = 0;
    } else if (distSq < tolSq) {
      // Smooth feathering boundary interpolation
      const dist = Math.sqrt(distSq);
      const alphaFraction = (dist - lowerBoundTol) / feather;
      data[i + 3] = Math.round(a * alphaFraction);
    }
  }
  
  tempCtx.putImageData(imageData, 0, 0);
  return tempCanvas.toDataURL('image/png');
}

// --- Custom Jewelry Upload Modal and Drag-and-Drop Management ---
function setupUploadForm() {
  const modal = document.getElementById('upload-modal');
  const btnOpen = document.getElementById('btn-open-upload');
  const btnClose = document.getElementById('modal-close');
  const btnCancel = document.getElementById('btn-cancel-upload');
  const form = document.getElementById('upload-form');
  
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('upload-file');
  const previewContainer = document.getElementById('file-preview-container');
  const previewImg = document.getElementById('file-preview-img');
  const previewName = document.getElementById('file-preview-name');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  
  // Background Removal controls
  const bgSettingsContainer = document.getElementById('bg-removal-settings');
  const bgControlsContainer = document.getElementById('bg-removal-controls');
  const chkRemoveBg = document.getElementById('upload-remove-bg');
  const selColorType = document.getElementById('upload-bg-color-type');
  const sldTolerance = document.getElementById('upload-bg-tolerance');
  const valTolerance = document.getElementById('val-bg-tolerance');
  
  // Open modal
  btnOpen.addEventListener('click', () => {
    resetFormState();
    modal.classList.remove('hidden');
  });
  
  // Close modal functions
  const closeModal = () => {
    modal.classList.add('hidden');
    resetFormState();
  };
  
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Drag & Drop events
  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  ['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => {
      dropZone.classList.remove('dragover');
    });
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });
  
  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFileSelector();
  });
  
  // Background Removal Form controls listeners (trigger live previews)
  chkRemoveBg.addEventListener('change', () => {
    if (chkRemoveBg.checked) {
      bgControlsContainer.classList.remove('disabled');
    } else {
      bgControlsContainer.classList.add('disabled');
    }
    updateUploadPreview();
  });
  
  selColorType.addEventListener('change', updateUploadPreview);
  
  sldTolerance.addEventListener('input', (e) => {
    valTolerance.textContent = e.target.value;
    updateUploadPreview(); // Live sliding preview update
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!uploadedFileBase64) {
      alert("Please upload a jewelry image.");
      return;
    }
    
    const category = document.getElementById('upload-category').value;
    const name = document.getElementById('upload-name').value;
    const weightVal = parseFloat(document.getElementById('upload-weight').value) || null;
    const price = document.getElementById('upload-price').value || 'Custom';
    const material = document.getElementById('upload-material').value || 'Physical Piece';
    
    // Set default proportions
    let scaleDefault = 1.0;
    let offsetYDefault = 0;
    if (category === 'rings') {
      scaleDefault = 0.65;
      offsetYDefault = -0.12;
    } else if (category === 'earrings') {
      scaleDefault = 0.25;
      offsetYDefault = 0.1;
    } else if (category === 'necklaces') {
      scaleDefault = 1.1;
      offsetYDefault = 0.12;
    }
    
    const newItem = {
      id: `custom_${Date.now()}`,
      name: name,
      category: category,
      price: price,
      material: material,
      weight: weightVal,
      description: "A custom physical jewelry piece uploaded to the try-on showroom.",
      scaleDefault: scaleDefault,
      offsetXDefault: 0,
      offsetYDefault: offsetYDefault,
      rotationDefault: 0,
      isCustom: true,
      dataUrl: uploadedFileBase64 // Processed transparent image base64
    };
    
    customJewelryList.push(newItem);
    localStorage.setItem('aura_custom_jewelry', JSON.stringify(customJewelryList));
    
    // Load image into cache
    const img = new Image();
    img.src = newItem.dataUrl;
    imageCache[newItem.id] = img;
    
    itemCalibrations[newItem.id] = {
      scale: newItem.scaleDefault,
      offsetX: 0,
      offsetY: newItem.offsetYDefault,
      rotation: 0,
      splitEarrings: category === 'earrings'
    };
    
    closeModal();
    
    // Switch to target category
    if (activeCategory !== category) {
      activeCategory = category;
      document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
    
    // Reset queries when uploading to let user find it instantly
    const searchInput = document.getElementById('catalog-search');
    const selPrice = document.getElementById('filter-price');
    const selWeight = document.getElementById('filter-weight');
    const selOrigin = document.getElementById('filter-origin');
    
    searchInput.value = '';
    searchQuery = '';
    selPrice.value = 'all';
    filterPrice = 'all';
    selWeight.value = 'all';
    filterWeight = 'all';
    selOrigin.value = 'all';
    filterOrigin = 'all';
    
    renderCatalog();
    selectItem(newItem.id);
  });
  
  // File loader
  function handleFileSelection(file) {
    if (!file.type.match('image.*')) {
      alert("Invalid format. Please upload a PNG or JPEG image.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      originalUploadImage = new Image();
      originalUploadImage.onload = () => {
        // Show background settings and run live transparent masking
        bgSettingsContainer.classList.remove('hidden');
        previewName.textContent = file.name;
        
        dropZone.querySelector('.drop-zone-prompt').classList.add('hidden');
        previewContainer.classList.remove('hidden');
        
        updateUploadPreview();
      };
      originalUploadImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  // Regenerate live transparency preview on input modifications
  function updateUploadPreview() {
    if (!originalUploadImage) return;
    
    const removeBg = chkRemoveBg.checked;
    const keyType = selColorType.value;
    const tolerance = parseInt(sldTolerance.value);
    
    const processedBase64 = processImageBackgroundRemoval(
      originalUploadImage,
      removeBg,
      keyType,
      tolerance
    );
    
    previewImg.src = processedBase64;
    uploadedFileBase64 = processedBase64; // Final key will be submitted
  }
  
  function resetFileSelector() {
    fileInput.value = '';
    originalUploadImage = null;
    uploadedFileBase64 = null;
    previewImg.src = '';
    previewName.textContent = '';
    
    dropZone.querySelector('.drop-zone-prompt').classList.remove('hidden');
    previewContainer.classList.add('hidden');
    bgSettingsContainer.classList.add('hidden');
  }
  
  function resetFormState() {
    form.reset();
    resetFileSelector();
    valTolerance.textContent = '40';
    bgControlsContainer.classList.remove('disabled');
  }
}

// --- URL-Based Try-On Parser (Try-On from Any Website) ---
function setupUrlTryOnForm() {
  const form = document.getElementById('url-tryon-form');
  const urlInput = document.getElementById('external-image-url');
  const categorySelect = document.getElementById('external-image-category');
  const statusEl = document.getElementById('url-tryon-status');
  const submitBtn = document.getElementById('btn-url-tryon');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    const category = categorySelect.value;
    
    if (!url) return;
    
    // Show loading state
    statusEl.className = 'url-tryon-status loading';
    statusEl.textContent = 'Fetching image from website...';
    statusEl.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
      // 1. Fetch remote image (try directly first, fall back to proxy if CORS blocked)
      let res;
      try {
        console.log("Attempting direct fetch for CORS-enabled image:", url);
        res = await fetch(url);
      } catch (directErr) {
        console.warn("Direct fetch blocked by CORS, falling back to proxy:", directErr);
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        res = await fetch(proxyUrl);
      }
      
      if (!res || !res.ok) throw new Error("Could not download the image from the provided URL.");
      
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error("The link did not point to a valid image file.");
      
      // 2. Convert blob to Base64 data url
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read image data."));
        reader.readAsDataURL(blob);
      });
      
      // 3. Load image into HTMLImageElement
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to parse image pixels."));
        img.src = dataUrl;
      });
      
      // 4. Run background removal automatically (keying background automatically with tolerance 35)
      const processedDataUrl = processImageBackgroundRemoval(img, true, 'auto', 35);
      
      // 5. Generate new catalog item
      const id = `url_${Date.now()}`;
      let scaleDefault = 1.0;
      let offsetYDefault = 0;
      if (category === 'rings') {
        scaleDefault = 0.65;
        offsetYDefault = -0.12;
      } else if (category === 'earrings') {
        scaleDefault = 0.25;
        offsetYDefault = 0.1;
      } else if (category === 'necklaces') {
        scaleDefault = 1.1;
        offsetYDefault = 0.12;
      }
      
      const newItem = {
        id: id,
        name: "Shop Piece",
        category: category,
        price: "Web Shop",
        material: "Remote Item",
        weight: null,
        description: "A jewelry piece loaded dynamically from an external website URL.",
        scaleDefault: scaleDefault,
        offsetXDefault: 0,
        offsetYDefault: offsetYDefault,
        rotationDefault: 0,
        isCustom: true,
        dataUrl: processedDataUrl
      };
      
      // Add to custom jewelry list & save
      customJewelryList.push(newItem);
      localStorage.setItem('aura_custom_jewelry', JSON.stringify(customJewelryList));
      
      // Cache image
      const cachedImg = new Image();
      cachedImg.src = newItem.dataUrl;
      imageCache[newItem.id] = cachedImg;
      
      itemCalibrations[newItem.id] = {
        scale: newItem.scaleDefault,
        offsetX: 0,
        offsetY: newItem.offsetYDefault,
        rotation: 0,
        splitEarrings: category === 'earrings'
      };
      
      // Show success state
      statusEl.className = 'url-tryon-status success';
      statusEl.textContent = 'Successfully loaded! Trying on now...';
      form.reset();
      
      // Switch active tab and try on the item!
      if (activeCategory !== category) {
        activeCategory = category;
        document.querySelectorAll('.tab-btn').forEach(btn => {
          if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
      
      renderCatalog();
      selectItem(newItem.id);
      
      // Hide status after 3 seconds
      setTimeout(() => {
        statusEl.classList.add('hidden');
      }, 3000);
      
    } catch (err) {
      console.error(err);
      statusEl.className = 'url-tryon-status error';
      statusEl.textContent = err.message || 'Error fetching external jewelry.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// --- Photo Try-On Mode Controllers (For Someone Else) ---
function setupTryOnModeControllers() {
  const modeBtns = document.querySelectorAll('.mode-tab-btn');
  const friendPhotoOverlay = document.getElementById('friend-photo-overlay');
  const friendPhotoInput = document.getElementById('friend-photo-input');
  const btnSelectFriendPhoto = document.getElementById('btn-select-friend-photo');
  const btnChangeFriendPhoto = document.getElementById('btn-change-friend-photo');
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetMode = btn.getAttribute('data-mode');
      if (targetMode === tryOnMode) return;
      
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tryOnMode = targetMode;
      
      if (tryOnMode === 'webcam') {
        isFeedMirrored = true;
        friendPhotoOverlay.classList.add('hidden');
        btnChangeFriendPhoto.classList.add('hidden');
        await restartWebcam();
      } else {
        isFeedMirrored = false;
        stopWebcam();
        if (!friendPhotoImg) {
          friendPhotoOverlay.classList.remove('hidden');
          btnChangeFriendPhoto.classList.add('hidden');
        } else {
          friendPhotoOverlay.classList.add('hidden');
          btnChangeFriendPhoto.classList.remove('hidden');
        }
      }
    });
  });
  
  // Select Photo actions
  btnSelectFriendPhoto.addEventListener('click', () => {
    friendPhotoInput.click();
  });
  
  btnChangeFriendPhoto.addEventListener('click', () => {
    friendPhotoInput.click();
  });
  
  friendPhotoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      showLoader("Loading friend's photo...", 40);
      
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          friendPhotoImg = img;
          friendPhotoOverlay.classList.add('hidden');
          btnChangeFriendPhoto.classList.remove('hidden');
          hideLoader();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Aspect ratio calculators to fit static photos on canvas elegantly
function getLetterboxDimensions(imgWidth, imgHeight, canvasWidth, canvasHeight) {
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let dWidth, dHeight, dx, dy;
  
  if (imgRatio > canvasRatio) {
    dWidth = canvasWidth;
    dHeight = canvasWidth / imgRatio;
    dx = 0;
    dy = (canvasHeight - dHeight) / 2;
  } else {
    dWidth = canvasHeight * imgRatio;
    dHeight = canvasHeight;
    dx = (canvasWidth - dWidth) / 2;
    dy = 0;
  }
  
  return { dx, dy, dWidth, dHeight };
}

// Stop Webcam tracks
function stopWebcam() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if (videoElement) {
    videoElement.srcObject = null;
  }
}

// Restart Webcam tracks
async function restartWebcam() {
  if (cameraStream) return;
  
  showLoader("Requesting camera access...", 30);
  
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      },
      audio: false
    });
    
    videoElement.srcObject = cameraStream;
    
    await new Promise(resolve => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });
    
    hideLoader();
  } catch (err) {
    console.error("Failed to restart webcam:", err);
    showLoaderError("Webcam Restart Failed. Please enable webcam permissions and refresh.");
  }
}

// --- MediaPipe Models & Camera Lifecycle ---

async function startEngine() {
  showLoader("Requesting camera access...", 15);
  
  try {
    // 1. Initialize Webcam (starts active)
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      },
      audio: false
    });
    
    videoElement.srcObject = cameraStream;
    
    // Wait until video data loads
    await new Promise(resolve => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });
    
    showLoader("Loading vision resolver...", 40);
    
    // 2. Initialize MediaPipe vision resolver
    const { FilesetResolver: MPFilesetResolver } = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/vision_bundle.mjs"
    );
    filesetResolver = await MPFilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm"
    );
    
    // 3. Auto-load the initial model needed (Face Landmarker for necklaces/earrings)
    if (activeItem) {
      await ensureModelLoaded(activeItem.category);
    }
    
    // Start drawing frame loops
    animationFrameId = requestAnimationFrame(renderLoop);
    document.getElementById('btn-snapshot').disabled = false;
    
  } catch (err) {
    console.error("Aura Engine initialization error: ", err);
    showLoaderError("Camera Access Required. Please enable webcam permissions and refresh.");
  }
}

// Load a specific tracker model (Face/Hand) on demand
async function ensureModelLoaded(category) {
  const modelType = (category === 'rings') ? 'hand' : 'face';
  
  // If already loaded, do nothing
  if (modelLoadingState[modelType] === 'loaded') {
    hideLoader();
    return;
  }
  
  // If already loading, wait for it
  if (modelLoadingState[modelType] === 'loading') {
    showLoader(`Loading ${modelType} AI tracker...`, 70);
    return;
  }
  
  modelLoadingState[modelType] = 'loading';
  showLoader(`Loading ${modelType} AI tracking model...`, 60);
  
  try {
    const { FaceLandmarker: MPFaceLandmarker, HandLandmarker: MPHandLandmarker } = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/vision_bundle.mjs"
    );
    
    if (modelType === 'face') {
      faceLandmarker = await MPFaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      });
      modelLoadingState.face = 'loaded';
    } else {
      handLandmarker = await MPHandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      modelLoadingState.hand = 'loaded';
    }
    
    hideLoader();
  } catch (err) {
    console.error(`Failed to load ${modelType} model:`, err);
    modelLoadingState[modelType] = 'error';
    showLoaderError(`AI Engine Error: Failed to load ${modelType} tracker. Please check network connection.`);
  }
}

// RENDER LOOP
function renderLoop() {
  if (tryOnMode === 'webcam') {
    // --- Live Webcam Mode ---
    if (videoElement && videoElement.readyState >= 2) {
      const videoTime = videoElement.currentTime;
      
      if (videoTime !== lastVideoTime) {
        lastVideoTime = videoTime;
        
        ctx.save();
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Mirror the webcam frame
        ctx.translate(canvasElement.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        ctx.restore();
        
        let isObjectDetected = false;
        
        // 1. Draw face-tracked items (necklaces and earrings)
        const hasActiveFaceItem = activeTryOn.necklaces || activeTryOn.earrings;
        if (hasActiveFaceItem && faceLandmarker && modelLoadingState.face === 'loaded') {
          const result = faceLandmarker.detectForVideo(videoElement, performance.now());
          if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
            isObjectDetected = true;
            drawFaceJewelry(result.faceLandmarks[0]);
          }
        }
        
        // 2. Draw hand-tracked items (rings)
        const hasActiveHandItem = activeTryOn.rings;
        if (hasActiveHandItem && handLandmarker && modelLoadingState.hand === 'loaded') {
          const result = handLandmarker.detectForVideo(videoElement, performance.now());
          if (result && result.landmarks && result.landmarks.length > 0) {
            isObjectDetected = true;
            drawHandJewelry(result.landmarks[0]);
          }
        }
        
        updateTrackingIndicator(isObjectDetected);
      }
    }
  } else {
    // --- Friend's Photo Try-On Mode ---
    if (friendPhotoImg) {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw static photo unmirrored to center of the canvas
      const dims = getLetterboxDimensions(
        friendPhotoImg.naturalWidth || friendPhotoImg.width,
        friendPhotoImg.naturalHeight || friendPhotoImg.height,
        canvasElement.width,
        canvasElement.height
      );
      ctx.drawImage(friendPhotoImg, dims.dx, dims.dy, dims.dWidth, dims.dHeight);
      
      let isObjectDetected = false;
      
      // 1. Draw face-tracked items (necklaces and earrings)
      const hasActiveFaceItem = activeTryOn.necklaces || activeTryOn.earrings;
      if (hasActiveFaceItem && faceLandmarker && modelLoadingState.face === 'loaded') {
        const result = faceLandmarker.detectForVideo(canvasElement, performance.now());
        if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
          isObjectDetected = true;
          drawFaceJewelry(result.faceLandmarks[0]);
        }
      }
      
      // 2. Draw hand-tracked items (rings)
      const hasActiveHandItem = activeTryOn.rings;
      if (hasActiveHandItem && handLandmarker && modelLoadingState.hand === 'loaded') {
        const result = handLandmarker.detectForVideo(canvasElement, performance.now());
        if (result && result.landmarks && result.landmarks.length > 0) {
          isObjectDetected = true;
          drawHandJewelry(result.landmarks[0]);
        }
      }
      
      updateTrackingIndicator(isObjectDetected);
    } else {
      // Clear canvas and draw a black luxury layout if no photo is loaded
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
      updateTrackingIndicator(false);
    }
  }
  
  animationFrameId = requestAnimationFrame(renderLoop);
}

// --- SPATIAL MATH & OVERLAY DRAWING ---

// Necklace & Earring drawing on face mesh landmarks
function drawFaceJewelry(landmarks) {
  // Screen mirroring mapping helper (1 - x to flip left-right if feed is mirrored)
  const getCanvasCoords = (pt) => ({
    x: (isFeedMirrored ? 1 - pt.x : pt.x) * canvasElement.width,
    y: pt.y * canvasElement.height,
    z: pt.z // Depth relative to nose
  });
  
  // Reference Landmarks
  const forehead = getCanvasCoords(landmarks[10]);
  const chin = getCanvasCoords(landmarks[152]);
  
  // Vector representing face height & rotation
  const faceVector = {
    x: chin.x - forehead.x,
    y: chin.y - forehead.y
  };
  
  const faceHeight = Math.hypot(faceVector.x, faceVector.y);
  
  // Face roll rotation in radians
  const faceRoll = Math.atan2(faceVector.x, faceVector.y);
  
  // Draw Necklace if active
  if (activeTryOn.necklaces) {
    const item = activeTryOn.necklaces;
    const cal = itemCalibrations[item.id];
    if (cal) {
      const size = faceHeight * cal.scale;
      const baseOffsetFactor = 0.38; // standard proportion
      const neckCenter = {
        x: chin.x + baseOffsetFactor * faceVector.x + cal.offsetX,
        y: chin.y + baseOffsetFactor * faceVector.y + cal.offsetY
      };
      
      const rotationRad = faceRoll + (cal.rotation * Math.PI / 180);
      const img = imageCache[item.id];
      if (img && img.complete) {
        ctx.save();
        ctx.translate(neckCenter.x, neckCenter.y);
        ctx.rotate(rotationRad);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
  }
  
  // Draw Earrings if active
  if (activeTryOn.earrings) {
    const item = activeTryOn.earrings;
    const cal = itemCalibrations[item.id];
    if (cal) {
      // Ear lobes estimated from outer cheek boundary points
      const leftAnchor = getCanvasCoords(landmarks[132]);
      const rightAnchor = getCanvasCoords(landmarks[361]);
      
      // Horizontal face width
      const faceWidth = Math.abs(rightAnchor.x - leftAnchor.x);
      const earringSize = faceWidth * cal.scale;
      
      const rotationRad = faceRoll + (cal.rotation * Math.PI / 180);
      const img = imageCache[item.id];
      
      if (img && img.complete) {
        // Check if we should split the earring image
        const splitEarrings = (cal.splitEarrings !== undefined) ? cal.splitEarrings : true;
        
        if (splitEarrings) {
          // Draw left half of the image on the left ear (using left-half crop)
          ctx.save();
          ctx.translate(leftAnchor.x - cal.offsetX, leftAnchor.y + cal.offsetY);
          ctx.rotate(rotationRad);
          ctx.drawImage(
            img,
            0, 0, img.width / 2, img.height, // source dimensions (left half)
            -earringSize / 2, -earringSize / 2, earringSize, earringSize // destination dimensions
          );
          ctx.restore();
          
          // Draw left half of the image on the right ear as well!
          // This draws ONLY the left (front-facing) earring on BOTH ears, completely hiding the profile/backing stud!
          ctx.save();
          ctx.translate(rightAnchor.x + cal.offsetX, rightAnchor.y + cal.offsetY);
          ctx.rotate(rotationRad);
          ctx.drawImage(
            img,
            0, 0, img.width / 2, img.height, // source dimensions (left half)
            -earringSize / 2, -earringSize / 2, earringSize, earringSize // destination dimensions
          );
          ctx.restore();
        } else {
          // Draw the full image on both ears (for single earring photos)
          ctx.save();
          ctx.translate(leftAnchor.x - cal.offsetX, leftAnchor.y + cal.offsetY);
          ctx.rotate(rotationRad);
          ctx.drawImage(img, -earringSize / 2, -earringSize / 2, earringSize, earringSize);
          ctx.restore();
          
          ctx.save();
          ctx.translate(rightAnchor.x + cal.offsetX, rightAnchor.y + cal.offsetY);
          ctx.rotate(rotationRad);
          ctx.drawImage(img, -earringSize / 2, -earringSize / 2, earringSize, earringSize);
          ctx.restore();
        }
      }
    }
  }
}

// Ring drawing on finger landmarks
function drawHandJewelry(landmarks) {
  if (!activeTryOn.rings) return;
  const item = activeTryOn.rings;
  const cal = itemCalibrations[item.id];
  if (!cal) return;
  
  // Screen mapping mapping helper
  const getCanvasCoords = (pt) => ({
    x: (isFeedMirrored ? 1 - pt.x : pt.x) * canvasElement.width,
    y: pt.y * canvasElement.height
  });
  
  // Landmarks for Ring Finger: 13 (MCP/Base joint) and 14 (PIP/Middle joint)
  const mcp = getCanvasCoords(landmarks[13]);
  const pip = getCanvasCoords(landmarks[14]);
  
  // Finger vector (points from base to middle joint)
  const fingerVector = {
    x: pip.x - mcp.x,
    y: pip.y - mcp.y
  };
  
  const phalanxLength = Math.hypot(fingerVector.x, fingerVector.y);
  
  // Midpoint of the base phalanx (ideal ring position)
  const ringCenter = {
    x: mcp.x + 0.55 * fingerVector.x,
    y: mcp.y + 0.55 * fingerVector.y
  };
  
  const size = phalanxLength * cal.scale;
  
  // Adjust anchor point using sliders
  const drawX = ringCenter.x + cal.offsetX;
  const drawY = ringCenter.y + cal.offsetY;
  
  // Compute finger direction angle
  const fingerAngle = Math.atan2(fingerVector.y, fingerVector.x);
  
  // Ring vector should be perpendicular to finger direction, plus manual rotation
  const ringRotation = fingerAngle + Math.PI / 2 + (cal.rotation * Math.PI / 180);
  
  const img = imageCache[item.id];
  if (img && img.complete) {
    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(ringRotation);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

// --- Showroom Capture & local storage ---

function captureTryOn() {
  if (!canvasElement) return;
  
  // Convert canvas contents to PNG image data URL
  const dataUrl = canvasElement.toDataURL('image/png');
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString();
  
  const snapshot = {
    id: `snap_${Date.now()}`,
    dataUrl: dataUrl,
    timestamp: `${dateStr} @ ${timestamp}`,
    itemName: activeItem ? activeItem.name : "Aura Jewelry"
  };
  
  showroomSnapshots.unshift(snapshot);
  
  // Save to localStorage (limit to last 8 captures to conserve quota)
  if (showroomSnapshots.length > 8) {
    showroomSnapshots.pop();
  }
  localStorage.setItem('aura_snapshots', JSON.stringify(showroomSnapshots));
  
  // Update showroom UI gallery
  loadSavedSnapshots();
  
  // Quick premium flash effect on the viewport
  const wrapper = document.querySelector('.canvas-wrapper');
  wrapper.style.transition = 'none';
  wrapper.style.filter = 'brightness(2) contrast(0.8)';
  setTimeout(() => {
    wrapper.style.transition = 'filter 0.5s ease-out';
    wrapper.style.filter = 'none';
  }, 50);
}

function loadSavedSnapshots() {
  const list = document.getElementById('snapshot-list');
  list.innerHTML = '';
  
  if (showroomSnapshots.length === 0) {
    list.innerHTML = `<div class="gallery-empty-state">Snapshots you capture will appear here. Try on some items and take a picture!</div>`;
    return;
  }
  
  showroomSnapshots.forEach(snap => {
    const thumb = document.createElement('div');
    thumb.className = 'snapshot-thumbnail';
    thumb.innerHTML = `
      <img src="${snap.dataUrl}" alt="${snap.itemName}">
      <button class="snapshot-delete" title="Delete snapshot" data-id="${snap.id}">✕</button>
    `;
    
    // Download snapshot on thumbnail click
    thumb.querySelector('img').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `Aura_TryOn_${snap.itemName.replace(/\s+/g, '_')}.png`;
      link.href = snap.dataUrl;
      link.click();
    });
    
    // Delete snapshot click
    thumb.querySelector('.snapshot-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSnapshot(snap.id);
    });
    
    list.appendChild(thumb);
  });
}

function deleteSnapshot(id) {
  showroomSnapshots = showroomSnapshots.filter(s => s.id !== id);
  localStorage.setItem('aura_snapshots', JSON.stringify(showroomSnapshots));
  loadSavedSnapshots();
}

// --- Loading HUD Overlay Utilities ---

function showLoader(message, progressPercentage) {
  const loader = document.getElementById('loader');
  const text = document.getElementById('loader-progress');
  const bar = document.getElementById('loader-bar');
  
  if (loader.style.display === 'none') {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }
  
  text.textContent = message;
  bar.style.width = `${progressPercentage}%`;
}

function hideLoader() {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

function showLoaderError(errorMessage) {
  const loader = document.getElementById('loader');
  const spinner = loader.querySelector('.loader-spinner');
  const text = document.getElementById('loader-progress');
  const bar = document.getElementById('loader-bar');
  
  if (spinner) spinner.style.display = 'none';
  if (bar) bar.parentElement.style.display = 'none';
  
  loader.querySelector('.loader-title').textContent = "Initialization Failed";
  text.innerHTML = `<span style="color: #ff4d4d; font-weight: 500;">${errorMessage}</span>`;
}

function updateTrackingIndicator(active) {
  const indicator = document.getElementById('tracking-indicator');
  const text = document.getElementById('tracking-status-text');
  
  if (active) {
    if (indicator.classList.contains('inactive')) {
      indicator.classList.remove('inactive');
      indicator.classList.add('active');
    }
    const trackedObject = (activeItem && activeItem.category === 'rings') ? 'Hand' : 'Face';
    text.textContent = `${trackedObject} Tracked`;
  } else {
    if (indicator.classList.contains('active')) {
      indicator.classList.remove('active');
      indicator.classList.add('inactive');
    }
    
    if (tryOnMode === 'photo' && !friendPhotoImg) {
      text.textContent = "Upload a photo to see fitting";
    } else {
      const targetObject = (activeItem && activeItem.category === 'rings') ? 'hand' : 'face';
      text.textContent = `Align ${targetObject} in view`;
    }
  }
}
