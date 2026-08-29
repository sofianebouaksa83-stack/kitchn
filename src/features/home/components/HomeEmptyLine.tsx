type HomeEmptyLineProps = {
  text: string;
};

export function HomeEmptyLine({
  text,
}: HomeEmptyLineProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
      {text}
    </div>
  );
}