import React from "react"
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import trashIcon from '../assets/icons/trash-solid.svg';
import centeredIcon from '../assets/icons/centered.svg';
import centeredGrayIcon from '../assets/icons/centered-gray.svg';
import rotateIcon from '../assets/icons/rotate-right-solid.svg';
import expandIcon from '../assets/icons/expand.svg';
import expandGrayIcon from '../assets/icons/expand-gray.svg';
import contractIcon from '../assets/icons/contract.svg';
import contractGrayIcon from '../assets/icons/contract-gray.svg';
import checkIcon from '../assets/icons/check-solid.svg';

function SideImageTool({onDelete, onExpand, onContract, onRotate, onCenter, onComplete, isCentered, isExpanded, isContracted}) {
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
                className="bg-[#4834d4] absolute top-[0px] right-[2px] w-[40px]"
                >
                <ToggleButton value="trash"  className="side-image-tool"
                    onClick={onDelete}
                >
                    <img src={trashIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>
                </ToggleButton>
                <ToggleButton value="center"  className="side-image-tool"
                    onClick={onCenter}
                    style={{
                        cursor: isCentered ? 'default' : 'pointer',
                    }}
                >
                    {!isCentered && <img src={centeredIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>}
                    {isCentered && <img src={centeredGrayIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>}
                </ToggleButton>
                <ToggleButton value="rotate"  className="side-image-tool"
                    onClick={onRotate}
                >
                    <img src={rotateIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>
                </ToggleButton>
                <ToggleButton value="contract"  className="side-image-tool"
                    onClick={onContract}
                    style={{
                        cursor: isContracted ? 'pointer' : 'default',
                    }}
                >
                    {isContracted && <img src={contractIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>}
                    {!isContracted && <img src={contractGrayIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>}
                </ToggleButton>
                <ToggleButton value="expand"  className="side-image-tool"
                    onClick={onExpand}
                    style={{
                        cursor: isExpanded ? 'pointer' : 'default',
                    }}
                >
                    {isExpanded && <img src={expandIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>}
                    {!isExpanded && <img src={expandGrayIcon} alt="del"  className="side-image-tool w-[18px] h-[18px]"/>}
                </ToggleButton>
                <ToggleButton value="check" onClick={onComplete}  className="boarder-image"
                >
                    <img src={checkIcon} alt="del"  className="boarder-image w-[18px] h-[18px]"/>
                </ToggleButton>
            </ToggleButtonGroup>
        </>
    )
}

export default SideImageTool;