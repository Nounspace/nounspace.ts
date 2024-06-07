import React from 'react';
import TextInput from "@/common/ui/molecules/TextInput";
import ColorSelector from "@/common/ui/molecules/ColorSelector";
import FontSelector from "@/common/ui/molecules/FontSelector";
import { FidgetEditConfig, FidgetModule } from "@/common/fidgets";
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/common/ui/atoms/card';
import { FontFamily, Color } from '@/common/lib/theme';

export type TextFidgetSettings = {
  title?: string,
  text: string,
  fontFamily: FontFamily,
  background: Color
};

export const textConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "title",
      default: "Text Fidget",
      required: false,
      inputSelector: TextInput,
    },
    {
      fieldName: "text",
      default: "Jot down your ideas and grow them.",
      required: true,
      inputSelector: TextInput,
    },
    {
      fieldName: "fontFamily",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
    },
    {
      fieldName: "background",
      default: "var(--user-theme-background)",
      required: false,
      inputSelector: ColorSelector,
    }
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  }
};

export const Text: React.FC<TextFidgetSettings> = (props) => {
  return (
    <div
      style={{
        background: props.background,
        fontFamily: props.fontFamily,
        height: '100%',
      }}
    >
      {
        props?.title && (
          <CardHeader className="p-4 pb-2">
            <CardTitle className='text-2xl font-bold'>
              { props.title }
            </CardTitle>
          </CardHeader>
        )
      }
      {
        props?.text && (
          <CardContent className="p-4 pt-2">
            <CardDescription className='text-base font-normal text-black dark:text-white'>
              { props.text }
            </CardDescription>
          </CardContent>
        )
      }
    </div>
  );
};

export default {
  fidget: Text,
  editConfig: textConfig
} as FidgetModule<TextFidgetSettings>;