document.addEventListener('DOMContentLoaded', () => {
    const playPauseButton = document.getElementById('playPauseButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const statusMessage = document.getElementById('statusMessage');

    let isPlaying = false;

    const togglePlayPause = () => {
        if (!isPlaying) {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    playPauseButton.textContent = 'Остановить Радио';
                    statusMessage.textContent = 'Радио играет...';
                    console.log('Аудио успешно запущено.');
                })
                .catch(error => {
                    console.error('Ошибка при попытке воспроизведения аудио:', error);
                    statusMessage.textContent = 'Ошибка воспроизведения. Нажмите еще раз или разрешите автовоспроизведение.';
                    isPlaying = false;
                    playPauseButton.textContent = 'Включить Радио';
                });
        } else {
            audioPlayer.pause();
            isPlaying = false;
            playPauseButton.textContent = 'Включить Радио';
            statusMessage.textContent = 'Радио остановлено.';
            console.log('Аудио остановлено.');
        }
    };

    playPauseButton.addEventListener('click', togglePlayPause);

    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        playPauseButton.textContent = 'Остановить Радио';
        statusMessage.textContent = 'Радио играет...';
    });

    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        playPauseButton.textContent = 'Включить Радио';
        statusMessage.textContent = 'Радио остановлено.';
    });

    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        playPauseButton.textContent = 'Включить Радио';
        statusMessage.textContent = 'Радиопоток завершился.';
    });

    audioPlayer.addEventListener('error', (e) => {
        console.error('Ошибка аудио:', e);
        let message = 'Произошла ошибка при воспроизведении радиопотока.';
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                message = 'Воспроизведение аудио было прервано.';
                break;
            case e.target.error.MEDIA_ERR_NETWORK:
                message = 'Ошибка сети: Радиопоток недоступен.';
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                message = 'Ошибка декодирования аудио.';
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                message = 'Формат аудио не поддерживается или URL неверен.';
                break;
        }
        statusMessage.textContent = message;
        isPlaying = false;
        playPauseButton.textContent = 'Включить Радио';
    });

    audioPlayer.addEventListener('waiting', () => {
        statusMessage.textContent = 'Буферизация...';
    });

    audioPlayer.addEventListener('stalled', () => {
        statusMessage.textContent = 'Соединение прервано... Попытка восстановить.';
    });

    audioPlayer.addEventListener('canplay', () => {
        if (!isPlaying) {
            statusMessage.textContent = 'Готов к воспроизведению.';
        }
    });
});
