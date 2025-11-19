interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-lg text-red-400 mb-4">Error: {error}</p>
        <p className="text-sm text-gray-400">
          Failed to load store data. Please check your token and try again.
        </p>
      </div>
    </div>
  );
}
