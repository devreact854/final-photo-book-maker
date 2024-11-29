import React, { useState, useEffect } from "react";
import UpdateBookModal from "../components/UpdateBookModal";
import GlobalData from "../global.json";
import { useBookFormat } from "../providers/BookFormatProvider";

const formats = GlobalData.BookFormat;
export default function BookFormat() {
  const { format, dispatch } = useBookFormat();
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    setSelectedFormat(format.format);
  }, []);

  return (
    <div className="flex flex-wrap flex-row justify-center w-full h-full px-8 py-12 mx-auto">
      <div className="w-[60%] pl-[2vw] m-auto pr-[50px]">
        <h1 className="font-bold text-[60px]">Book format</h1>
        <p className="text-gray-600 text-[24px] my-10">
          Find your perfect book in our range. We use specially formulated paper
          to give you HD quality photo printing for a premium finish.
        </p>
        <div>
          <h2 className="mb-6 text-4xl font-semibold">Format</h2>
          <div className="space-y-5">
            {formats.map((format, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  value={index}
                  checked={selectedFormat === index}
                  onChange={(e) => {
                    setSelectedFormat(parseInt(e.target.value));
                  }}
                  className="w-5 h-5 text-purple-600 form-radio"
                />
                <span className="text-lg">{format}</span>
              </label>
            ))}
          </div>

          <button
            className="w-full px-6 py-6 mx-auto mt-10 text-white bg-black rounded-lg hover:bg-gray-800 text-[18px]"
            onClick={openModal}
          >
            Update your book
          </button>
        </div>
      </div>

      <div className="flex-1 m-auto">
        <div className="flex mb-8">
          {["bg1.jpg", "bg2.jpg"].map((image, idx) => (
            <img
              key={idx}
              src={`/assets/images/${image}`}
              alt={`Book example ${idx + 1}`}
              style={{ width: "calc((100% - 32px) / 2)" }}
              className={`h-auto ${idx === 0 ? "mr-8" : ""} rounded-lg`}
            />
          ))}
        </div>
        <img
          src="/assets/images/bg3.jpg"
          alt="Book example 3"
          className="w-full h-auto rounded-lg"
        />
      </div>

      <UpdateBookModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedFormat={selectedFormat}
      />
    </div>
  );
}
