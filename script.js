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

function getAuthToken() {
    return localStorage.getItem('token');
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

function ratingToStars(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 0));
    return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}`;
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
    loadReviews();
});
