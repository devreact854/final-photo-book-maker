import * as React from "react";
import { useState } from "react";
import AppsIcon from "@mui/icons-material/Apps";

export default function ToggleButton({ onToggle }) {
  const [selectedBtn, setSelectedBtn] = useState("edit");

  const handleSelectedBtn = (btnId) => {
    setSelectedBtn(btnId);
    onToggle(btnId);
  };

  return (
    <div
      className="w-[260px] h-[50px] flex flex-row fixed bottom-[3vh] z-20 bg-[white]"
      style={{
        borderBottomLeftRadius: "18px",
        borderTopLeftRadius: "18px",
        borderBottomRightRadius: "18px",
        borderTopRightRadius: "18px",
      }}
    >
      <button
        className={`w-[130px] py-2 border-l-2 border-b-2 border-t-2 border-gray-300
                    ${
                      selectedBtn === "edit"
                        ? "bg-black text-white border-none"
                        : ""
                    }`}
        style={{ borderBottomLeftRadius: "18px", borderTopLeftRadius: "18px" }}
        onClick={() => handleSelectedBtn("edit")}
      >
        <span>
          Edit
          {selectedBtn === "organize" && (
            <img
              src="/assets/icons/layout.edit.black.svg"
              alt=""
              className="w-[64px] h-[16px] mt-[-19px]"
            />
          )}
          {selectedBtn === "edit" && (
            <img
              src="/assets/icons/layout.edit.white.svg"
              alt=""
              className="w-[64px] h-[16px] mt-[-19px]"
            />
          )}
        </span>
      </button>
      <button
        className={`w-[130px] py-2 border-r-2 border-b-2 border-t-2 border-gray-300
                    ${
                      selectedBtn === "organize"
                        ? "bg-black text-white border-none"
                        : ""
                    }`}
        style={{
          borderBottomRightRadius: "18px",
          borderTopRightRadius: "18px",
        }}
        onClick={() => handleSelectedBtn("organize")}
      >
        <span>Organize</span>
        <AppsIcon />
      </button>
    </div>
  );
}
