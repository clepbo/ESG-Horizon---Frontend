"use client";

const SAFETY_CARDS = [
  {
    title: "Safety Management Systems",
    description:
      "Our safety management system is built on the 'Goal Zero' philosophy. Executive bonuses are directly tied to safety performance metrics (TRIR and Fatalities). We conduct regular safety audits and leadership safety walks to reinforce our safety culture.",
    tag: "Executive Pay Linked to Safety",
  },
];

export default function HumanStepTwo() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
      {SAFETY_CARDS.map((card) => (
        <SafetyCard
          key={card.title}
          title={card.title}
          description={card.description}
          tag={card.tag}
        />
      ))}
    </div>
  );
}

function SafetyCard({
  title,
  description,
  tag,
}: {
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <article
      className="flex flex-col rounded-xl p-4 shadow-sm sm:p-5 md:p-6"
      style={{ backgroundColor: "#FFF7ED" }}
    >
      <h3 className="text-base font-bold sm:text-lg md:text-xl" style={{ color: "#E0813D" }}>
        {title}
      </h3>
      <p
        className="mt-2 text-sm font-normal leading-relaxed sm:mt-3 sm:text-base md:mt-4"
        style={{ color: "#E0813D" }}
      >
        {description}
      </p>
      <span
        className="mt-3 inline-flex w-fit rounded-lg px-3 py-1.5 text-sm font-medium sm:mt-4 sm:px-4 sm:py-2 sm:text-base"
        style={{ backgroundColor: "#E0F7EB", color: "#52B788" }}
      >
        {tag}
      </span>
    </article>
  );
}
