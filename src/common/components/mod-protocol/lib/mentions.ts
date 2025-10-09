// Migrated from @mod-protocol/react-ui-shadcn/lib/mentions
// Creates configuration for rendering mentions and channels suggestions

import React from 'react';

export interface SuggestionConfig<T = any> {
  getResults: (query: string) => Promise<T[]> | T[];
  RenderList: React.ComponentType<{
    items: T[];
    selectedIndex?: number;
    onSelect?: (item: T, index: number) => void;
    selectItem?: (index: number) => void;
    query?: string;
  }>;
}

export interface RenderMentionsSuggestionConfig<T = any> {
  char: string;
  allowSpaces?: boolean;
  startOfLine?: boolean;
  decorationTag?: string;
  decorationClass?: string;
  HTMLAttributes?: Record<string, any>;
  suggestion: {
    items: (props: { query: string }) => Promise<T[]> | T[];
    render: () => React.ComponentType<{
      items: T[];
      command: (props: { item: T; range?: any }) => void;
      decorationNode?: any;
      clientRect?: () => DOMRect | null;
    }>;
    command: (props: { editor: any; range: any; props: any }) => void;
    allow?: (props: { editor: any; range: any; state: any }) => boolean;
  };
}

export function createRenderMentionsSuggestionConfig<T = any>({
  getResults,
  RenderList,
}: SuggestionConfig<T>): any {
  // For now, return a minimal configuration that satisfies the TypeScript compiler
  // TODO: Implement proper TipTap/ProseMirror suggestion rendering
  return {
    suggestion: {
      items: async ({ query }: { query: string }) => {
        if (!query) return [];
        try {
          const results = await getResults(query);
          return Array.isArray(results) ? results : [];
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          return [];
        }
      },
      render: () => ({
        onStart: () => {},
        onUpdate: () => {},
        onKeyDown: () => false,
        onExit: () => {},
      }),
    },
  };
}