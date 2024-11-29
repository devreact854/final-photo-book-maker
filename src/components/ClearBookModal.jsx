import React from "react";

import { useDB } from "../hooks/useIndexDB";

export default function ClearBookModal({ isOpen, onClose }) {
  const {deleteAllPhotos, deleteAllWorksPhotos} = useDB();
  if (!isOpen) return null;

  const clearBook = () => {
    deleteAllWorksPhotos();
    location.reload();
    onClose();
  }

  const startOverBook = () => {
    deleteAllWorksPhotos();
    deleteAllPhotos();
    location.reload();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-8 bg-white rounded-lg w-[600px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="mx-auto text-2xl font-semibold">Clear photobook</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-[30px]"
          >
            &times;
          </button>
        </div>
        <hr className="mb-4 border-t-4" />
        <p className="mb-6 text-gray-700 text-center text-[18px]">
          'Clear book' will remove the photos from your book and leave them in
          your library. 'Start over' will clear the book and empty your library.
          These actions cannot be reverted.
        </p>
        <div className="flex justify-center space-x-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-black bg-gray-100 rounded hover:bg-gray-200"
            onClick={clearBook}
          >
            Clear book
          </button>
          <button className="px-4 py-2 text-black bg-gray-100 rounded hover:bg-gray-200"
            onClick={startOverBook}
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
