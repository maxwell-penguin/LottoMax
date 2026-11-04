import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { bookshelfData } from '@/data/content';
import '../styles/Bookshelf.css';

// Muted spine colors for photo books without a thumbnail yet.
const SPINES = ['#6F93A8', '#7E9C7E', '#B0A07E', '#8F8A80', '#A07F6B'];

// Deterministic "natural" size variation, so books don't reshuffle on re-render.
const sizeFor = (shelfIdx, id) => ({
  width: 50 + ((id * 23 + shelfIdx * 7) % 21),
  height: 140 + ((id * 37 + shelfIdx * 11) % 41),
});

function Spine({ book, shelfIdx, isReading, onOpen }) {
  const { width, height } = sizeFor(shelfIdx, book.id);
  const bg = isReading ? book.color : SPINES[(book.id + shelfIdx) % SPINES.length];
  return (
    <button
      type="button"
      className={`spine${isReading ? ' spine--reading' : ''}`}
      style={{
        width,
        height,
        backgroundColor: bg,
        backgroundImage: book.image
          ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url(${book.image})`
          : undefined,
      }}
      onClick={(e) => onOpen(book, e.currentTarget.getBoundingClientRect())}
      aria-label={isReading ? `${book.title} by ${book.author}` : book.label}
    >
      <span className="spine__text">{isReading ? book.title : book.label}</span>
    </button>
  );
}

function OpenBook({ open, onClose }) {
  const { book, rect, isReading } = open;
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  // Start from the clicked spine's position and scale up from there.
  const fromX = rect.left + rect.width / 2 - window.innerWidth / 2;
  const fromY = rect.top + rect.height / 2 - window.innerHeight / 2;

  return (
    <motion.div
      className="xc-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="book-open"
        role="dialog"
        aria-modal="true"
        style={{ perspective: 1200 }}
        initial={{ x: fromX, y: fromY, scale: 0.15, rotateY: -55, opacity: 0 }}
        animate={{ x: 0, y: 0, scale: 1, rotateY: 0, opacity: 1 }}
        exit={{ x: fromX, y: fromY, scale: 0.15, rotateY: -55, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="xc-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {isReading ? (
          <div className="book-open__reading" style={{ borderLeftColor: book.color }}>
            <h3 className="book-open__title">{book.title}</h3>
            <p className="book-open__author">{book.author}</p>
            {book.note && <p className="book-open__note">{book.note}</p>}
          </div>
        ) : (
          <>
            {book.image ? (
              <img src={book.image} alt={book.caption || book.label} className="book-open__img" />
            ) : (
              <div className="book-open__img book-open__img--empty">{book.label}</div>
            )}
            {(book.caption || book.label) && (
              <p className="book-open__caption">{book.caption || book.label}</p>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function GalleryPanel() {
  const [open, setOpen] = useState(null);

  return (
    <div className="tab-panel tab-panel--list tab-panel--gallery">
      <div className="bookcase">
        {bookshelfData.map((shelf, si) => {
          const isReading = shelf.shelf === 'reading list';
          return (
            <section key={shelf.shelf} className="shelf">
              <span className="shelf__label">{shelf.shelf}</span>
              <div className="shelf__books">
                {shelf.books.map((book) => (
                  <Spine
                    key={book.id}
                    book={book}
                    shelfIdx={si}
                    isReading={isReading}
                    onOpen={(b, rect) => setOpen({ book: b, rect, isReading })}
                  />
                ))}
              </div>
              <div className="shelf__board" aria-hidden />
            </section>
          );
        })}
      </div>
      <AnimatePresence>
        {open && <OpenBook open={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
