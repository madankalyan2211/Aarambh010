"use client";

import * as React from "react";
import { FileDropdownDemo } from "./FileDropdownDemo";
import { FileUploadExample } from "./FileUploadExample";

export function FileDropdownTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">File Dropdown Component</h1>
        <p className="text-muted-foreground mt-2">
          A customizable dropdown component for file selection
        </p>
      </div>
      
      <FileUploadExample />
      
      <div className="border-t pt-8">
        <FileDropdownDemo />
      </div>
    </div>
  );
}