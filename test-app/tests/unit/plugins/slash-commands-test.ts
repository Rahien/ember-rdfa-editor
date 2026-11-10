import { module, test } from 'qunit';
import { EditorState, TextSelection } from '@lblod/ember-rdfa-editor';
import type IntlService from 'ember-intl/services/intl';
import {
  getSlashCommandsPluginState,
  slashCommandsPlugin,
} from '@lblod/ember-rdfa-editor/plugins/slash-commands/index';
import type { GetContextualActionGroups } from '@lblod/ember-rdfa-editor/plugins/contextual-actions';
import { SAMPLE_SCHEMA } from 'test-app/tests/helpers/prosemirror';

const intl = {
  t: (key: string) => key,
} as unknown as IntlService;

const getGroups: GetContextualActionGroups = [
  () => [
    {
      id: 'test-group',
      getActions: () => [
        {
          id: 'test-action',
          label: 'Test action',
          group: 'test-group',
          command: () => true,
        },
      ],
    },
  ],
];

function createState(text: string) {
  const doc = SAMPLE_SCHEMA.nodeFromJSON({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  });

  return EditorState.create({
    doc,
    selection: TextSelection.create(doc, doc.content.size - 1),
    plugins: [slashCommandsPlugin({ intl, getGroups })],
  });
}

function typeSlash(state: EditorState) {
  return state.apply(state.tr.insertText('/'));
}

module('ProseMirror | slash commands', function () {
  test('opens the slash menu when slash is typed after whitespace', function (assert) {
    const state = createState('during the discussion, ');

    const newState = typeSlash(state);

    assert.true(getSlashCommandsPluginState(newState)?.menuOpen);
  });

  test('opens the slash menu in an empty paragraph', function (assert) {
    const state = createState('');

    const newState = typeSlash(state);

    assert.true(getSlashCommandsPluginState(newState)?.menuOpen);
  });

  test('does not open the slash menu when slash is typed inside a word', function (assert) {
    const state = createState('and');

    const newState = typeSlash(state);

    assert.false(getSlashCommandsPluginState(newState)?.menuOpen);
  });

  test('does not open the slash menu when slash is typed after a URL scheme', function (assert) {
    const state = createState('https:');

    const newState = typeSlash(state);

    assert.false(getSlashCommandsPluginState(newState)?.menuOpen);
  });
});
