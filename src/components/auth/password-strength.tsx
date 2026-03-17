// @ts-nocheck
'use client';

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = score <= 1 ? 1 : score <= 2 ? 2 : score <= 3 ? 3 : 4;
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div>
      <div className="flex gap-1 mt-[7px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="str-bar"
            style={{ background: i <= level ? colors[level] : undefined }}
          />
        ))}
      </div>
      <div
        className="font-mono text-[10px] mt-1"
        style={{ color: colors[level] }}
      >
        {labels[level]}
      </div>
    </div>
  );
}

