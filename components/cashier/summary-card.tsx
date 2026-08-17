type SummaryCardProps = {
  label: string;
  value: number;
};

export default function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
      <p className="text-sm font-bold uppercase tracking-wide">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}