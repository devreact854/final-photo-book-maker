import React from "react"

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import trashIcon from '../assets/icons/trash-solid.svg';

function SideImageDelete() {
    const [view, setView] = React.useState('list');

    const handleChange = (event, nextView) => {
        setView(nextView);
    };

    return (
        <>
            <ToggleButtonGroup
                orientation="vertical"
                value={view}
                exclusive
                onChange={handleChange}
                className="bg-[#4834d4] absolute right-[-45px] top-[-6px]"
                >
                <ToggleButton value="trash" id="imageSelector" >
                    <img src={trashIcon} alt="del" id="imageSelector" className="w-[13px] h-[18px]"/>
                </ToggleButton>
            </ToggleButtonGroup>
        </>
    )
}

export default SideImageDelete;