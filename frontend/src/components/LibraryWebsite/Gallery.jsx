import React, { useEffect, useRef } from "react";
import "../../styles/style.css";

export default function Gallery() {
  const carouselRef = useRef(null);
  let autoScroll;

  useEffect(() => {
    const carousel = carouselRef.current;
    const images = Array.from(carousel.children);
    images.forEach(img => carousel.appendChild(img.cloneNode(true)));

    let isDown = false;
    let startX;
    let scrollLeft;

    const loopScroll = () => {
      const maxScroll = carousel.scrollWidth / 2;
      if (carousel.scrollLeft >= maxScroll) carousel.scrollLeft = 0;
      if (carousel.scrollLeft <= 0) carousel.scrollLeft = maxScroll;
    };

    const startAutoScroll = () => {
      stopAutoScroll();
      autoScroll = setInterval(() => {
        carousel.scrollLeft += 1;
        loopScroll();
      }, 20);
    };

    const stopAutoScroll = () => clearInterval(autoScroll);

    // Mouse events
    const mouseDown = e => { isDown = true; startX = e.pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft; stopAutoScroll(); };
    const mouseLeave = () => { isDown = false; startAutoScroll(); };
    const mouseUp = () => { isDown = false; startAutoScroll(); };
    const mouseMove = e => {
      if (!isDown) return;
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
      loopScroll();
    };

    carousel.addEventListener("mousedown", mouseDown);
    carousel.addEventListener("mouseleave", mouseLeave);
    carousel.addEventListener("mouseup", mouseUp);
    carousel.addEventListener("mousemove", mouseMove);

    // Touch events
    const touchStart = e => { isDown = true; startX = e.touches[0].pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft; stopAutoScroll(); };
    const touchEnd = () => { isDown = false; startAutoScroll(); };
    const touchMove = e => {
      if (!isDown) return;
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
      loopScroll();
    };

    carousel.addEventListener("touchstart", touchStart);
    carousel.addEventListener("touchend", touchEnd);
    carousel.addEventListener("touchmove", touchMove);

    startAutoScroll();

    return () => {
      carousel.removeEventListener("mousedown", mouseDown);
      carousel.removeEventListener("mouseleave", mouseLeave);
      carousel.removeEventListener("mouseup", mouseUp);
      carousel.removeEventListener("mousemove", mouseMove);
      carousel.removeEventListener("touchstart", touchStart);
      carousel.removeEventListener("touchend", touchEnd);
      carousel.removeEventListener("touchmove", touchMove);
      stopAutoScroll();
    };
  }, []);

  return (
    <section className="carousel">
      <h3>Gallery</h3>
      <div className="carousel-container" id="carousel" ref={carouselRef}>
        <img src="/Media/library_inside.jpg" alt="Library inside" />
        <img src="/Media/old_library.jpg" alt="Old library" />
        <img src="/Media/reading_room.jpg" alt="Reading room" />
        <img src="/Media/books.jpeg" alt="Books" />
        <img src="/Media/library.jpg" alt="Library" />
      </div>
    </section>
  );
}
