// js/main.js

// ========== КОНФИГУРАЦИЯ ==========
let currentPage = 1;
let isLoading = false;
let hasMore = true;
const ITEMS_PER_PAGE = 20;

// ========== ЗАГРУЗКА ДАННЫХ С СЕРВЕРА ==========
async function loadPage(page) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading();
    
    try {
        // 👇 ЭТО ТОТ САМЫЙ КОД ИЗ ВАШЕГО ПРИМЕРА
        const response = await fetch(`api/get_anime.php?page=${page}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        
        console.log('Загружено:', data);
        
        if (data.success) {
            renderGallery(data.data);
            hasMore = data.pagination.has_next;
            updatePaginationInfo(data.pagination);
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить данные');
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// ========== ОТРИСОВКА ГАЛЕРЕИ ==========
function renderGallery(items) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    if (currentPage === 1) {
        galleryGrid.innerHTML = '';
    }
    
    items.forEach((item, index) => {
        const galleryItem = createGalleryItem(item, index);
        galleryGrid.appendChild(galleryItem);
        
        // 👇 ЭТО КЭШИРОВАНИЕ ИЗОБРАЖЕНИЙ
        cacheImage(item.image_url);
    });
    
    currentPage++;
}

// ========== СОЗДАНИЕ ЭЛЕМЕНТА ГАЛЕРЕИ ==========
function createGalleryItem(item, index) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.style.animationDelay = `${(index % 20) * 0.05}s`;
    div.style.cssText = `
        background: rgba(0, 0, 0, 0.8);
        border-radius: 15px;
        overflow: hidden;
        transition: transform 0.3s;
        cursor: pointer;
    `;
    
    div.innerHTML = `
        <div style="position: relative; width: 100%; height: 250px; overflow: hidden;">
            <img src="${item.image_url}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 15px;">
            <h4 style="color: #667eea; margin-bottom: 5px;">${escapeHtml(item.name)}</h4>
            <p style="color: #ccc;">📺 ${escapeHtml(item.anime)}</p>
            <div style="margin-top: 8px; font-size: 12px; color: #888;">
                ❤️ ${item.popularity || 0} популярность
            </div>
        </div>
    `;
    
    div.addEventListener('click', () => {
        alert(`Вы выбрали: ${item.name}\nИз аниме: ${item.anime}`);
    });
    
    return div;
}

// ========== КЭШИРОВАНИЕ ИЗОБРАЖЕНИЙ ==========
// 👇 ЭТО ТОТ САМЫЙ КОД ИЗ ВАШЕГО ПРИМЕРА
function cacheImage(url) {
    const img = new Image();
    img.src = url;
    console.log('Кэшируем изображение:', url);
}

// ========== БЕСКОНЕЧНАЯ ПРОКРУТКА ==========
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = window.innerHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            if (hasMore && !isLoading) {
                loadPage(currentPage);
            }
        }
    });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showLoading() {
    let loader = document.getElementById('loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            z-index: 2000;
            text-align: center;
        `;
        loader.innerHTML = `
            <div style="width: 40px; height: 40px; border: 3px solid #fff; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: white; margin-top: 10px;">Загрузка...</p>
        `;
        document.body.appendChild(loader);
        
        // Добавляем анимацию
        if (!document.getElementById('loader-style')) {
            const style = document.createElement('style');
            style.id = 'loader-style';
            style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
    }
    loader.style.display = 'flex';
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 300px;
    `;
    errorDiv.innerHTML = `${message}<br><small>Нажмите для закрытия</small>`;
    errorDiv.onclick = () => errorDiv.remove();
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function updatePaginationInfo(pagination) {
    const paginationDiv = document.getElementById('pagination');
    if (paginationDiv) {
        paginationDiv.innerHTML = `
            <div style="text-align: center; color: white; padding: 20px;">
                📄 Страница ${pagination.current_page} из ${pagination.total_pages} | 
                📊 Всего: ${pagination.total} элементов
                ${pagination.has_next ? '<br>⬇️ Прокрутите вниз для загрузки ⬇️' : '<br>✅ Все элементы загружены'}
            </div>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен, инициализация...');
    
    // Добавляем галерею на страницу, если её нет
    const content = document.querySelector('.content');
    if (content && !document.getElementById('galleryGrid')) {
        // Сохраняем существующие табы
        const existingTabs = document.querySelector('.tabs-container');
        
        // Создаем новую секцию с галереей
        const galleryHTML = `
            <div class="gallery-section" style="width: 100%; max-width: 1200px; margin: 40px auto;">
                <h2 class="gallery-title" style="text-align: center; color: white; margin-bottom: 30px;">🌸 Галерея аниме девушек 🌸</h2>
                <div id="galleryGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 20px;"></div>
                <div id="pagination"></div>
            </div>
        `;
        
        // Добавляем после табов
        if (existingTabs) {
            existingTabs.insertAdjacentHTML('afterend', galleryHTML);
        } else {
            content.insertAdjacentHTML('beforeend', galleryHTML);
        }
    }
    
    // Загружаем первую страницу
    loadPage(1);
    
    // Включаем бесконечную прокрутку
    setupInfiniteScroll();
});