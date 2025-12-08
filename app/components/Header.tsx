type Props = {
  brand: string;
  links: { label: string; href?: string }[];
  loginText: string;
};

export default function Header({ brand, links, loginText }: Props) {
  return (
    <header className="w-full bg-[#000814] text-white py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap2">
          <span className="text-yellow-400 text-xl">🏏</span>
          <span className="text-xl font-semibold tracking-wide">{brand}</span>
        </div>

        <nav className="flex items-center gap-8">
          {links.map((link, index) => (
            <a
              key={index}
              className="text-base hover:text-yellow-400 transition font-medium cursor-pointer"
              href={link.href ?? "#"}
            >
              {link.label}
            </a>
          ))}

          <button className="bg-yellow-400 text-black px-5 py-2 rounded-md font-semibold shadow hover:bg-yellow-500 transition">
            {loginText}
          </button>
        </nav>
      </div>
    </header>
  );
}
