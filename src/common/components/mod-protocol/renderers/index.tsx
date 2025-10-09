// Migrated from @mod-protocol/react-ui-shadcn/renderers
// Maps renderer interface to our existing UI components

import * as React from "react";
import { Button } from "@/common/components/atoms/button";
import { Input } from "@/common/components/atoms/input";
import { Textarea } from "@/common/components/atoms/textarea";
import { Card } from "@/common/components/atoms/card";
import { Avatar } from "@/common/components/atoms/avatar";
import { Alert } from "@/common/components/atoms/alert";
import { Dialog, DialogContent } from "@/common/components/atoms/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/atoms/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { Progress } from "@/common/components/atoms/progress";
import Spinner from "@/common/components/atoms/spinner";

// Simple wrapper components for missing functionality
const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

const Video: React.FC<{ videoSrc: string }> = ({ videoSrc }) => (
  <video 
    src={videoSrc} 
    controls 
    className="w-full rounded-lg"
    style={{ maxWidth: "100%" }}
  />
);

const Image: React.FC<{ imageSrc: string }> = ({ imageSrc }) => (
  <img 
    src={imageSrc} 
    alt="" 
    className="w-full rounded-lg object-cover"
    style={{ maxWidth: "100%" }}
  />
);

// Custom Select wrapper to match the expected interface
const ModSelect: React.FC<{
  isClearable: boolean;
  placeholder?: string;
  options: Array<{ value: any; label: string }>;
  onChange: (value: string) => void;
}> = ({ isClearable, placeholder, options, onChange }) => (
  <Select onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// Combobox component (simplified version)
const Combobox: React.FC<{
  placeholder?: string;
  options: Array<{ value: any; label: string }> | null;
  onChange: (value: string) => void;
  onPick: (value: any) => void;
}> = ({ placeholder, options, onChange, onPick }) => {
  const [value, setValue] = React.useState("");
  
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && options && options.length > 0) {
          const match = options.find(opt => 
            opt.label.toLowerCase().includes(value.toLowerCase())
          );
          if (match) {
            onPick(match.value);
          }
        }
      }}
    />
  );
};

// Text component with variants
const Text: React.FC<{
  label: string;
  variant?: "bold" | "regular" | "secondary";
}> = ({ label, variant = "regular" }) => {
  const className = {
    bold: "font-bold",
    regular: "font-normal",
    secondary: "text-muted-foreground"
  }[variant];
  
  return <span className={className}>{label}</span>;
};

// Link component
const Link: React.FC<{
  label: string;
  url: string;
  variant?: "link" | "primary" | "secondary" | "destructive";
  onClick: () => void;
}> = ({ label, url, variant = "link", onClick }) => (
  <Button
    variant={variant === "link" ? "link" : variant}
    onClick={onClick}
    asChild
  >
    <a href={url} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  </Button>
);

// Modified Button to match interface
const ModButton: React.FC<{
  label: string;
  isLoading: boolean;
  loadingLabel?: string;
  variant?: "primary" | "secondary" | "destructive";
  isDisabled: boolean;
  onClick: () => void;
}> = ({ label, isLoading, loadingLabel, variant = "primary", isDisabled, onClick }) => (
  <Button
    variant={variant}
    disabled={isDisabled || isLoading}
    onClick={onClick}
  >
    {isLoading ? (
      <>
        <Spinner style={{ width: "16px", height: "16px", marginRight: "8px" }} />
        {loadingLabel || label}
      </>
    ) : (
      label
    )}
  </Button>
);

const CircularProgress: React.FC = () => (
  <Spinner style={{ width: "24px", height: "24px" }} />
);

const HorizontalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-4">{children}</div>
);

const VerticalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-4">{children}</div>
);

