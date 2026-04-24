// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// Form Submission Handler
const appointmentForm = document.getElementById('appointmentForm');
const API_BASE_URL = '/api';
const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'authUser';

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (_error) {
        return null;
    }
}

function setAuthSession(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

function ensureAuthenticatedOrRedirect() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function getAuthErrorMessage(result, fallbackText) {
    const details = result?.error ? ` ${result.error}` : '';
    return `${result?.message || fallbackText}${details}`;
}

function createAuthModalMarkup() {
    return `
        <div class="auth-modal-overlay" id="authModalOverlay">
            <div class="auth-modal">
                <button type="button" class="auth-close" id="authCloseBtn" aria-label="Закрыть окно">×</button>
                <h3 class="auth-title">Вход и регистрация</h3>
                <p class="auth-subtitle" id="authStatusText">Войдите в аккаунт, чтобы записываться онлайн.</p>

                <div class="auth-tabs">
                    <button type="button" class="auth-tab active" data-auth-tab="login">Вход</button>
                    <button type="button" class="auth-tab" data-auth-tab="register">Регистрация</button>
                </div>

                <form id="loginForm" class="auth-form active">
                    <div class="form-group">
                        <input type="email" id="loginEmail" placeholder="Email (логин)" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="loginPassword" placeholder="Пароль" required>
                    </div>
                    <button type="submit" class="btn btn-primary auth-submit-btn">Войти</button>
                </form>

                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <input type="text" id="registerName" placeholder="Ваше имя" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="registerEmail" placeholder="Email (логин)" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" id="registerPhone" placeholder="Телефон" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="registerPassword" placeholder="Пароль (минимум 6 символов)" required>
                    </div>
                    <button type="submit" class="btn btn-primary auth-submit-btn">Зарегистрироваться</button>
                </form>

                <button type="button" id="logoutBtn" class="btn btn-secondary auth-logout-btn">Выйти из аккаунта</button>
            </div>
        </div>
    `;
}

function setupAuthTabs(container) {
    const tabs = container.querySelectorAll('.auth-tab');
    const loginForm = container.querySelector('#loginForm');
    const registerForm = container.querySelector('#registerForm');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((btn) => btn.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.authTab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });
}

function initAuthUI() {
    if (window.location.pathname === '/admin') {
        return;
    }

    const navActions = document.querySelector('.nav-actions');
    if (!navActions) {
        return;
    }

    const quickLinks = document.createElement('div');
    quickLinks.className = 'auth-quick-links';
    navActions.prepend(quickLinks);

    const authButton = document.createElement('button');
    authButton.type = 'button';
    authButton.id = 'authButton';
    authButton.className = 'auth-icon-btn';
    authButton.setAttribute('aria-label', 'Вход и регистрация');
    authButton.innerHTML = '<span class="auth-icon">👤</span>';
    navActions.prepend(authButton);

    document.body.insertAdjacentHTML('beforeend', createAuthModalMarkup());
    const modalOverlay = document.getElementById('authModalOverlay');
    const closeButton = document.getElementById('authCloseBtn');
    const statusText = document.getElementById('authStatusText');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const updateAuthState = () => {
        const user = getStoredUser();
        const isLoggedIn = Boolean(getAuthToken() && user);

        if (isLoggedIn) {
            const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
            statusText.textContent = `Вы вошли как ${user.name || user.email}.`;
            authButton.innerHTML = `<span class="auth-icon">${initial}</span>`;
            logoutBtn.style.display = 'block';
            const cabinetLink = '<a class="auth-link-btn" href="/cabinet">Кабинет</a>';
            const adminLink = user.role === 'admin' ? '<a class="auth-link-btn" href="/admin">Админ</a>' : '';
            quickLinks.innerHTML = `${cabinetLink}${adminLink}`;
        } else {
            statusText.textContent = 'Войдите в аккаунт, чтобы записываться онлайн.';
            authButton.innerHTML = '<span class="auth-icon">👤</span>';
            logoutBtn.style.display = 'none';
            quickLinks.innerHTML = '';
        }
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
    };

    const openModal = () => {
        modalOverlay.classList.add('active');
    };

    authButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    setupAuthTabs(modalOverlay);

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(getAuthErrorMessage(result, 'Ошибка входа.'));
            }

            setAuthSession(result.token, result.user);
            updateAuthState();
            alert('Вход выполнен успешно.');
            closeModal();
            loginForm.reset();
        } catch (error) {
            alert(error.message);
        }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(getAuthErrorMessage(result, 'Ошибка регистрации.'));
            }

            setAuthSession(result.token, result.user);
            updateAuthState();
            alert('Регистрация прошла успешно. Вы вошли в аккаунт.');
            closeModal();
            registerForm.reset();
        } catch (error) {
            alert(error.message);
        }
    });

    logoutBtn.addEventListener('click', () => {
        clearAuthSession();
        updateAuthState();
        alert('Вы вышли из аккаунта.');
    });

    updateAuthState();
}

