import { Zap, Users, BadgeCheck } from "lucide-react";

export default function FeatureCard() {
  const features = [
    {
      icon: <Zap className="w-10 h-10 text-yellow-400" />,
      title: "Real-time Bidding",
      desc: "Live synchronization for seamless auction experiences across devices.",
    },
    {
      icon: <Users className="w-10 h-10 text-yellow-400" />,
      title: "Team Management",
      desc: "Comprehensive tools for franchise owners to manage squads and budgets.",
    },
    {
      icon: <BadgeCheck className="w-10 h-10 text-yellow-400" />,
      title: "Auto-Validation",
      desc: "Smart rules engine ensures all squads meet tournament criteria automatically.",
    },
  ];

  return (
    <section className="w-full bg-[#0A0F1C] py-20 px-6 flex justify-center">
      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg hover:scale-[1.03] transition-all"
          >
            <div className="text-yellow-400 text-3xl mb-4">{item.icon}</div>

            <h3 className="text-xl font-semibold text-white mb-3">
              {item.title}
            </h3>

            <p className="text-gray-300 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
