import React, { useState, useEffect } from 'react';
import UseWindowWidth from './UseWindowWidth';

const scaleToContainer = (mm) => {
  return mm * 2.5;
}

// Main component
const BookLayoutVerticalLine = ({ bookFormat, className }) => {
  const windowWidth = UseWindowWidth();

  // Function to get height based on book format
  const heightLine = () => {
    if(windowWidth < 1280) {
      switch (bookFormat) {
          case 0: return '199px';
          case 1: return '199px';
          case 2: return '285px';
          case 3: return '199px';
          default: return '199px';
      }
    } else {
      switch (bookFormat) {
          case 0: return `${scaleToContainer(209)}px`;
          case 1: return `${scaleToContainer(209)}px`;
          case 2: return `${scaleToContainer(296)}px`;
          case 3: return `${scaleToContainer(209)}px`;
          default: return `${scaleToContainer(209)}px`;
      }
    }
  };

  return (
    <div
      className={`${className} pointer-events-none`}
      style={{ height: heightLine() }}
    />
  );
};

// Variants for each layout
export const BookLayoutVerticalLineLeft = (props) => (
  <BookLayoutVerticalLine {...props} className="book-layout-left" />
);

export const BookLayoutVerticalLineRight = (props) => (
  <BookLayoutVerticalLine {...props} className="book-layout-right" />
);

export const BookLayoutVerticalLineCenter = (props) => (
  <BookLayoutVerticalLine {...props} className="book-layout" />
);

export default BookLayoutVerticalLineCenter;

