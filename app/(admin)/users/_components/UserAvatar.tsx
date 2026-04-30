interface UserAvatarProps {
  firstName: string;
  lastName: string;
  color: string;
  size?: "sm" | "md";
}

function initials(first: string, last: string) {
  return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "?";
}

export default function UserAvatar({ firstName, lastName, color, size = "md" }: UserAvatarProps) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: `${color}1f`, color }}
      aria-hidden="true"
    >
      {initials(firstName, lastName)}
    </div>
  );
}
