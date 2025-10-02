"use client";

import { Sparkles } from "lucide-react";
import React, { useState } from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BannerProps {
  version: string;
}

export default function Banner({ version }: BannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      id="sticky-banner"
      className="top-0 left-0 z-[100] flex justify-between items-center w-full p-4 border-b-[0.1px] border-gray-700 bg-gray-800"
    >
      <Link
        href="/"
        className="flex items-center text-white hover:text-blue-500 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        <span className="font-medium">Back to Versions</span>
      </Link>

      <div className="flex items-center ">
        <p className="flex items-center text-sm font-normal text-white ">
          <span className="inline-flex me-3 bg-blue-500 rounded-full w-8 h-8 items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
            <span className="sr-only">Sparkles icon</span>
          </span>
          <span className="font-medium">
            Version:{" "}
            <span className="inline font-bold text-blue-500  decoration-blue-500 decoration-solid">
              {version}
            </span>{" "}
            - We hope you enjoy using the Editor.
          </span>
        </p>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        type="button"
        className="text-gray-400 hover:text-gray-200 transition-colors"
        aria-label="Close banner"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
