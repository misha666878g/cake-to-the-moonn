const TOTAL_CAKES = 39;
const CHEST_COST = 10;

const currentCakeImg = document.getElementById('current-cake');
const currencyAmountElem = document.getElementById('currency-amount');

const btnShop = document.getElementById('btn-shop');
const btnCollection = document.getElementById('btn-collection');

const modalShop = document.getElementById('modal-shop');
const modalCollection = document.getElementById('modal-collection');

const btnOpenChest = document.getElementById('btn-open-chest');
const chestResultContainer = document.getElementById('chest-result-container');
const chestResult = document.getElementById('chest-result');
const chestEffect = document.getElementById('chest-effect');

const closeButtons = document.querySelectorAll('.btn-close');

let currency = 50; // стартовое количество звёздочек
let collection = {};
let selectedCake = null;
let chestOpenResultCakeId = null;

// Шансы выпадения тортов (указывай свои, ниже пример)
const cakeChances = [
  0.2,0.2,0.2,0.2,0.2,
  0.2,0.2,0.2,0.2,0.5,
  0.5,1.5,0.5,1.5,0.5,
  0.5,1,0.5,0.5,1,
  0.5,1.5,0.5,0.5,0.5,
  1,0.5,0.5,0.5,0.5,
  1.5,0.5,1.5,0.5,1,1,1.5,0.5,0.1
];

// --- ЗВЁЗДЫ С ПЛАВНЫМ ДВИЖЕНИЕМ ---
const starsContainer = document.getElementById('stars-container');
const starsCount = 80;
const stars = [];

function createStar() {
  const star = document.createElement('div');
  star.classList.add('star');
  const size = Math.random() * 3 + 2; // 2-5 px
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.left = `${Math.random() * 100}%`;
  star.style.animationDuration = `${(Math.random() * 3 + 2)}s`;
  starsContainer.appendChild(star);
  return {elem: star, size, y: parseFloat(star.style.top), speed: 0.02 + Math.random() * 0.03};
}

function initStars() {
  for(let i=0; i<starsCount; i++) {
    stars.push(createStar());
  }
}

function animateStars() {
  stars.forEach(s => {
    s.y += s.speed;
    if(s.y > 100) s.y = 0;
    s.elem.style.top = `${s.y}%`;
  });
  requestAnimationFrame(animateStars);
}

// --- ФУНКЦИИ ДЛЯ КОЛЛЕКЦИИ ---

function saveCollection() {
  localStorage.setItem('cakeCollection', JSON.stringify(collection));
}

function loadCollection() {
  const stored = localStorage.getItem('cakeCollection');
  if(stored) {
    collection = JSON.parse(stored);
  } else {
    // При первом запуске даём 1 случайный торт
    const initialId = Math.floor(Math.random() * TOTAL_CAKES) + 1;
    collection[initialId] = 1;
    saveCollection();
  }
}

function updateCurrencyUI() {
  currencyAmountElem.textContent = currency;
}

function updateCurrentCake(cakeId) {
  currentCakeImg.src = `images/cake${cakeId}.gif`;
  currentCakeImg.alt = `Торт #${cakeId}`;
  selectedCake = cakeId;
}

function updateCollectionUI() {
  const collectionList = document.getElementById('collection-list');
  collectionList.innerHTML = '';

  for (const [cakeId, count] of Object.entries(collection)) {
    const div = document.createElement('div');
    div.classList.add('collection-item');
    div.dataset.cakeId = cakeId;

    const img = document.createElement('img');
    img.src = `images/cake${cakeId}.gif`;
    img.alt = `Торт #${cakeId}`;
    div.appendChild(img);

    if(count > 1) {
      const badge = document.createElement('div');
      badge.classList.add('count-badge');
      badge.textContent = count;
      div.appendChild(badge);
    }

    div.addEventListener('click', () => {
      // Убираем выделение с других
      document.querySelectorAll('.collection-item.selected').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      updateCurrentCake(cakeId);
      closeModal(modalCollection);
    });

    collectionList.appendChild(div);
  }
}

// --- ФУНКЦИИ ДЛЯ МОДАЛОК ---

function openModal(modal) {
  modal.classList.remove('hidden');
}

function closeModal(modal) {
    modal.classList.add('hidden');
  
    if (modal === modalShop) {
      chestResultContainer.classList.add('hidden');
      chestEffect.style.display = 'none';
      chestResult.src = ''; // Убираем изображение торта
      chestResult.alt = '';
      chestOpenResultCakeId = null;
    }
  }

// --- ФУНКЦИИ ДЛЯ ОТКРЫТИЯ КЕЙСА ---

function getRandomCakeIdByChance() {
  // Сумма всех шансов
  const totalChance = cakeChances.reduce((a,b) => a+b, 0);
  const rnd = Math.random() * totalChance;
  let accum = 0;
  for(let i=0; i < cakeChances.length; i++) {
    accum += cakeChances[i];
    if(rnd <= accum) return i + 1; // id с 1
  }
  return cakeChances.length; // на всякий случай последний
}

function openChest() {
  if(currency < CHEST_COST) {
    alert('Недостаточно звёздочек!');
    return;
  }
  currency -= CHEST_COST;
  updateCurrencyUI();

  // Получаем торт
  const cakeId = getRandomCakeIdByChance();
  chestOpenResultCakeId = cakeId;

  // Обновляем коллекцию с подсчётом
  if(collection[cakeId]) {
    collection[cakeId]++;
  } else {
    collection[cakeId] = 1;
  }
  saveCollection();
  updateCollectionUI();

  // Показ результата и эффекта
 chestResult.src = `images/cake${cakeId}.gif`;
 chestResult.alt = `Выпал торт #${cakeId}`;

 chestResultContainer.classList.remove('hidden');
 chestEffect.style.display = 'block';  
  

  // Увеличиваем текущий торт на экране (тоже показываем выпавший)
  updateCurrentCake(cakeId);
}

// --- ИНИЦИАЛИЗАЦИЯ ---

function init() {
  loadCollection();
  updateCollectionUI();
  updateCurrencyUI();

  // Если есть хоть один торт в коллекции, показываем первый
  const firstCakeId = Number(Object.keys(collection)[0]);
  updateCurrentCake(firstCakeId);

  // Звёзды и анимация
  initStars();
  animateStars();

  // Кнопки
  btnShop.addEventListener('click', () => openModal(modalShop));
  btnCollection.addEventListener('click', () => openModal(modalCollection));

  btnOpenChest.addEventListener('click', openChest);

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.closest('.modal')) {
        closeModal(btn.closest('.modal'));
      }
    });
  });
}

init();