import { Select, SelectProps, SelectProvider, useSelect } from "@mui/base";
import React from "react";
import { CustomOption, StyledButton, StyledListbox, StyledOption, StyledPopper } from "./components";
import { ExpandMore, ExpandLess } from '@mui/icons-material'

export interface TypeSelectorProps {
  options?: {id: string, label: string}[];
  value?: string;
  onChange?: (ev: any, value: any) => void;
}

export const TypeSelector = React.forwardRef(function CustomSelect<
    TValue extends {},
    Multiple extends boolean,
  >({options, value, onChange}: TypeSelectorProps, ref: React.ForwardedRef<HTMLButtonElement>) {

    const listboxRef = React.useRef<HTMLUListElement>(null);
    const [listboxVisible, setListboxVisible] = React.useState(false);
  
    const { getButtonProps, getListboxProps, contextValue, value: selectValue } = useSelect<
      string,
      false
    >({
      listboxRef,
      onOpenChange: setListboxVisible,
      open: listboxVisible,
      onChange,
      value
    });

    console.log(selectValue)
  
    React.useEffect(() => {
      if (listboxVisible) {
        listboxRef.current?.focus();
      }
    }, [listboxVisible]);

    return (
      <div style={{position: 'relative'}}>
        <StyledButton style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}} {...getButtonProps()}>
          {options?.find((a) => a.id == selectValue)?.label || (
            <span className="placeholder">{' '}</span>
          )}
          {listboxVisible ? (<ExpandLess fontSize="small" />) : <ExpandMore fontSize="small"  />}
        </StyledButton>
        <StyledListbox
          {...getListboxProps()}
          aria-hidden={!listboxVisible}
          className={listboxVisible ? '' : 'hidden'}
        >
          <SelectProvider value={contextValue}>
            {options?.map((option) => {
              return (
                <CustomOption key={option.id} value={option.id}>
                  {option.label}
                </CustomOption>
              );
            })}
          </SelectProvider>
        </StyledListbox>
        {/* <Select {...props} ref={ref} slots={slots}>
          {props.children}
        </Select>
        {(props.className || '').indexOf('Mui-expanded') > -1 ? (
          <ArrowUpward />
        ) : <ArrowDownward />} */}
      </div>
       
    );
})