if (appointmentForm) {
    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            datetime: document.getElementById('datetime').value,
            message: document.getElementById('message').value
        };

        // Validate form
        if (!formData.name || !formData.phone || !formData.service || !formData.datetime) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            alert('Для записи в салон необходимо войти в аккаунт. Сначала выполните вход через API /api/auth/login.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    service: formData.service,
                    datetime: formData.datetime,
                    comment: formData.message || null
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Не удалось создать запись.');
            }

            alert('Заявка успешно отправлена. Ваша запись сохранена в личном кабинете.');
            appointmentForm.reset();
        } catch (error) {
            alert(`Ошибка отправки: ${error.message}`);
        }
    });
}

// Set minimum date for datetime input to today
const datetimeInput = document.getElementById('datetime');
if (datetimeInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format date as YYYY-MM-DDTHH:MM
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    datetimeInput.min = `${year}-${month}-${day}T10:00`;
    datetimeInput.max = `${year}-${month}-${day}T20:00`;
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and price cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-category, .price-card, .promotion-card, .feature-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] === '8') {
                value = '7' + value.substring(1);
            }
            if (value[0] !== '7') {
                value = '7' + value;
            }
            
            // Format: +7 (XXX) XXX-XX-XX
            if (value.length <= 1) {
                value = '+7';
            } else if (value.length <= 4) {
                value = `+7 (${value.substring(1)}`;
            } else if (value.length <= 7) {
                value = `+7 (${value.substring(1, 4)}) ${value.substring(4)}`;
            } else if (value.length <= 9) {
                value = `+7 (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7)}`;
            } else {
                value = `+7 (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7, 9)}-${value.substring(9, 11)}`;
            }
        } else {
            value = '';
        }
        
        e.target.value = value;
    });
}

// Add active state to navigation links on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

function formatDate(dateValue) {
    if (!dateValue) {
        return '';
    }
    return new Date(dateValue).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateValue, timeValue) {
    if (!dateValue) {
        return '';
    }
    const date = new Date(dateValue);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    return `${formattedDate}${timeValue ? ` ${timeValue.slice(0, 5)}` : ''}`;
}

