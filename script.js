const addBookBtn = document.getElementById('add-book-btn');
const modal = document.getElementById('add-book-modal');
const form = document.getElementById('add-book-form');
const booksGrid = document.getElementById('books-grid');

// New elements for enhanced functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const genreFilter = document.getElementById('genre-filter');
const totalBooksEl = document.getElementById('total-books');
const booksReadEl = document.getElementById('books-read');
const booksUnreadEl = document.getElementById('books-unread');
const totalPagesEl = document.getElementById('total-pages');

let currentFilter = 'all';
let currentGenre = '';

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

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const pages = document.getElementById('book-pages').value;
    const genre = document.getElementById('book-genre').value;
    const isRead = document.getElementById('is-read').checked;
    
    // Basic validation
    if (!title || !author || !pages || !genre) {
        alert('Please fill in all fields');
        return;
    }
    
    if (pages <= 0) {
        alert('Please enter a valid number of pages');
        return;
    }
    
    const newBook = new Book(title, author, pages, genre, isRead);
    
    // Check if book already exists
    if (library.isInLibrary(newBook)) {
        alert(`The book "${title}" is already in your library!`);
        return;
    }
    
    library.addBook(newBook);
    createBookCard(newBook);
    updateStats();
    
    form.reset();
    hideModal();
});

class Book {
    constructor(
        title = 'Unknown',
        author = 'Unknown',
        pages = '0',
        genre = 'Other',
        isRead = false
    ) {
        this.title = title
        this.author = author
        this.pages = pages
        this.genre = genre
        this.isRead = isRead
        this.dateAdded = new Date().toISOString()
    }
}

class Library {
    constructor() {
        this.books = []
        this.loadFromStorage()
    }

    addBook(newBook) {
        if (!this.isInLibrary(newBook)) {
            this.books.push(newBook)
            this.saveToStorage()
        }
    }

    removeBook(title) {
        this.books = this.books.filter((book) => book.title !== title)
        this.saveToStorage()
    }

    getBook(title) {
        return this.books.find((book) => book.title === title)
    }

    isInLibrary(newBook) {
        return this.books.some((book) => book.title === newBook.title)
    }

    updateBook(title, updatedBook) {
        const index = this.books.findIndex(book => book.title === title)
        if (index !== -1) {
            this.books[index] = updatedBook
            this.saveToStorage()
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('library-books', JSON.stringify(this.books))
        } catch (error) {
            console.error('Error saving to localStorage:', error)
        }
    }

    loadFromStorage() {
        try {
            const savedBooks = localStorage.getItem('library-books')
            if (savedBooks) {
                const booksData = JSON.parse(savedBooks)
                this.books = booksData.map(bookData => 
                    new Book(
                        bookData.title, 
                        bookData.author, 
                        bookData.pages, 
                        bookData.genre || 'Other', // Handle legacy books without genre
                        bookData.isRead
                    )
                )
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error)
            this.books = []
        }
    }

    clearStorage() {
        try {
            localStorage.removeItem('library-books')
            this.books = []
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
    }
}

const library = new Library()


function loadExistingBooks() {
    library.books.forEach(book => {
        createBookCard(book)
    })
}


// Load books when the page loads and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadExistingBooks();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Filter button handlers
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            filterButtons.forEach(button => button.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Set current filter
            currentFilter = e.target.dataset.filter;
            
            // Apply filter
            filterBooks();
        });
    });
    
    // Genre filter handler
    if (genreFilter) {
        genreFilter.addEventListener('change', (e) => {
            currentGenre = e.target.value;
            filterBooks();
        });
    }
}


function clearAllBooks() {
    if (confirm('Are you sure you want to remove all books? This cannot be undone.')) {
        library.clearStorage();
        booksGrid.innerHTML = '';
        console.log('All books cleared from library and localStorage');
    }
}

function toggleRead(e) {
    const bookCard = e.target.closest('.book-card');
    const title = bookCard.querySelector('.book-title').textContent.slice(1, -1); // Remove quotes
    const book = library.getBook(title);
    
    book.isRead = !book.isRead;
    
    // Update dataset for filtering
    bookCard.dataset.isRead = book.isRead;
    
    // Update the book in library and save to storage
    library.updateBook(title, book);
    
    const readBtn = e.target;
    if (book.isRead) {
        readBtn.textContent = 'Read';
        readBtn.classList.remove('btn-light-red');
        readBtn.classList.add('btn-light-green');
    } else {
        readBtn.textContent = 'Not read';
        readBtn.classList.remove('btn-light-green');
        readBtn.classList.add('btn-light-red');
    }
    
    updateStats();
}

