'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const analysis = useMemo(() => {
    if (!password) return null;

    const result = zxcvbn(password);
    const hasMinLength = password.length >= 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let strength = result.score; // 0-4
    let label = 'Très faible';
    let color = 'red';

    if (strength === 1) {
      label = 'Faible';
      color = 'red';
    } else if (strength === 2) {
      label = 'Moyen';
      color = 'yellow';
    } else if (strength === 3) {
      label = 'Fort';
      color = 'green';
    } else if (strength === 4) {
      label = 'Très fort';
      color = 'green';
    }

    return {
      strength,
      label,
      color,
      requirements: {
        minLength: hasMinLength,
        uppercase: hasUppercase,
        number: hasNumber,
      },
    };
  }, [password]);

  if (!analysis) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bars */}
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              index < Math.ceil((analysis.strength + 1) / 2)
                ? analysis.color === 'red'
                  ? 'bg-red-500 dark:bg-red-400'
                  : analysis.color === 'yellow'
                  ? 'bg-yellow-500 dark:bg-yellow-400'
                  : 'bg-green-500 dark:bg-green-400'
                : 'bg-slate-200 dark:bg-zinc-800'
            )}
          />
        ))}
      </div>

      {/* Strength Label */}
      <p className="text-xs text-slate-600 dark:text-zinc-400">
        Force du password :{' '}
        <span
          className={cn(
            'font-medium',
            analysis.color === 'red' && 'text-red-600 dark:text-red-400',
            analysis.color === 'yellow' &&
              'text-yellow-600 dark:text-yellow-400',
            analysis.color === 'green' && 'text-green-600 dark:text-green-400'
          )}
        >
          {analysis.label}
        </span>
      </p>

      {/* Requirements List */}
      <div className="text-xs space-y-1">
        <RequirementItem met={analysis.requirements.minLength}>
          Au moins 12 caractères
        </RequirementItem>
        <RequirementItem met={analysis.requirements.uppercase}>
          Une lettre majuscule
        </RequirementItem>
        <RequirementItem met={analysis.requirements.number}>
          Un chiffre
        </RequirementItem>
      </div>
    </div>
  );
}

function RequirementItem({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-1.5',
        met
          ? 'text-green-600 dark:text-green-400'
          : 'text-slate-600 dark:text-zinc-400'
      )}
    >
      <CheckCircle2
        className={cn(
          'h-3.5 w-3.5',
          met
            ? 'text-green-600 dark:text-green-400'
            : 'text-slate-400 dark:text-zinc-600'
        )}
      />
      {children}
    </p>
  );
}
