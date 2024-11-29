import React from "react";
import { useSelector } from "react-redux";

import Menubar from "../components/MenuBar";
import BookFormat from "./BookFormat";
import PhotoEdit from "./PhotoEdit";

export default function Home() {
  const tab = useSelector((state) => state.tab.value);

  return (
    <div className="main-layout-container flex flex-row h-[100vh] w-[100vw] bg-white">
      <Menubar />
      {(tab === 0 || tab === 1) ? <PhotoEdit /> : <BookFormat />}
    </div>
  );
}
