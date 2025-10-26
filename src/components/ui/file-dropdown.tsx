"use client";

import * as React from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Upload, File, FolderOpen, HardDrive } from "lucide-react";

interface FileDropdownProps {
  onFileSelect?: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const FileDropdown = React.forwardRef<
  HTMLButtonElement,
  FileDropdownProps
>(
  (
    {
      onFileSelect,
      accept,
      multiple = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect?.(e.target.files);
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const triggerFileInput = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          aria-hidden="true"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {children ? (
              children
            ) : (
              <Button
                ref={ref}
                variant="outline"
                disabled={disabled}
                className={className}
                {...props}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            )}
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={triggerFileInput}>
              <HardDrive className="mr-2 h-4 w-4" />
              <span>From Device</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={triggerFileInput}>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Browse Files</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={triggerFileInput}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Files</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

FileDropdown.displayName = "FileDropdown";

export { FileDropdown };
export type { FileDropdownProps };