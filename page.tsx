"use client";

import React from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { TextArea } from "@/ui/components/TextArea";

function JwtDecodeClarity2() {
  return (
    <DefaultPageLayout>
      <div className="flex w-full flex-col items-center gap-24 bg-default-background px-4 py-24">
        <div className="flex max-w-[768px] flex-col items-center justify-center gap-1">
          <span className="w-full text-heading-1 font-heading-1 text-default-font text-center">
            JWT Decoder
          </span>
          <span className="w-full text-body font-body text-subtext-color text-center">
            Decode and verify JSON Web Tokens with confidence
          </span>
        </div>
        <div className="flex w-full max-w-[1024px] flex-col items-start gap-6">
          <TextArea
            className="h-auto w-full flex-none shadow-lg border-2"
            label=""
            helpText=""
          >
            <TextArea.Input
              placeholder="Paste your JWT here"
              value=""
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {}}
            />
          </TextArea>
          <div className="flex w-full items-start">
            <span className="text-body font-body text-error-600">
              Invalid token format. Please ensure your token follows the JWT
              standard format (header.payload.signature).
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body font-body text-subtext-color">
              Or try one of these examples:
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4 shadow-lg cursor-pointer">
                <span className="text-body-bold font-body-bold text-brand-primary">
                  Standard Authentication Token
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  A typical authentication token with standard claims
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4 shadow-lg cursor-pointer">
                <span className="text-body-bold font-body-bold text-brand-primary">
                  Role-Based Access Token
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Contains role information for authorization purposes
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4 shadow-lg cursor-pointer">
                <span className="text-body-bold font-body-bold text-brand-primary">
                  Expired Token
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  A token that has already expired
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default JwtDecodeClarity2; 