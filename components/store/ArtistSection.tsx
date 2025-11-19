import { Collection } from '@/types/store';

interface ArtistSectionProps {
  collections: Collection[];
}

export default function ArtistSection({ collections }: ArtistSectionProps) {
  return (
    <div className="flex items-center gap-6 mb-12">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold">
        FW
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">Merch by</p>
        <h1 className="text-6xl font-bold">
          {collections.length > 0 ? collections[0].name : 'Fourthwall Store'}
        </h1>
      </div>
    </div>
  );
}

