type NavbarAvatarProps = {
  avatarUrl: string | null;
  fallback: string;
  size?: string;
};

export function NavbarAvatar({
  avatarUrl,
  fallback,
  size = "h-8 w-8",
}: NavbarAvatarProps) {
  return (
    <div
      className={[
        size,
        "rounded-full overflow-hidden bg-white/10",
        "ring-1 ring-white/10",
        "flex items-center justify-center shrink-0",
      ].join(" ")}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold text-white/70">
          {fallback.toUpperCase()}
        </span>
      )}
    </div>
  );
}