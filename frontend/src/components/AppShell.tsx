import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './AppShell.css';

type PageShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
};

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  soft?: boolean;
};

type StatusKind = 'info' | 'error' | 'success';

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'ghost';
};

type GameShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  stepLabel?: string;
  progressLabel?: string;
  backTo?: string;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  subtitle,
  backTo,
  backLabel = 'Назад',
  className,
  children,
}: PageShellProps) {
  return (
    <div className={`page-shell ${className ?? ''}`.trim()}>
      <div className="page-shell__inner">
        {backTo && (
          <div className="page-shell__back">
            <Link className="app-button-ghost" to={backTo}>
              {backLabel}
            </Link>
          </div>
        )}
        <header className="page-shell__hero">
          {eyebrow && <div className="page-shell__eyebrow">{eyebrow}</div>}
          <h1 className="page-shell__title">{title}</h1>
          {subtitle && <p className="page-shell__subtitle">{subtitle}</p>}
        </header>
        <div className="page-shell__content">{children}</div>
      </div>
    </div>
  );
}

export function SurfaceCard({ soft = false, className, children, ...props }: SurfaceCardProps) {
  return (
    <div
      className={`surface-card ${soft ? 'surface-card--soft' : ''} ${className ?? ''}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-header">
      {label && <span className="section-header__label">{label}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function StatusMessage({
  kind = 'info',
  children,
}: {
  kind?: StatusKind;
  children: ReactNode;
}) {
  return <div className={`status-message status-message--${kind}`}>{children}</div>;
}

export function AppButton({ tone = 'primary', className, children, ...props }: AppButtonProps) {
  const toneClass =
    tone === 'primary'
      ? 'app-button'
      : tone === 'secondary'
        ? 'app-button-secondary'
        : 'app-button-ghost';

  return (
    <button className={`${toneClass} ${className ?? ''}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function GameShell({
  eyebrow = 'Мини-игра',
  title,
  subtitle,
  stepLabel,
  progressLabel,
  backTo = '/games',
  children,
}: GameShellProps) {
  return (
    <PageShell eyebrow={eyebrow} title={title} subtitle={subtitle} backTo={backTo} backLabel="К играм">
      <div className="game-shell__frame">
        {(stepLabel || progressLabel) && (
          <div className="game-shell__meta">
            {stepLabel && <div className="game-shell__meta-chip">{stepLabel}</div>}
            {progressLabel && <div className="game-shell__meta-chip">{progressLabel}</div>}
          </div>
        )}
        <div className="game-shell__content">{children}</div>
      </div>
    </PageShell>
  );
}
