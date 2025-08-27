const addBookBtn = document.getElementById('add-book-btn');
const modal = document.getElementById('add-book-modal');
const form = document.getElementById('add-book-form');

addBookBtn.addEventListener('click', () => {
    modal.classList.add('active');
    // document.body.classList.add('modal-open');
});

function hideModal() {
    modal.classList.remove('active');
    // document.body.classList.remove('modal-open');
}

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

form.addEventListener('click', (e) => {
    e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        hideModal();
    }
});