// Modified Input to match interface
const ModInput: React.FC<{
  isClearable: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}> = ({ isClearable, placeholder, onChange, onSubmit }) => {
  const [value, setValue] = React.useState("");
  
  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit(value);
          }
        }}
      />
      {isClearable && value && (
        <button
          onClick={() => {
            setValue("");
            onChange("");
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Modified Textarea to match interface
const ModTextarea: React.FC<{
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}> = ({ placeholder, onChange, onSubmit }) => {
  const [value, setValue] = React.useState("");
  
  return (
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          onSubmit(value);
        }
      }}
    />
  );
};

// Custom Tabs wrapper
const ModTabs: React.FC<{
  children: React.ReactNode;
  values: string[];
  names: string[];
  onChange: (value: string) => void;
}> = ({ children, values, names, onChange }) => (
  <Tabs onValueChange={onChange} defaultValue={values[0]}>
    <TabsList>
      {names.map((name, index) => (
        <TabsTrigger key={values[index]} value={values[index]}>
          {name}
        </TabsTrigger>
      ))}
    </TabsList>
    {children}
  </Tabs>
);

// Image Grid List (simplified)
const ImageGridList: React.FC<{
  images: string[] | null;
  isLoading?: boolean;
  onPick: (value: string) => void;
}> = ({ images, isLoading, onPick }) => {
  if (isLoading) {
    return <CircularProgress />;
  }
  
  if (!images || images.length === 0) {
    return <div className="text-muted-foreground">No images available</div>;
  }
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onPick(image)}
          className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
        >
          <img
            src={image}
            alt={`Option ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

// Custom Dialog wrapper
const ModDialog: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
}> = ({ children, onClose }) => (
  <Dialog open onOpenChange={() => onClose()}>
    <DialogContent>
      {children}
    </DialogContent>
  </Dialog>
);

// Custom Alert wrapper
const ModAlert: React.FC<{
  title: string;
  description: string;
  variant: "success" | "error";
}> = ({ title, description, variant }) => (
  <Alert variant={variant === "error" ? "destructive" : "default"}>
    <strong>{title}</strong>
    <p>{description}</p>
  </Alert>
);

// Custom Avatar wrapper
const ModAvatar: React.FC<{
  src: string;
  size?: "sm" | "md" | "lg";
}> = ({ src, size = "md" }) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }[size];
  
  return (
    <Avatar className={sizeClass}>
      <img src={src} alt="" className="object-cover" />
    </Avatar>
  );
};

// Custom Card wrapper
const ModCard: React.FC<{
  imageSrc?: string;
  aspectRatio?: number;
  topLeftBadge?: string;
  topRightBadge?: string;
  bottomLeftBadge?: string;
  bottomRightBadge?: string;
  children: React.ReactNode;
  onClick: () => void;
}> = ({
  imageSrc,
  aspectRatio,
  topLeftBadge,
  topRightBadge,
  bottomLeftBadge,
  bottomRightBadge,
  children,
  onClick
}) => (
  <Card 
    className="cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
    onClick={onClick}
  >
    {imageSrc && (
      <div 
        className="w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageSrc})`,
          aspectRatio: aspectRatio || 'auto'
        }}
      />
    )}
    {topLeftBadge && (
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
        {topLeftBadge}
      </div>
    )}
    {topRightBadge && (
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
        {topRightBadge}
      </div>
    )}
    {bottomLeftBadge && (
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
        {bottomLeftBadge}
      </div>
    )}
    {bottomRightBadge && (
      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
        {bottomRightBadge}
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </Card>
);

// Export the renderers object that matches the expected interface
export const renderers = {
  Container,
  Video,
  Image,
  Select: ModSelect,
  Combobox,
  Text,
  Link,
  Button: ModButton,
  CircularProgress,
  HorizontalLayout,
  VerticalLayout,
  Input: ModInput,
  Textarea: ModTextarea,
  Tabs: ModTabs,
  ImageGridList,
  Dialog: ModDialog,
  Alert: ModAlert,
  Avatar: ModAvatar,
  Card: ModCard,
};

export type { Renderers } from "@mod-protocol/react";