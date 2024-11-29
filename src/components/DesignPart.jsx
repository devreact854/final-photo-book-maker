import React from "react";

import DesignItem from "./DesignItem";

export default function DesignPart() {
  return (
    <div className="flex flex-col items-center gap-[8vh] w-[544px]" 
        style={{overflowAnchor: 'none'}}
    >
      <DesignItem />
    </div>
  );
}
