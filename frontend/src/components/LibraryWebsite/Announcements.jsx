import React from "react";
import "../../styles/style.css";

export default function Announcements() {
  return (
    <section className="announcements">
      <h3>Library Highlights</h3>
      <div className="cards">
        <div className="card">
          <h4>New Arrivals</h4>
          <p>Check out our latest collection of books added this week!</p>
        </div>
        <div className="card">
          <h4>Upcoming Events</h4>
          <p>Join our “Reading Week” event starting October 15th.</p>
        </div>
        <div className="card">
          <h4>Featured Books</h4>
          <p>Explore top-rated books recommended by our readers.</p>
        </div>
      </div>
    </section>
  );
}
