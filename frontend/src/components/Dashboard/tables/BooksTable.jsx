import React from "react";
import '../../../styles/Dashboard.css';
import SortIcon from '../ui/SortIcon';

const BooksTable = ({ books, bookSort, handleBookSort, onDeleteBook }) => {

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleBookSort('title')}>
              Title <SortIcon column="title" currentSort={bookSort} />
            </th>
            <th className="sortable" onClick={() => handleBookSort('author')}>
              Author <SortIcon column="author" currentSort={bookSort} />
            </th>
            <th className="sortable" onClick={() => handleBookSort('genre')}>
              Genre <SortIcon column="genre" currentSort={bookSort} />
            </th>
            <th className="sortable" onClick={() => handleBookSort('available')}>
              Available <SortIcon column="available" currentSort={bookSort} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.available}</td>
              <td><button className="delete-btn" onClick={() => onDeleteBook(book.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BooksTable;