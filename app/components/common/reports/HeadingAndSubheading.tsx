import React from 'react';
import clsx from "clsx";


interface Props {
    heading: string;
    subheading: string;
    className?: string
}
export default function HeadingAndSubheading({heading, subheading, className}: Props) {
  return (
    <div className={`flex flex-col justify-start ${clsx({  className })}`  }>
        <h1 className='text-xl md:text-2xl'>{heading} </h1>
        <p className="text-sm md:text-lg"> {subheading}</p>
    </div>
  )
}
