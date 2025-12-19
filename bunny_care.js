// Toast & Copy Feature for Bunny Care Page
document.addEventListener('DOMContentLoaded', () => {
    const shareBtn = document.getElementById('share-btn');

    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = 'https://bunnycare.co.kr';
            copyToClipboard(url, '공유 링크가 복사되었습니다');
        });
    }
});

function copyToClipboard(text, message = '복사되었습니다') {
    if (!text) return;

    // Try Modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(message);
        }).catch(err => {
            console.error('Async: Could not copy text: ', err);
            fallbackCopy(text, message);
        });
    } else {
        // Fallback
        fallbackCopy(text, message);
    }
}

function fallbackCopy(text, message) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(message);
        } else {
            console.error('Fallback: Copy command failed');
            alert('복사에 실패했습니다. 브라우저 보안 설정을 확인해주세요.');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('복사에 실패했습니다.');
    }

    document.body.removeChild(textArea);
}

function showToast(message) {
    // Remove existing notification
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove automatically after animation (2000ms)
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 2000);
}
