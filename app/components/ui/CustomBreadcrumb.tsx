"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Crumb {
  label: string;
  href?: string; // If no href, then it's the current page
}

interface DynamicBreadcrumbProps {
  items: Crumb[];
}

function formatLabel(segment: string) {
  const firstWord = segment.split("-")[0]; // take only the first word
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
}

export function AutoBreadcrumb() {
  const pathname = usePathname(); // ex: "/reports-and-analysis/employee-performance/details"
  const segments = pathname.split("/").filter(Boolean);

  const paths = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/"); // full path up to this segment
    const label = formatLabel(segment);
    return { label, href };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {paths.map((item, i) => (
          <React.Fragment key={i}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === paths.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function CustomBreadcrumb({ items }: DynamicBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {/* Add separator except after the last item */}
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export interface BreadcrumbItemType {
  label: string;
  href?: string;
  onClick?: () => void;
}
export interface CustomBreadcrumbDynamicProps {
  features: BreadcrumbItemType[];
}

export const CustomBreadcrumbDynamic: React.FC<CustomBreadcrumbDynamicProps> = ({ features }) => {
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 12) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {features.map((item, index) => {
          const isLastItem = index === features.length - 1;
          
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.onClick ? (
                  <span
                    onClick={item.onClick}
                    className={`cursor-pointer text-gray-500 hover:text-gray-700 ${!isLastItem ? 'max-w-[100px] truncate' : ''}`}
                    title={!isLastItem ? item.label : undefined}
                  >
                    {!isLastItem ? truncateText(item.label) : item.label}
                  </span>
                ) : item.href ? (
                  <BreadcrumbLink 
                    href={item.href}
                    className={!isLastItem ? 'max-w-[100px] truncate' : ''}
                    title={!isLastItem ? item.label : undefined}
                  >
                    {!isLastItem ? truncateText(item.label) : item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage 
                    title={!isLastItem ? item.label : undefined}
                  >
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {index < features.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};