function ratingToStars(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 0));
    return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}`;
}

function renderMyAppointments(appointments) {
    const list = document.getElementById('myAppointmentsList');
    if (!list) {
        return;
    }

    if (!appointments.length) {
        list.innerHTML = '<article class="review-card"><p class="review-text">У вас пока нет записей.</p></article>';
        return;
    }

    list.innerHTML = appointments.map((item) => `
        <article class="review-card">
            <div class="review-header">
                <div class="review-avatar">📅</div>
                <div>
                    <h3 class="review-name">${item.service}</h3>
                    <p class="review-service">${formatDateTime(item.appointment_date, item.appointment_time)}</p>
                </div>
            </div>
            <p class="review-text">Комментарий: ${item.comment || 'нет'}</p>
            <p class="review-rating">Статус: ${item.status}</p>
        </article>
    `).join('');
}

function renderMyReviews(reviews) {
    const list = document.getElementById('myReviewsList');
    if (!list) {
        return;
    }

    if (!reviews.length) {
        list.innerHTML = '<article class="review-card"><p class="review-text">Вы пока не оставляли отзывов.</p></article>';
        return;
    }

    list.innerHTML = reviews.map((review) => `
        <article class="review-card">
            <div class="review-header">
                <div class="review-avatar">${ratingToStars(review.rating).charAt(0)}</div>
                <div>
                    <h3 class="review-name">Отзыв от ${formatDate(review.review_date)}</h3>
                    <p class="review-service">Модерация: ${review.moderation_status}</p>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
            <p class="review-rating">Оценка: ${ratingToStars(review.rating)}</p>
        </article>
    `).join('');
}

async function loadCabinetData() {
    if (!document.getElementById('myAppointmentsList')) {
        return;
    }
    if (!ensureAuthenticatedOrRedirect()) {
        return;
    }

    const token = getAuthToken();
    const greeting = document.getElementById('cabinetGreeting');
    const user = getStoredUser();
    if (greeting && user) {
        greeting.textContent = `Здравствуйте, ${user.name || user.email}! Здесь ваша персональная информация.`;
    }

    try {
        const [appointmentsRes, myReviewsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/appointments/my`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/reviews/my`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const appointmentsData = await appointmentsRes.json();
        const myReviewsData = await myReviewsRes.json();

        if (!appointmentsRes.ok) {
            throw new Error(appointmentsData.message || 'Не удалось загрузить записи.');
        }
        if (!myReviewsRes.ok) {
            throw new Error(myReviewsData.message || 'Не удалось загрузить отзывы.');
        }

        renderMyAppointments(appointmentsData.appointments || []);
        renderMyReviews(myReviewsData.reviews || []);
    } catch (error) {
        const appointmentsList = document.getElementById('myAppointmentsList');
        const reviewsList = document.getElementById('myReviewsList');
        if (appointmentsList) {
            appointmentsList.innerHTML = `<article class="review-card"><p class="review-text">Ошибка: ${error.message}</p></article>`;
        }
        if (reviewsList) {
            reviewsList.innerHTML = `<article class="review-card"><p class="review-text">Ошибка: ${error.message}</p></article>`;
        }
    }
}

function initCabinetReviewForm() {
    const form = document.getElementById('myReviewForm');
    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!ensureAuthenticatedOrRedirect()) {
            return;
        }

        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewText').value.trim();
        const token = getAuthToken();

        if (!rating || !text) {
            alert('Укажите оценку и текст отзыва.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating: Number(rating), text })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Не удалось отправить отзыв.');
            }

            alert('Отзыв отправлен на модерацию.');
            form.reset();
            loadCabinetData();
        } catch (error) {
            alert(error.message);
        }
    });
}

function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) {
        return;
    }

    if (!reviews.length) {
        reviewsList.innerHTML = `
            <article class="review-card">
                <p class="review-text">Пока нет опубликованных отзывов. Будьте первым!</p>
            </article>
        `;
        return;
    }

    reviewsList.innerHTML = reviews.map((review) => {
        const userName = review.user_name || 'Гость';
        const avatar = userName.trim().charAt(0).toUpperCase() || 'Г';
        return `
            <article class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${avatar}</div>
                    <div>
                        <h3 class="review-name">${userName}</h3>
                        <p class="review-service">${formatDate(review.review_date)}</p>
                    </div>
                </div>
                <p class="review-text">${review.text}</p>
                <p class="review-rating">Оценка: ${ratingToStars(review.rating)}</p>
            </article>
        `;
    }).join('');
}

async function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reviews`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Не удалось загрузить отзывы.');
        }
        renderReviews(result.reviews || []);
    } catch (error) {
        reviewsList.innerHTML = `
            <article class="review-card">
                <p class="review-text">Ошибка загрузки отзывов: ${error.message}</p>
            </article>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    loadReviews();
    initCabinetReviewForm();
    loadCabinetData();
});
