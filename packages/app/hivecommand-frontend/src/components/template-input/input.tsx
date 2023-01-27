import { Box, styled } from "@mui/material";
import { forwardRef, MutableRefObject, useRef } from "react";

import { EditorState, EditorView, useCodeMirror } from "./codemirror";

function canShowCard(props: any) {
    return !props.disableCard && (props.codeType !== "Function" || props.hasError);
}


const CodeEditorPanelContainer = styled(forwardRef<HTMLDivElement>(({ children }: any, ref) => <div ref={ref}>{children}</div>)) <{
    // styleName?: StyleName;
    enableClickCompName?: boolean;
}>`
    height: 100%;
    max-height: 100%;
    min-height: 100%;
    overflow: auto;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
    .cm-content {
      padding-top: 12px;
      padding-bottom: 0;
      height: auto;
    }
    .cm-gutters {
      border-top-left-radius: 0;
      height: auto;
    }
    .cm-editor,
    .cm-scroller {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    .cm-scroller {
      align-items: stretch !important;
      flex-grow: 1;
    }
    .cm-editor {
      min-height: 100%;
      height: fit-content;
    }
    .cm-line {
      padding-right: 16px;
    }
  `;


export const BaseInput = (props) => {
    const { editor, editorProps = {}, cardStyle, disabled, children, onClick } = props;

    const { view, isFocus } = useCodeMirror(editorProps, editor);

    return (
        <Box
            sx={{ width: '100%', height: '100%' }}
            onClick={onClick ? (e) => view && onClick(e, view) : undefined}>
            {/* {view} */}

            {/* {!disabled && view && props.widgetPopup?.(view)} */}

            {children}
            {/* <PopupCard
                cardStyle={cardStyle}
                editorFocus={!disabled && isFocus && canShowCard(props)}
                title={props.cardTitle}
                content={props.cardContent}
                richContent={props.cardRichContent?.(props.cardContent ?? "")}
                tips={props.cardTips}
                hasError={props.hasError}
            /> */}
        </Box>
    )
}

export const BaseTemplateInput = (props: any) => {
    const editor = useRef<HTMLDivElement>();

    return (
        <BaseInput editorProps={props} editor={editor} cardStyle={{ borderRadius: "8px" }}>
            <CodeEditorPanelContainer
                // styleName={props.styleName}
                ref={editor as MutableRefObject<HTMLDivElement>}
            // enableClickCompName={props.enableClickCompName}
            />
        </BaseInput>
    )
}