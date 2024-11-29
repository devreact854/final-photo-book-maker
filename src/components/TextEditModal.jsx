import React, {useState} from "react";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import { Typography, TextField } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { useLibrary } from "../providers/LibraryProvider";


const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

const TextEditModal = ({ isOpen, onClose, textIndex, textList }) => {
  const [alignment, setAlignment] = useState('classic');
  const [selectedBtn, setSelectedBtn] = useState('classic');
  const [inputText, setInputText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('14pt');
  const [fontWeight, setFontWeight] = useState('400');

const { library, setLibrary } = useLibrary();
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const setTextToLibrary = (savedData) => {
    // Create a deep copy of the library state to avoid direct mutation
    let tempLibrary = JSON.parse(JSON.stringify(library.library)); // Deep clone
    let flag = false;

    if (!tempLibrary[textIndex].text) {
      tempLibrary[textIndex].text = [];
    }

    if(tempLibrary[textIndex].text[textList]){
      for(let i = 0; i < tempLibrary[textIndex].text.length; i++) {
        if(tempLibrary[textIndex].text[i].textOrder == textList) {
          tempLibrary[textIndex].text[textList] = {
            ...tempLibrary[textIndex].text[textList],
            textId: `text_${textIndex}_${textList}`,
            textContent: savedData.text,
            font: savedData.font,
          };
          flag = true;
          break;
        }
      }
    }
    if(!flag) {
      let obj = {
        textId: `text_${textIndex}_${textList}`,
        textContent: savedData.text,
        textOrder: textList,
        font: savedData.font,
      }
      tempLibrary[textIndex].text.push(obj);
    }

    setLibrary({ type: "SET", key: "library", value: tempLibrary });
  }

  const handleBtnClick = (btnValue) => {
    setSelectedBtn(btnValue);

    // Set font-family based on button clicked
    switch (btnValue) {
      case 'classic':
        setFontFamily('Lora, serif'); // or any classic font
        setFontSize('14pt');
        setFontWeight('400');
        break;
      case 'clear':
        setFontFamily('"Open Sans", sans-serif'); // or any clear font
        setFontSize('14pt');
        setFontWeight('400');
        break;
      case 'fine':
        setFontFamily('"Open Sans", sans-serif'); // or another fine font
        setFontSize('9pt');
        setFontWeight('400');
        break;
      case 'solid':
        setFontFamily('Montserrat, sans-serif'); // or any solid font
        setFontSize('16pt');
        setFontWeight('700');
        break;
      default:
        setFontFamily('Arial');
        setFontSize('14pt');
        setFontWeight('400');
    }
  }

  if (!isOpen) return null;

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const handleSave = () => {
    const savedData = {
      text: inputText,
      font: {
        family: fontFamily,
        size: fontSize,
        weight: fontWeight,
      },
    };

    setTextToLibrary(savedData);

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-8 bg-white rounded-lg w-[800px]">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h4" gutterBottom sx={{margin:'auto'}} className="pt-[40px]">
              Edit your text
          </Typography>
        </div>
        
        <ToggleButtonGroup
          color="primary"
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton value="classic" className="w-[184px]"
            onClick={() => handleBtnClick('classic')}
          >
            Classic
            {selectedBtn === 'classic' && <CheckIcon />}
          </ToggleButton>
          <ToggleButton value="clear" className="w-[184px]"
            onClick={() => handleBtnClick('clear')}
          >
            Clear
            {selectedBtn === 'clear' && <CheckIcon />}
          </ToggleButton>
          <ToggleButton value="fine" className="w-[184px]"
            onClick={() => handleBtnClick('fine')}
          >
            Fine
            {selectedBtn === 'fine' && <CheckIcon /> } 
          </ToggleButton>
          <ToggleButton value="solid" className="w-[184px]"
            onClick={() => handleBtnClick('solid')}
          >
            Solid
            {selectedBtn === 'solid' && <CheckIcon /> } 
          </ToggleButton>
        </ToggleButtonGroup>

        <Grid container spacing={1} className="flex-grow flex-1 gap-4 mb-[20px] mt-[20px]">
            <Grid size={12}>
                <Skeleton className="h-[20vh] flex items-center justify-center" sx={{color:'#e5e7eb', background: '#f2f2f2'}}>
                  <TextField
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Enter some text"
                    fullWidth
                    variant="outlined"
                    multiline // Add this to make the input multiline and enable top alignment
                    InputProps={{
                      style: {
                        border: 'none', // Remove border
                        color: 'black', // Inherit the default text color
                        fontFamily: fontFamily,
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        lineHeight: 1.2,
                        position: 'absolute',
                        top: '-89px',
                        left: '25px'
                      },
                      disableUnderline: true, // Remove underline for Material-UI TextField
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none', // Remove border around TextField
                        },
                      },
                      backgroundColor: 'transparent', // No background color
                    }}
                  />
                </Skeleton>
            </Grid>
        </Grid>

        <Grid container spacing={1} className="flex-grow flex-1 gap-4 mb-[20px] mt-[20px]">
            <Grid size={12}>
                <Skeleton className="flex items-center justify-center h-[6px]" sx={{color:'#e5e7eb', background: '#f2f2f2'}}>
                </Skeleton>
            </Grid>
        </Grid>
        <div className="flex justify-end space-x-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-black bg-gray-100 rounded w-[8rem]">
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white bg-gray-800 rounded w-[8rem]"
                    onClick={handleSave}
            >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditModal;
