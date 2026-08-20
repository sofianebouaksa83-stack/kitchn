import React from "react";
import { ScrollShowcaseMobile } from "./ScrollShowcaseMobile";
import { ScrollShowcaseDesktop } from "./ScrollShowcaseDesktop";

export function ScrollShowcase() {
  return (
    <>
      <div className="block lg:hidden">
        <ScrollShowcaseMobile />
      </div>
      <div className="hidden lg:block">
        <ScrollShowcaseDesktop />
      </div>
    </>
  );
}
