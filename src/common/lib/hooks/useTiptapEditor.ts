import { useState, useEffect } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

export const useTiptapEditor = ({
  onChange,
  onSubmit,
}: {
  onChange: (text: string) => void;
  onSubmit: () => void;
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const editorInstance = useEditor({
      extensions: [
        StarterKit,
        Link,
        Placeholder.configure({
          placeholder: "What's happening?",
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion: {
            char: '@',
            startOfLine: false,
            items: async ({ query }) => {
              if (!query) return [];
              const res = await fetch(`/pages/api/farcaster/neynar/getFids?usernames=${query}`);
              const users = await res.json();
              return users.map((user: any) => ({
                id: user.username,
                label: `@${user.username}`,
              }));
            },
            render: () => {
              let dom: HTMLElement | null = null;

              function update({ items, command }: any) {
                if (!dom) return;
                dom.innerHTML = '';
                items.forEach((item: any) => {
                  if (!dom) return;
                  const el = document.createElement('div');
                  el.className = 'cursor-pointer hover:bg-gray-100 px-2 py-1';
                  el.textContent = item.label;
                  el.onclick = () => command(item);
                  dom.appendChild(el);
                });
              }

              return {
                onStart: (props) => {
                  if (!dom) return;
                  dom = document.createElement('div');
                  update(props);
                },
                onUpdate: update,
                onKeyDown: () => false,
                onExit: () => {
                  if (!dom) return;
                  if (dom && dom.parentNode) {
                    dom.parentNode.removeChild(dom);
                  }
                },
                element: dom || document.createElement('div'),
              };
            },
          },
        }),
      ],
      content: '',
      autofocus: true,
      onUpdate: ({ editor }) => {
        onChange(editor.getText());
      },
      editorProps: {
        handleKeyDown: (view, event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            onSubmit();
            return true;
          }
          return false;
        },
      },
    });

    setEditor(editorInstance);
  }, []);

  return editor;
};
