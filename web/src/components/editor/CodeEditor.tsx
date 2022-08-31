import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {editor, IKeyboardEvent} from 'monaco-editor';
import * as monaco from 'monaco-editor';
import {
  VimModeKeymap,
  createVimModeAdapter,
  StatusBarAdapter
} from 'plugins/vim/editor';
import { attachCustomCommands } from './commands';

import {
  Connect,
  // formatFileDispatcher,
  newFileChangeAction,
  runFileDispatcher,
  newSnippetLoadDispatcher
} from 'store';
import { LANGUAGE_LESMA, stateToOptions } from './props';

interface CodeEditorState {
  code?: string
  loading?: boolean
}

@Connect(s => ({
  code: s.editor.code,
  darkMode: s.settings.darkMode,
  vimModeEnabled: s.settings.enableVimMode,
  loading: s.status?.loading,
  options: s.monaco,
  vim: s.vim,
}))
export default class CodeEditor extends React.Component<any, CodeEditorState> {
  private _previousTimeout: any;
  private editorInstance?: editor.IStandaloneCodeEditor;
  private vimAdapter?: VimModeKeymap;
  private vimCommandAdapter?: StatusBarAdapter;

  editorDidMount(editorInstance: editor.IStandaloneCodeEditor, _: monaco.editor.IEditorConstructionOptions) {
    this.editorInstance = editorInstance;
    editorInstance.onKeyDown(e => this.onKeyDown(e));
    const [ vimAdapter, statusAdapter ] = createVimModeAdapter(
      this.props.dispatch,
      editorInstance
    );
    this.vimAdapter = vimAdapter;
    this.vimCommandAdapter = statusAdapter;

    if (this.props.vimModeEnabled) {
      console.log('Vim mode enabled');
      this.vimAdapter.attach();
    }

    const actions = [
      {
        id: 'clear',
        label: 'Reset contents',
        contextMenuGroupId: 'navigation',
        run: () => {
          this.props.dispatch(newSnippetLoadDispatcher());
        }
      },
      {
        id: 'run-code',
        label: 'Run Code',
        contextMenuGroupId: 'navigation',
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
        ],
        run: (ed, ...args) => {
          this.props.dispatch(runFileDispatcher);
        }
      },
      // {
      //   id: 'format-code',
      //   label: 'Format Code',
      //   contextMenuGroupId: 'navigation',
      //   keybindings: [
      //     monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
      //   ],
      //   run: (ed, ...args) => {
      //     this.props.dispatch(formatFileDispatcher);
      //   }
      // }
    ];

    // Register custom actions
    actions.forEach(action => editorInstance.addAction(action));
    attachCustomCommands(editorInstance);
    editorInstance.focus();
  }

  componentDidUpdate(prevProps) {
    if (prevProps?.vimModeEnabled === this.props.vimModeEnabled) {
      return
    }

    if (this.props.vimModeEnabled) {
      console.log('Vim mode enabled');
      this.vimAdapter?.attach();
      return;
    }

    console.log('Vim mode disabled');
    this.vimAdapter?.dispose();
  }

  componentWillUnmount() {
    this.vimAdapter?.dispose();
  }

  onChange(newValue: string, _: editor.IModelContentChangedEvent) {
    this.props.dispatch(newFileChangeAction(newValue));
  }

  private onKeyDown(e: IKeyboardEvent) {
    const {vimModeEnabled, vim} = this.props;
    if (!vimModeEnabled || !vim?.commandStarted) {
      return;
    }

    this.vimCommandAdapter?.handleKeyDownEvent(e, vim?.keyBuffer);
  }

  render() {
    const options = stateToOptions(this.props.options);
    return (
      <MonacoEditor
        language={LANGUAGE_LESMA}
        theme={this.props.darkMode ? 'vs-dark' : 'vs-light'}
        value={this.props.code}
        options={options}
        onChange={(newVal, e) => this.onChange(newVal, e)}
        editorDidMount={(e, m: any) => this.editorDidMount(e, m)}
      />
    );
  }
}
