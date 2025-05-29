import React, { useState, useEffect, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { useTiptapEditor } from '@/common/lib/hooks/useTiptapEditor';
import { CastLengthIndicator } from '@/common/components/atoms/CastLengthIndicator';
import EmojiPicker from 'emoji-picker-react';
import { GoSmiley } from 'react-icons/go';

const CreateCast = ({ afterSubmit }) => {
  const [text, setText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPickingEmoji, setIsPickingEmoji] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const onSubmit = async () => {
    setIsPublishing(true);
    try {
      // call your post logic here
      afterSubmit?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const editor = useTiptapEditor({
    onSubmit,
    onChange: setText,
  });

  const handleEmojiClick = (emojiObject: any) => {
    editor?.chain().focus().insertContent(emojiObject.emoji).run();
    setIsPickingEmoji(false);
  };

  return (
    <div className="w-full p-4">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
        <div className="border p-2 rounded">
          <EditorContent editor={editor} className="min-h-[150px]" />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPickingEmoji(!isPickingEmoji)}
            className="text-gray-600 hover:text-black"
          >
            <GoSmiley size={20} />
          </button>

          <CastLengthIndicator length={text.length} />

          <button
            type="submit"
            disabled={isPublishing}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPublishing ? 'Publishing…' : 'Cast'}
          </button>
        </div>

        {isPickingEmoji && (
          <div
            ref={parentRef}
            className="absolute z-50 mt-2"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateCast;
