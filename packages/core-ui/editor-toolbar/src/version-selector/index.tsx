import { Select, SelectProps } from "@mui/base";
import React from "react";
import { StyledButton, StyledListbox, StyledPopper } from "./components";

export const VersionSelector = React.forwardRef(function CustomSelect<
    TValue extends {},
    Multiple extends boolean,
  >(props: SelectProps<TValue, Multiple>, ref: React.ForwardedRef<HTMLButtonElement>) {

    const slots: SelectProps<TValue, Multiple>['slots'] = {
        root: StyledButton,
        listbox: StyledListbox,
        popper: StyledPopper,
        ...props.slots,
      };
      
    return (
        <Select {...props} ref={ref} slots={slots} />
    );
})