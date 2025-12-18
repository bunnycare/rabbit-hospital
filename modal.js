document.addEventListener('DOMContentLoaded', () => {
    // Modal Configuration
    const modals = [
        { triggerId: 'tos-link', modalId: 'tos-modal', closeId: 'tos-close' },
        { triggerId: 'privacy-link', modalId: 'privacy-modal', closeId: 'privacy-close' }
    ];

    modals.forEach(config => {
        setupModal(config);
    });

    function setupModal({ triggerId, modalId, closeId }) {
        const trigger = document.getElementById(triggerId);
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeId);

        if (trigger && modal && closeBtn) {
            // Open Modal
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(modal);
            });

            // Close Modal via Button
            closeBtn.addEventListener('click', () => {
                closeModal(modal);
            });

            // Close Modal via Overlay Click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    }

    // Close Modal via Escape Key (Global listener)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay.open');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });

    function openModal(modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal(modal) {
        modal.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }
});