function removeBook(e) {
    const bookCard = e.target.closest('.book-card');
    const title = bookCard.querySelector('.book-title').textContent.slice(1, -1); // Remove quotes
    
    library.removeBook(title);
    bookCard.remove();
    updateStats();
}

const createBookCard = (book) => {
    const bookCard = document.createElement('div')
    const title = document.createElement('p')
    const author = document.createElement('p')
    const genre = document.createElement('p')
    const pages = document.createElement('p')
    const buttonGroup = document.createElement('div')
    const readBtn = document.createElement('button')
    const removeBtn = document.createElement('button')

    bookCard.classList.add('book-card')
    buttonGroup.classList.add('button-group')
    readBtn.classList.add('btn')
    removeBtn.classList.add('btn')
    readBtn.onclick = toggleRead
    removeBtn.onclick = removeBook

    title.textContent = `"${book.title}"`
    title.classList.add('book-title')
    author.textContent = book.author
    author.classList.add('book-author')
    genre.textContent = book.genre
    genre.classList.add('book-genre')
    pages.textContent = `${book.pages} pages`
    removeBtn.textContent = 'Remove'

    // Store book data for search/filter functionality
    bookCard.dataset.title = book.title.toLowerCase()
    bookCard.dataset.author = book.author.toLowerCase()
    bookCard.dataset.genre = book.genre.toLowerCase()
    bookCard.dataset.isRead = book.isRead

    if (book.isRead) {
        readBtn.textContent = 'Read'
        readBtn.classList.add('btn-light-green')
    } else {
        readBtn.textContent = 'Not read'
        readBtn.classList.add('btn-light-red')
    }
    
    bookCard.appendChild(title)
    bookCard.appendChild(author)
    bookCard.appendChild(genre)
    bookCard.appendChild(pages)
    buttonGroup.appendChild(readBtn)
    buttonGroup.appendChild(removeBtn)
    bookCard.appendChild(buttonGroup)
    booksGrid.appendChild(bookCard)
}

// Statistics update function
function updateStats() {
    const totalBooks = library.books.length;
    const booksRead = library.books.filter(book => book.isRead).length;
    const booksUnread = totalBooks - booksRead;
    const totalPages = library.books.reduce((sum, book) => sum + parseInt(book.pages), 0);
    
    totalBooksEl.textContent = totalBooks;
    booksReadEl.textContent = booksRead;
    booksUnreadEl.textContent = booksUnread;
    totalPagesEl.textContent = totalPages.toLocaleString();
}

// Filter functionality
function filterBooks() {
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        const matchesReadFilter = currentFilter === 'all' ||
            (currentFilter === 'read' && card.dataset.isRead === 'true') ||
            (currentFilter === 'unread' && card.dataset.isRead === 'false');
            
        const matchesGenreFilter = currentGenre === '' || 
            card.dataset.genre === currentGenre.toLowerCase();
            
        if (matchesReadFilter && matchesGenreFilter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Enhanced loadExistingBooks function
function loadExistingBooks() {
    // Clear existing books from display
    booksGrid.innerHTML = '';
    
    // Load books from library
    library.books.forEach(book => {
        createBookCard(book);
    });
    
    // Update statistics
    updateStats();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Existing escape key handler
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        hideModal();
        return;
    }
    
    // New shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'n':
                e.preventDefault();
                modal.classList.add('active');
                document.getElementById('book-title').focus();
                break;
        }
    }
});

// Enhanced clearAllBooks function
function clearAllBooks() {
    if (confirm('Are you sure you want to remove all books? This cannot be undone.')) {
        library.clearStorage();
        booksGrid.innerHTML = '';
        updateStats();
        console.log('All books cleared from library and localStorage');
    }
}

// Add some sample books function (for testing)
function addSampleBooks() {
    const sampleBooks = [
        new Book('The Hobbit', 'J.R.R. Tolkien', 295, 'Fantasy', true),
        new Book('Dune', 'Frank Herbert', 688, 'Science Fiction', false),
        new Book('1984', 'George Orwell', 328, 'Fiction', true),
        new Book('The Pragmatic Programmer', 'David Thomas', 352, 'Technical', false),
        new Book('Atomic Habits', 'James Clear', 320, 'Self-Help', true)
    ];
    
    sampleBooks.forEach(book => {
        if (!library.isInLibrary(book)) {
            library.addBook(book);
            createBookCard(book);
        }
    });
    
    updateStats();
    console.log('Sample books added!');
}
