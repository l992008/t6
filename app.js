document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const fetchProtectedDataBtn = document.getElementById('fetchProtectedData');
    const registerMessage = document.getElementById('registerMessage');
    const loginMessage = document.getElementById('loginMessage');
    const protectedData = document.getElementById('protectedData');

    // Переменная для хранения статуса авторизации
    let isAuthenticated = false;
    let currentToken = null;

    // Обработка регистрации
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = data.message;
                registerMessage.style.color = 'green';
            } else {
                registerMessage.textContent = data.message || 'Ошибка регистрации';
                registerMessage.style.color = 'red';
            }
        } catch (error) {
            registerMessage.textContent = 'Ошибка сети: ' + error.message;
            registerMessage.style.color = 'red';
        }
    });

    // Обработка входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                isAuthenticated = true;
                currentToken = data.token;
                
                loginMessage.textContent = 'Успешный вход! Токен в консоли.';
                loginMessage.style.color = 'green';
                
                console.log('JWT Token:', currentToken);
                localStorage.setItem('jwtToken', currentToken);
            } else {
                // При неверном входе сбрасываем статус авторизации
                isAuthenticated = false;
                currentToken = null;
                localStorage.removeItem('jwtToken');
                
                loginMessage.textContent = data.message || 'Ошибка входа';
                loginMessage.style.color = 'red';
            }
        } catch (error) {
            isAuthenticated = false;
            currentToken = null;
            loginMessage.textContent = 'Ошибка сети: ' + error.message;
            loginMessage.style.color = 'red';
        }
    });

    // Получение защищенных данных
    fetchProtectedDataBtn.addEventListener('click', async () => {
        // Проверяем статус авторизации и наличие токена
        if (!isAuthenticated || !currentToken) {
            protectedData.textContent = 'Ошибка: требуется авторизация';
            protectedData.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/protected', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                protectedData.textContent = `Защищенные данные: ${JSON.stringify(data)}`;
                protectedData.style.color = 'green';
            } else {
                // Если сервер вернул ошибку, сбрасываем авторизацию
                isAuthenticated = false;
                currentToken = null;
                localStorage.removeItem('jwtToken');
                
                protectedData.textContent = 'Ошибка: сессия устарела, войдите снова';
                protectedData.style.color = 'red';
            }
        } catch (error) {
            protectedData.textContent = 'Ошибка сети: ' + error.message;
            protectedData.style.color = 'red';
        }
    });

    // При загрузке страницы проверяем токен в localStorage
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
        // Можно добавить проверку валидности токена через API
        isAuthenticated = true;
        currentToken = storedToken;
    }
});
