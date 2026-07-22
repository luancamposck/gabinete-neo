// @/modules/auth/shared/ui/auth-background.tsx

/**
 * Fundo estático da tela de acesso. Substitui o antigo <Vortex> (canvas/rAF).
 * Puramente CSS: gradiente da marca (tokens `--auth-*`) + realce radial atrás
 * do card. Sem animação, então respeita `prefers-reduced-motion` por natureza,
 * e é consistente em todos os navegadores (o Vortex era desativado no Firefox).
 */
export const AuthBackground = () => {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(135deg,var(--auth-gradient-from),var(--auth-gradient-via)_45%,var(--auth-gradient-to))]">
			<div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_28%,var(--auth-glow),transparent_70%)]" />
		</div>
	)
}
