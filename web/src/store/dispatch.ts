import {saveAs} from 'file-saver';
import {push} from 'connected-react-router';
import {
  Action,
  MonacoParamsChanges,
  newBuildParamsChangeAction,
  newBuildResultAction,
  newErrorAction,
  newImportFileAction,
  newLoadingAction,
  newMonacoParamsChangeAction,
  newPanelStateChangeAction,
  newSettingsChangeAction,
  newToggleThemeAction,
  newUIStateChangeAction
} from './actions';
import client from '~/services/api';
import config, {RuntimeType} from '~/services/config';
import {DEMO_CODE} from '~/components/editor/props';
import {PanelState, SettingsState, State} from './state';
import {isDarkModeEnabled} from "~/utils/theme";

export type StateProvider = () => State
export type DispatchFn = (a: Action | any) => any
export type Dispatcher = (dispatch: DispatchFn, getState: StateProvider) => void

/////////////////////////////
//      Dispatchers        //
/////////////////////////////

export function newImportFileDispatcher(f: File): Dispatcher {
  return (dispatch: DispatchFn, _: StateProvider) => {
    const reader = new FileReader();
    reader.onload = e => {
      const data = e.target?.result as string;
      dispatch(newImportFileAction(f.name, data));
    };

    reader.onerror = e => {
      // TODO: replace with a nice modal
      alert(`Failed to import a file: ${e}`)
    };

    reader.readAsText(f, 'UTF-8');
  };
}

export function newCodeImportDispatcher(name: string, contents: string): Dispatcher {
  return (dispatch: DispatchFn, _: StateProvider) => {
    dispatch(newImportFileAction(`${encodeURIComponent(name)}.go`, contents));
  };
}

export function newMonacoParamsChangeDispatcher(changes: MonacoParamsChanges): Dispatcher {
  return (dispatch: DispatchFn, _: StateProvider) => {
    const current = config.monacoSettings;
    config.monacoSettings = Object.assign(current, changes);
    dispatch(newMonacoParamsChangeAction(changes));
  };
}

export const newSettingsChangeDispatcher = (changes: Partial<SettingsState>): Dispatcher => (
  (dispatch: DispatchFn, _: StateProvider) => {
    if ('useSystemTheme' in changes) {
      config.useSystemTheme = !!changes.useSystemTheme;
      changes.darkMode = isDarkModeEnabled();
    }

    if ('darkMode' in changes) {
      config.darkThemeEnabled = !!changes.darkMode;
    }

    if ('enableVimMode' in changes) {
      config.enableVimMode = !!changes.enableVimMode;
    }

    dispatch(newSettingsChangeAction(changes));
  }
);

export function newBuildParamsChangeDispatcher(runtime: RuntimeType, autoFormat: boolean): Dispatcher {
  return (dispatch: DispatchFn, _: StateProvider) => {
    config.runtimeType = runtime;
    config.autoFormat = autoFormat;
    dispatch(newBuildParamsChangeAction(runtime, autoFormat));
  };
}

export function newSnippetLoadDispatcher(snippetID?: string): Dispatcher {
  return async (dispatch: DispatchFn, _: StateProvider) => {
    if (!snippetID) {
      dispatch(newImportFileAction('prog.go', DEMO_CODE));
      return;
    }

    dispatch(newLoadingAction());
    try {
      console.log('loading snippet %s', snippetID);
      const resp = await client.getSnippet(snippetID);
      const { fileName, code } = resp;
      dispatch(newImportFileAction(fileName, code));
    } catch (err: any) {
      dispatch(newErrorAction(err.message));
    }
  }
}

export const shareSnippetDispatcher: Dispatcher =
  async (dispatch: DispatchFn, getState: StateProvider) => {
    dispatch(newLoadingAction());
    try {
      const { code } = getState().editor;
      const { snippetID } = await client.shareSnippet(code);
      dispatch(push(`/snippet/${snippetID}`));
      dispatch(newUIStateChangeAction({ shareCreated: true, snippetId: snippetID }));
    } catch (err: any) {
      dispatch(newErrorAction(err.message));
    }
  };

export const saveFileDispatcher: Dispatcher =
  (_: DispatchFn, getState: StateProvider) => {
    try {
      const { fileName, code } = getState().editor;
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, fileName);
    } catch (err) {
      // TODO: replace with a nice modal
      alert(`Failed to save a file: ${err}`)
    }
  };

export const runFileDispatcher: Dispatcher =
  async (dispatch: DispatchFn, getState: StateProvider) => {
    dispatch(newLoadingAction());
    try {
      const { settings, editor } = getState();
      switch (settings.runtime) {
        case RuntimeType.LesmaPlayground:
          const res = await client.evaluateCode(editor.code, settings.autoFormat);
          dispatch(newBuildResultAction(res));
          break;
        default:
          dispatch(newErrorAction(`AppError: Unknown Go runtime type "${settings.runtime}"`));
      }
    } catch (err: any) {
      dispatch(newErrorAction(err.message));
    }
  };

export const formatFileDispatcher: Dispatcher =
  async (dispatch: DispatchFn, getState: StateProvider) => {
    dispatch(newLoadingAction());
    try {
      const { editor: {code} } = getState();
      const res = await client.formatCode(code);

      if (res.formatted) {
        dispatch(newBuildResultAction(res));
      }
    } catch (err: any) {
      dispatch(newErrorAction(err.message));
    }
  };

export const dispatchToggleTheme: Dispatcher =
  (dispatch: DispatchFn, getState: StateProvider) => {
    const { darkMode } = getState().settings;
    config.darkThemeEnabled = !darkMode;
    dispatch(newToggleThemeAction())
  };

export const dispatchPanelLayoutChange = (changes: Partial<PanelState>): Dispatcher => (
  (dispatch: DispatchFn, getState: StateProvider) => {
    const { panel } = getState();
    config.panelLayout = { ...panel, ...changes };
    dispatch(newPanelStateChangeAction(changes));
  }
);
