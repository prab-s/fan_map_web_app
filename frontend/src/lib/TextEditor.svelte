<script>
  import { Compartment, EditorState } from '@codemirror/state';
  import {
    defaultKeymap,
    history,
    historyKeymap,
    indentWithTab
  } from '@codemirror/commands';
  import {
    Decoration,
    EditorView,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    drawSelection,
    MatchDecorator,
    ViewPlugin
  } from '@codemirror/view';
  import {
    syntaxHighlighting,
    defaultHighlightStyle,
    bracketMatching,
    indentOnInput,
    indentUnit
  } from '@codemirror/language';
  import { html } from '@codemirror/lang-html';
  import { css } from '@codemirror/lang-css';
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';

  export let value = '';
  export let language = 'text';
  export let editable = true;
  export let label = '';
  export let onChange = () => {};

  const editableCompartment = new Compartment();
  const languageCompartment = new Compartment();
  const whitespaceMatcher = /[ \t]+$/gm;
  const whitespaceDecorator = new MatchDecorator({
    regexp: whitespaceMatcher,
    decoration: () => Decoration.mark({ class: 'cm-trailing-whitespace' })
  });

  const whitespacePlugin = ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = whitespaceDecorator.createDeco(view);
      }

      update(update) {
        this.decorations = whitespaceDecorator.updateDeco(update, this.decorations);
      }
    },
    {
      decorations: (instance) => instance.decorations
    }
  );

  function languageExtension(nextLanguage) {
    switch (String(nextLanguage || '').toLowerCase()) {
      case 'css':
        return css();
      case 'html':
      case 'htm':
      case 'svg':
        return html({
          autoCloseTags: true,
          matchClosingTags: true,
          selfClosingTags: true
        });
      case 'javascript':
      case 'js':
      case 'mjs':
      case 'cjs':
      case 'ts':
      case 'tsx':
      case 'jsx':
        return javascript({
          jsx: String(nextLanguage || '').toLowerCase() === 'jsx' || String(nextLanguage || '').toLowerCase() === 'tsx',
          typescript: String(nextLanguage || '').toLowerCase() === 'ts' || String(nextLanguage || '').toLowerCase() === 'tsx'
        });
      case 'json':
        return json();
      default:
        return [];
    }
  }

  function createState(initialValue, nextLanguage, nextEditable) {
    return EditorState.create({
      doc: initialValue ?? '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        indentOnInput(),
        highlightSpecialChars(),
        highlightActiveLine(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        EditorState.tabSize.of(2),
        indentUnit.of('  '),
        editableCompartment.of(EditorView.editable.of(nextEditable)),
        languageCompartment.of(languageExtension(nextLanguage)),
        whitespacePlugin,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          lastValue = update.state.doc.toString();
          onChange(lastValue);
        }),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '0.92rem',
            color: 'var(--bs-body-color)',
            backgroundColor: 'var(--bs-body-bg)'
          },
          '.cm-scroller': {
            fontFamily:
              'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, monospace'
          },
          '.cm-content': {
            padding: '0.9rem 0.75rem 1.25rem',
            caretColor: 'var(--bs-body-color)',
            minHeight: '100%'
          },
          '.cm-gutters': {
            backgroundColor: 'var(--bs-tertiary-bg)',
            color: 'var(--bs-secondary-color)',
            border: 'none'
          },
          '.cm-activeLine': {
            backgroundColor: 'color-mix(in srgb, var(--bs-primary) 12%, transparent)'
          },
          '.cm-activeLine, .cm-activeLineGutter': {
            backgroundColor: 'color-mix(in srgb, var(--bs-primary) 14%, transparent)'
          },
          '.cm-content, .cm-gutters': {
            color: 'var(--bs-body-color)'
          },
          '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: 'var(--bs-body-color)'
          },
          '.cm-trailing-whitespace': {
            backgroundColor: 'color-mix(in srgb, var(--bs-danger) 18%, transparent)'
          }
        })
      ]
    });
  }

  function editorAction(node, params) {
    let currentValue = params?.value ?? '';
    let currentLanguage = params?.language ?? 'text';
    let currentEditable = params?.editable ?? true;
    let currentOnChange = params?.onChange ?? (() => {});

    const editorView = new EditorView({
      state: createState(currentValue, currentLanguage, currentEditable),
      parent: node
    });

    return {
      update(nextParams) {
        const nextValue = nextParams?.value ?? '';
        const nextLanguage = nextParams?.language ?? 'text';
        const nextEditable = nextParams?.editable ?? true;
        currentOnChange = nextParams?.onChange ?? currentOnChange;

        if (nextValue !== currentValue) {
          currentValue = nextValue;
          editorView.dispatch({
            changes: { from: 0, to: editorView.state.doc.length, insert: nextValue }
          });
        }

        if (nextLanguage !== currentLanguage || nextEditable !== currentEditable) {
          currentLanguage = nextLanguage;
          currentEditable = nextEditable;
          editorView.dispatch({
            effects: [
              editableCompartment.reconfigure(EditorView.editable.of(nextEditable)),
              languageCompartment.reconfigure(languageExtension(nextLanguage))
            ]
          });
        }
      },
      destroy() {
        editorView.destroy();
      }
    };
  }
</script>

<div class="text-editor-shell">
  {#if label}
    <div class="text-editor-label">{label}</div>
  {/if}
  <div class="text-editor-host">
    <div class="text-editor-canvas" use:editorAction={{ value, language, editable, onChange }}></div>
  </div>
</div>

<style>
  .text-editor-shell {
    border: 1px solid var(--bs-border-color);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--bs-body-bg);
    box-shadow: 0 0.35rem 1.25rem color-mix(in srgb, var(--bs-body-color) 8%, transparent);
  }

  .text-editor-label {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--bs-secondary-color);
    background: linear-gradient(180deg, var(--bs-tertiary-bg) 0%, var(--bs-body-bg) 100%);
    border-bottom: 1px solid var(--bs-border-color);
  }

  .text-editor-host {
    height: 28rem;
  }

  .text-editor-canvas {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 28rem;
  }

  :global(.cm-editor) {
    font-variant-ligatures: contextual;
  }
</style>
