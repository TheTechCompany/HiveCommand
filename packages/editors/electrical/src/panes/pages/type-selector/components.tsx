import { styled } from "@mui/system";
import { Popper } from '@mui/base/Popper';
import { selectClasses } from '@mui/base/Select'
import { optionClasses, Option } from '@mui/base/Option'
import { useOption } from '@mui/base/useOption'
import clsx from 'clsx';

const blue = {
    100: '#DAECFF',
    200: '#99CCF3',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
  };
  
  const grey = {
    50: '#f6f8fa',
    100: '#eaeef2',
    200: '#d0d7de',
    300: '#afb8c1',
    400: '#8c959f',
    500: '#6e7781',
    600: '#57606a',
    700: '#424a53',
    800: '#32383f',
    900: '#24292f',
  };
  
  export const StyledButton = styled('button')(
    ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    min-width: 100px;
    // padding: 8px 12px;
    border-radius: 8px;
    text-align: left;
    line-height: 1.5;
    cursor: pointer;
    background: transparent; // ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 0px; //1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    /*box-shadow: 0px 2px 6px ${
      theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
    };*/
  
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 120ms;
  
    &:hover {
      // background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      // border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }
  
    &.${selectClasses.focusVisible} {
      border-color: ${blue[400]};
      outline: 3px solid ${theme.palette.mode === 'dark' ? blue[500] : blue[200]};
    }
  
    // &.${selectClasses.expanded} {
    //   &::after {
    //     content: '▴';
    //   }
    // }
  
    // &::after {
    //   content: '▾';
    //   float: right;
    // }
    `,
  );
  
  export const StyledListbox = styled('ul')(
    ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    // min-width: 320px;
    padding: 12px;
    border-radius: 12px;
    text-align: left;
    line-height: 1.5;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    padding: 5px;
    margin: 5px 0 0 0;
    position: absolute;
    height: auto;
    width: 100%;
    overflow: auto;
    z-index: 1;
    outline: 0px;
    list-style: none;
    box-shadow: 0px 2px 6px ${
      theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
    };
  
    &.hidden {
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.4s ease, visibility 0.4s step-end;
    }
    `,
  );

  export interface OptionProps {
    children?: React.ReactNode;
    className?: string;
    value: string;
    disabled?: boolean;
  }

  export const CustomOption = (props: OptionProps) => {

    const { children, value, className, disabled = false } = props;

    const { getRootProps, highlighted } = useOption({
      value,
      disabled,
      label: children,
    });
  

    return (
      <StyledOption
        {...getRootProps()}
        value={value}
        className={clsx({ highlighted }, className)}
        style={{ '--color': value } as any}
      >
        {children}
      </StyledOption>
    );
  }
  
  export const StyledOption = styled(Option)(
    ({ theme }) => `
    list-style: none;
    padding: 6px;
    margin-bottom: 3px;
    border-radius: 8px;
    cursor: default;
  
    &:last-of-type {
      border-bottom: none;
    }
  
    &.${optionClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }
  
    &.${optionClasses.highlighted} {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
  
    &.${optionClasses.highlighted}.${optionClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }
  
    &.${optionClasses.disabled} {
      color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }
  
    &:hover:not(.${optionClasses.disabled}) {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
    `,
  );
  
  export const StyledPopper = styled(Popper)`
    z-index: 1;
  `;
  
  export const Label = styled('label')(
    ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 4px;
    font-weight: 400;
    color: ${theme.palette.mode === 'dark' ? grey[400] : grey[700]};
    `,
  );