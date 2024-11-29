import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ImageIcon from '@mui/icons-material/Image';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import BookIcon from '@mui/icons-material/Book';
import ReplayIcon from '@mui/icons-material/Replay';

import ClearBookModal from "./ClearBookModal";
import { setTab } from "../features/tabSlice";

export default function Menubar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const tab = useSelector((state) => state.tab.value);
  const dispatch = useDispatch();

  return (
    <div className="menubar-container flex flex-row h-[100vh]: flex-wrap">
      <div className="menubar flex flex-col items-center w-[4rem]  h-full bg-[#ECEDF3]">
        <button className={`menu-btn p-[15px] bg-gray-200 border-none cursor-pointer text-base text-left focus:outline-none hover:bg-gray-300 pt-[15px ]
                            ${tab === 0 && 'bg-white'} w-[4rem]`}
                          onClick={() => dispatch(setTab(0))}>
                            <ImageIcon />
        </button>
        <button className={`menu-btn p-[15px] bg-gray-200 border-none cursor-pointer text-base text-left focus:outline-none hover:bg-gray-300 
                            ${tab === 1 && 'bg-white'} w-[4rem]`}
                          onClick={() => dispatch(setTab(1))}>
                            <ViewComfyIcon /> 
        </button>
        <button className={`menu-btn p-[15px] bg-gray-200 border-none cursor-pointer text-base text-left focus:outline-none hover:bg-gray-300 
                            ${tab === 2 && 'bg-white'} w-[4rem]`}
                          onClick={() => dispatch(setTab(2))}>
                            <BookIcon /> 
        </button>
        <button
          className="menu-btn bg-gray-200 border-none cursor-pointer text-base text-left focus:outline-none hover:bg-gray-300 fixed bottom-[2px]"
          onClick={openModal}
        >
          <ReplayIcon />
        </button>
      </div>
      <ClearBookModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
