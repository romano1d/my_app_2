document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const statusMessage = document.getElementById('statusMessage');
    const addToHomeScreenButton = document.getElementById('addToHomeScreenButton'); // Новая кнопка

    let isPlaying = false;
    let deferredPrompt; // Переменная для хранения события beforeinstallprompt

    // 1. Обработчик события beforeinstallprompt для PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        // Предотвращаем автоматический вызов браузером
        e.preventDefault();
        // Сохраняем событие, чтобы его можно было вызвать позже
        deferredPrompt = e;
        // Показываем нашу кнопку "Добавить на Главный Экран"
        addToHomeScreenButton.style.display = 'block';
        console.log('BeforeInstallPrompt fired!');
    });

    // 2. Обработчик клика по кнопке "Добавить на Главный Экран"
    addToHomeScreenButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Скрываем кнопку, так как пользователь уже кликнул по ней
            addToHomeScreenButton.style.display = 'none';
            // Показываем системный диалог установки
            deferredPrompt.prompt();
            // Ждем выбора пользователя
            const { outcome } = await deferredPrompt.userChoice;
            console.log(ⓃПользователь ${outcome === 'accepted' ? 'согласился' : 'отклонил'} установку PWAⓃ);
            // Сбрасываем deferredPrompt, так как он больше не нужен
            deferredPrompt = null;
        }
    });

    // Основная логика кнопки Play/Pause
    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            playPauseButton.textContent = 'Включить Радио';
            statusMessage.textContent = 'Радио остановлено.';
            isPlaying = false;
        } else {
            const playPromise = audioPlayer.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    playPauseButton.textContent = 'Выключить Радио';
                    statusMessage.textContent = 'Радио играет...';
                    isPlaying = true;
                }).catch(error => {
                    statusMessage.textContent = 'Не удалось воспроизвести радио. Возможно, требуется взаимодействие пользователя.';
                    console.error('Ошибка воспроизведения:', error);
                    isPlaying = false;
                });
            }
        }
    });

    // Обработчики событий для аудиоплеера
    audioPlayer.addEventListener('play', () => {
        statusMessage.textContent = 'Радио играет...';
        playPauseButton.textContent = 'Выключить Радио';
        isPlaying = true;
    });

    audioPlayer.addEventListener('pause', () => {
        statusMessage.textContent = 'Радио остановлено.';
        playPauseButton.textContent = 'Включить Радио';
        isPlaying = false;
    });

    audioPlayer.addEventListener('error', (e) => {
        statusMessage.textContent = 'Ошибка загрузки или воспроизведения радио.';
        console.error('Ошибка аудиоплеера:', e);
        isPlaying = false;
        playPauseButton.textContent = 'Включить Радио';
    });

    audioPlayer.addEventListener('waiting', () => {
        statusMessage.textContent = 'Буферизация...';
    });

    audioPlayer.addEventListener('stalled', () => {
        statusMessage.textContent = 'Проблема с сетью или потоком...';
    });
});
