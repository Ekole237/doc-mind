import React from 'react'
export interface ExpertisePillarsProps {
  sendMessage: (message: string) => void;
}
import { BookOpen, ShieldCheck, User } from "lucide-react";


const EXPERTISE_CATEGORIES = [
  {
    title: "RH & Carrière",
    icon: <User className="h-4 w-4 text-blue-500" />,
    questions: [
      "Quelle est la politique de télétravail ?",
      "Comment fonctionne l'évaluation annuelle ?",
      "Quelles sont les opportunités de formation ?",
    ],
  },
  {
    title: "Santé & Assurances",
    icon: <ShieldCheck className="h-4 w-4 text-green-500" />,
    questions: [
      "Détails de l'assurance médicale ?",
      "Comment demander un remboursement santé ?",
      "Couverture pour les soins dentaires ?",
    ],
  },
  {
    title: "Procédures Internes",
    icon: <BookOpen className="h-4 w-4 text-purple-500" />,
    questions: [
      "Procédure de demande de congé ?",
      "Comment déclarer ses notes de frais ?",
      "Convention collective applicable ?",
    ],
  },
];

const Expertisepillars: React.FC<ExpertisePillarsProps> = (
  {
    sendMessage
  }
) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {EXPERTISE_CATEGORIES.map((cat, i) => (
        <div
          key={i}
          className="flex flex-col space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm gsap-expertise"
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
              {cat.icon}
            </div>
            {cat.title}
          </div>
          <div className="flex flex-col gap-2">
            {cat.questions.map((q, j) => (
              <button
                key={j}
                onClick={() => sendMessage(q)}
                className="text-left text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1 hover:translate-x-1 duration-200"
              >
                • {q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


export default Expertisepillars;
