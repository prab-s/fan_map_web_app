<script>
  import { onMount } from 'svelte';

  export let value = '';
  export let id = '';
  export let rows = 4;

  let editor;
  let color = '#732323';
  let lastHtml = '';
  let savedRange;

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Tahoma', label: 'Tahoma' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Verdana', label: 'Verdana' }
  ];

  function syncEditor() {
    if (!editor || document.activeElement === editor) return;
    const nextHtml = value || '';
    if (nextHtml !== lastHtml) {
      editor.innerHTML = nextHtml;
      lastHtml = nextHtml;
    }
  }

  function updateValue() {
    if (!editor) return;
    value = editor.innerHTML;
    lastHtml = value;
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editor?.contains(selection.anchorNode)) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (!savedRange || !editor) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  function command(name, commandValue = null) {
    editor?.focus();
    document.execCommand(name, false, commandValue);
    updateValue();
  }

  function chooseColor(event) {
    color = event.currentTarget.value;
    editor?.focus();
    restoreSelection();
    command('foreColor', color);
  }

  function chooseFont(event) {
    const font = event.currentTarget.value;
    if (!font) return;
    editor?.focus();
    restoreSelection();
    command('fontName', font);
    event.currentTarget.value = '';
  }

  onMount(syncEditor);

  $: syncEditor();
</script>

<div class="rich-text-editor">
  <div class="rich-text-editor__toolbar" role="toolbar" aria-label="Text formatting">
    <div class="btn-group btn-group-sm" role="group" aria-label="Text style">
      <button class="btn btn-outline-secondary" type="button" title="Bold" aria-label="Bold" on:mousedown|preventDefault={() => command('bold')}><strong>B</strong></button>
      <button class="btn btn-outline-secondary" type="button" title="Italic" aria-label="Italic" on:mousedown|preventDefault={() => command('italic')}><em>I</em></button>
      <button class="btn btn-outline-secondary" type="button" title="Underline" aria-label="Underline" on:mousedown|preventDefault={() => command('underline')}><u>U</u></button>
      <button class="btn btn-outline-secondary" type="button" title="Strikethrough" aria-label="Strikethrough" on:mousedown|preventDefault={() => command('strikeThrough')}>S̶</button>
    </div>
    <select class="form-select form-select-sm rich-text-editor__font" aria-label="Font" title="Font" on:mousedown={saveSelection} on:change={chooseFont}>
      <option value="">Font</option>
      {#each fontOptions as font}
        <option value={font.value} style={`font-family: ${font.value}`}>{font.label}</option>
      {/each}
    </select>
    <div class="btn-group btn-group-sm" role="group" aria-label="Paragraph formatting">
      <button class="btn btn-outline-secondary" type="button" title="Decrease indent" aria-label="Decrease indent" on:mousedown|preventDefault={() => command('outdent')}>⇤</button>
      <button class="btn btn-outline-secondary" type="button" title="Increase indent" aria-label="Increase indent" on:mousedown|preventDefault={() => command('indent')}>⇥</button>
      <button class="btn btn-outline-secondary" type="button" title="Bulleted list" aria-label="Bulleted list" on:mousedown|preventDefault={() => command('insertUnorderedList')}>•</button>
      <button class="btn btn-outline-secondary" type="button" title="Numbered list" aria-label="Numbered list" on:mousedown|preventDefault={() => command('insertOrderedList')}>1.</button>
    </div>
    <label class="btn btn-sm btn-outline-secondary mb-0" title="Text colour" aria-label="Text colour">
      <span aria-hidden="true">A</span>
      <input class="rich-text-editor__color" type="color" bind:value={color} on:mousedown={saveSelection} on:change={chooseColor} />
    </label>
    <button class="btn btn-sm btn-outline-secondary" type="button" title="Remove formatting" aria-label="Remove formatting" on:mousedown|preventDefault={() => command('removeFormat')}>Clear</button>
  </div>
  <div
    class="form-control rich-text-editor__surface"
    class:rich-text-editor__surface--short={rows <= 3}
    id={id}
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    aria-label="Rich text"
    bind:this={editor}
    on:input={updateValue}
    on:blur={updateValue}
  ></div>
</div>

<style>
  .rich-text-editor__surface {
    min-height: 8rem;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .rich-text-editor__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.5rem;
  }

  .rich-text-editor__font {
    width: 9.5rem;
  }

  .rich-text-editor__surface--short {
    min-height: 6rem;
  }

  .rich-text-editor__surface :global(p:first-child) {
    margin-top: 0;
  }

  .rich-text-editor__surface :global(p:last-child) {
    margin-bottom: 0;
  }

  .rich-text-editor__color {
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 0;
    vertical-align: middle;
  }
</style>
