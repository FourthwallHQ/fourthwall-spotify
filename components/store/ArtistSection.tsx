import { Collection } from '@/types/store';
import { useCart } from '@/contexts/CartContext';


export default function ArtistSection() {
  const { name } = useCart();
  return (
    <div className="flex items-center gap-6 mb-16">
      <div className="w-15 h-15 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
        FW
      </div>
      <div>
        <p className="text-md text-gray-400 font-bold mb-0.5">Merch by</p>
        <h1 className="text-4xl font-bold leading-tight">
          {name}
        </h1>
      </div>
    </div>
  );
}
