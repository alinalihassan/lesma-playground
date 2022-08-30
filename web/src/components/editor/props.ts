import snippets from '@services/snippets';
import * as monaco from 'monaco-editor';
import { MonacoSettings } from '~/services/config';
import { getFontFamily, getDefaultFontFamily } from '~/services/fonts';

export const LANGUAGE_LESMA = 'lesma';
export const DEMO_CODE = snippets["Templates"][0].text!

// stateToOptions converts MonacoState to IEditorOptions
export const stateToOptions = (state: MonacoSettings): monaco.editor.IEditorOptions => {
  const {
    selectOnLineNumbers,
    mouseWheelZoom,
    smoothScrolling,
    cursorBlinking,
    fontLigatures,
    cursorStyle,
    contextMenu
  } = state;
  return {
    selectOnLineNumbers, mouseWheelZoom, smoothScrolling, cursorBlinking, cursorStyle, fontLigatures,
    fontFamily: state.fontFamily ? getFontFamily(state.fontFamily) : getDefaultFontFamily(),
    showUnused: true,
    automaticLayout: true,
    minimap: { enabled: state.minimap },
    contextmenu: contextMenu,
  };
};
