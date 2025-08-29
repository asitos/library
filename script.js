const addBookBtn = document.getElementById('add-book-btn');
const modal = document.getElementById('add-book-modal');
const form = document.getElementById('add-book-form');
const booksGrid = document.getElementById('books-grid');

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
    const isRead = document.getElementById('is-read').checked;
    
    // Basic validation
    if (!title || !author || !pages) {
        alert('Please fill in all fields');
        return;
    }
    
    if (pages <= 0) {
        alert('Please enter a valid number of pages');
        return;
    }
    
    const newBook = new Book(title, author, pages, isRead);
    
    
    if (library.isInLibrary(newBook)) {
        alert(`The book "${title}" is already in your library!`);
        return;
    }
    
    library.addBook(newBook);
    createBookCard(newBook);
    
    form.reset();
    hideModal();
});

class Book {
    constructor(
        title = 'Unknown',
        author = 'Unknnown',
        pages = '0',
        isRead = false
    ) {
        this.title = title
        this.author = author
        this.pages = pages
        this.isRead = isRead
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
                    new Book(bookData.title, bookData.author, bookData.pages, bookData.isRead)
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


document.addEventListener('DOMContentLoaded', loadExistingBooks);


function clearAllBooks() {
    if (confirm('Are you sure you want to remove all books? This cannot be undone.')) {
        library.clearStorage();
        booksGrid.innerHTML = '';
        console.log('All books cleared from library and localStorage');
    }
}

function toggleRead(e) {
    const bookCard = e.target.closest('.book-card');
    const title = bookCard.querySelector('p').textContent.slice(1, -1); 
    const book = library.getBook(title);
    
    book.isRead = !book.isRead;
    
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
}

function removeBook(e) {
    const bookCard = e.target.closest('.book-card');
    const title = bookCard.querySelector('p').textContent.slice(1, -1);  
    
    library.removeBook(title);
    bookCard.remove();
}

const createBookCard = (book) => {
    const bookCard = document.createElement('div')
    const title = document.createElement('p')
    const author = document.createElement('p')
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
    author.textContent = book.author
    pages.textContent = `${book.pages} pages`
    removeBtn.textContent = 'Remove'

    if (book.isRead) {
        readBtn.textContent = 'Read'
        readBtn.classList.add('btn-light-green')
    } else {
        readBtn.textContent = 'Not read'
        readBtn.classList.add('btn-light-red')
    }
    
    bookCard.appendChild(title)
    bookCard.appendChild(author)
    bookCard.appendChild(pages)
    buttonGroup.appendChild(readBtn)
    buttonGroup.appendChild(removeBtn)
    bookCard.appendChild(buttonGroup)
    booksGrid.appendChild(bookCard)
}
