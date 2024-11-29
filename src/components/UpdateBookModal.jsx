import React, { useEffect, useState } from "react";
import { useBookFormat } from "../providers/BookFormatProvider";
import { useDB } from "../hooks/useIndexDB";
import { useDispatch } from "react-redux";

import { setTab } from "../features/tabSlice";

const UpdateBookModal = ({ isOpen, onClose, selectedFormat }) => {
  const { format, setFormat } = useBookFormat();
  const { getStateVariables, saveStateVariables } = useDB();
  const [currentColorState, setCurrentColorState] = useState(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const loadBookFormat = async () => {
      const savedFormat = await getStateVariables();
      setCurrentColorState(savedFormat?.colorState);
      if(savedFormat && savedFormat.bookformatState) {
        setFormat({
          type: 'SET',
          key: 'format',
          value: savedFormat?.bookformatState || 0,
        });
      }
    };
    loadBookFormat();
  }, [setFormat, getStateVariables]);

  const handleBookFormatChange = (value) => {
    setFormat({
      type: 'SET',
      key: 'format',
      value: value
    });
    saveStateVariables(currentColorState, value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-8 bg-white rounded-lg w-[600px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="mx-auto text-2xl font-semibold">Re-arrange photos</h2>
        </div>
        <hr className="mb-4 border-t-4" />
        <p className="mb-6 text-gray-700 text-center text-[18px]">
          To change the format of your book we need to re-arrange your photos so
          they fit as best as possible in the new format. Do you want us to
          re-arrange your photos?
        </p>
        <div className="flex justify-center space-x-10">
          <button
            onClick={() => {
              onClose();
              handleBookFormatChange(selectedFormat);
            }}
            className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-black bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              dispatch(setTab(0))
              handleBookFormatChange(selectedFormat);
              onClose();
            }}
          >
            Re-arrange
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBookModal;
