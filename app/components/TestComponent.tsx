import React from "react";

export default function TestComponent() {
  return (
    <div className="flex w-full items-center justify-center h-screen">
      <div className="flex flex-col max-w-2xl my-20 gap-4 items-center justify-center w-full h-full">
        <h1 className="text-primary text-center"> Here is the test page</h1>

        <h4 className="text-secondary text-center">This is a secondary text</h4>
        <h4 className="text-tertiary text-center">This is a tertiary text</h4>
        <h5 className="text-green-600 text-center">
          text with color green 600
        </h5>

        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore aut
          delectus cumque deleniti nobis, similique quas commodi, veniam in,
          fuga quo esse velit officiis magni est hic modi inventore dignissimos
          vero? Dicta, esse a repudiandae quae odit perspiciatis inventore
          impedit enim fuga, unde, quas nam rem. Quis autem itaque dignissimos.
        </p>
      </div>
    </div>
  );
}
