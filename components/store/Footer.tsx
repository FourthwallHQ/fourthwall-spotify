export default function Footer() {
  return (
    <footer className="border-t border-[#282828] mt-20">
      <div className="max-w-[1955px] mx-auto px-8 py-12">
        <p className="text-xs text-gray-500 mb-6">
          By clicking "Buy it now" you will leave the Spotify service and be redirected to a third party's page. 
          Any activity on their page will be subject to their terms and conditions and privacy policy. They may provide 
          Spotify with your order details, which we may use to better understand your interests to improve our products 
          and offerings, in accordance with Spotify's Privacy Policy. Links and information about this item, including 
          pricing and currency, are from the merchandise seller and subject to change. Sellers may charge additional fees, 
          which may vary. While supplies last.
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Legal</a>
            <a href="#" className="hover:text-white transition">Privacy Center</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
            <a href="#" className="hover:text-white transition">About Ads</a>
          </div>
          <p>© 2025 Spotify AB</p>
        </div>
      </div>
    </footer>
  );
}
